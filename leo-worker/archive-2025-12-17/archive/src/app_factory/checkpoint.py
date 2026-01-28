"""
Checkpoint system for pipeline execution.

Provides ability to save and resume pipeline execution state,
preventing duplicate work when restarting failed runs.
"""

import json
import asyncio
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Literal
from enum import Enum

import logging

logger = logging.getLogger(__name__)


class StageStatus(str, Enum):
    """Status of a pipeline stage."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class StageCheckpoint:
    """Checkpoint for a single stage execution."""
    stage_name: str
    status: StageStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    cost: float = 0.0
    iterations: int = 0
    outputs: Dict[str, str] = field(default_factory=dict)  # file paths
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        # Convert datetime objects to strings
        if self.start_time:
            data['start_time'] = self.start_time.isoformat()
        if self.end_time:
            data['end_time'] = self.end_time.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'StageCheckpoint':
        """Create from dictionary."""
        # Convert string timestamps back to datetime
        if data.get('start_time'):
            data['start_time'] = datetime.fromisoformat(data['start_time'])
        if data.get('end_time'):
            data['end_time'] = datetime.fromisoformat(data['end_time'])
        # Convert status string to enum
        data['status'] = StageStatus(data['status'])
        return cls(**data)


@dataclass
class PipelineCheckpoint:
    """Complete pipeline execution state."""
    checkpoint_id: str
    app_name: str
    user_prompt: str
    created_at: datetime
    updated_at: datetime
    stages: Dict[str, StageCheckpoint]
    total_cost: float = 0.0
    
    def save(self, checkpoint_dir: Path) -> Path:
        """Save checkpoint to disk."""
        checkpoint_dir.mkdir(parents=True, exist_ok=True)
        checkpoint_file = checkpoint_dir / f"{self.checkpoint_id}.json"
        
        # Update timestamp
        self.updated_at = datetime.now()
        
        # Convert to dict for JSON serialization
        data = {
            'checkpoint_id': self.checkpoint_id,
            'app_name': self.app_name,
            'user_prompt': self.user_prompt,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'stages': {name: stage.to_dict() for name, stage in self.stages.items()},
            'total_cost': self.total_cost
        }
        
        with open(checkpoint_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Saved checkpoint to {checkpoint_file}")
        return checkpoint_file
    
    @classmethod
    def load(cls, checkpoint_file: Path) -> 'PipelineCheckpoint':
        """Load checkpoint from disk."""
        with open(checkpoint_file, 'r') as f:
            data = json.load(f)
        
        # Convert timestamps
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        
        # Convert stage dicts to StageCheckpoint objects
        data['stages'] = {
            name: StageCheckpoint.from_dict(stage_data)
            for name, stage_data in data['stages'].items()
        }
        
        return cls(**data)
    
    def get_next_stage(self) -> Optional[str]:
        """Get the next stage to run based on current state."""
        stage_order = ['prd', 'interaction_spec', 'wireframe']
        
        for stage_name in stage_order:
            if stage_name in self.stages:
                stage = self.stages[stage_name]
                if stage.status in [StageStatus.NOT_STARTED, StageStatus.FAILED]:
                    return stage_name
                elif stage.status == StageStatus.IN_PROGRESS:
                    # Resume in-progress stage
                    return stage_name
        
        return None  # All stages complete
    
    def update_stage(
        self,
        stage_name: str,
        status: Optional[StageStatus] = None,
        cost: Optional[float] = None,
        outputs: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ):
        """Update a stage's checkpoint data."""
        if stage_name not in self.stages:
            logger.error(f"Stage {stage_name} not found in checkpoint")
            return
        
        stage = self.stages[stage_name]
        
        if status:
            stage.status = status
            if status == StageStatus.IN_PROGRESS and not stage.start_time:
                stage.start_time = datetime.now()
            elif status in [StageStatus.COMPLETED, StageStatus.FAILED]:
                stage.end_time = datetime.now()
        
        if cost is not None:
            stage.cost = cost
            # Update total cost
            self.total_cost = sum(s.cost for s in self.stages.values())
        
        if outputs:
            stage.outputs.update(outputs)
        
        if metadata:
            stage.metadata.update(metadata)
        
        if error:
            stage.error = error
    
    def can_resume(self) -> bool:
        """Check if checkpoint is in resumable state."""
        # Can resume if any stage is not completed
        return any(
            stage.status != StageStatus.COMPLETED
            for stage in self.stages.values()
        )


class CheckpointManager:
    """Utilities for managing checkpoints."""
    
    def __init__(self, checkpoint_dir: Path = Path("checkpoints")):
        self.checkpoint_dir = checkpoint_dir
        self.checkpoint_dir.mkdir(exist_ok=True)
    
    def create_checkpoint(self, app_name: str, user_prompt: str) -> PipelineCheckpoint:
        """Create a new checkpoint."""
        checkpoint_id = f"pipeline_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        checkpoint = PipelineCheckpoint(
            checkpoint_id=checkpoint_id,
            app_name=app_name,
            user_prompt=user_prompt,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            stages={
                "prd": StageCheckpoint("prd", StageStatus.NOT_STARTED),
                "interaction_spec": StageCheckpoint("interaction_spec", StageStatus.NOT_STARTED),
                "wireframe": StageCheckpoint("wireframe", StageStatus.NOT_STARTED),
            }
        )
        
        checkpoint.save(self.checkpoint_dir)
        return checkpoint
    
    def load_checkpoint(self, checkpoint_id: str) -> Optional[PipelineCheckpoint]:
        """Load checkpoint by ID."""
        checkpoint_file = self.checkpoint_dir / f"{checkpoint_id}.json"
        if not checkpoint_file.exists():
            logger.error(f"Checkpoint {checkpoint_id} not found")
            return None
        
        return PipelineCheckpoint.load(checkpoint_file)
    
    def find_latest_checkpoint(self, app_name: str) -> Optional[PipelineCheckpoint]:
        """Find the most recent checkpoint for an app."""
        candidates = []
        
        for checkpoint_file in self.checkpoint_dir.glob("*.json"):
            try:
                checkpoint = PipelineCheckpoint.load(checkpoint_file)
                if checkpoint.app_name == app_name:
                    candidates.append(checkpoint)
            except Exception as e:
                logger.error(f"Error loading checkpoint {checkpoint_file}: {e}")
        
        if candidates:
            # Return most recently updated
            return max(candidates, key=lambda x: x.updated_at)
        
        return None
    
    def list_checkpoints(self, app_name: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """List all checkpoints, optionally filtered by app."""
        checkpoints = {}
        
        for checkpoint_file in self.checkpoint_dir.glob("*.json"):
            try:
                checkpoint = PipelineCheckpoint.load(checkpoint_file)
                if app_name and checkpoint.app_name != app_name:
                    continue
                
                checkpoints[checkpoint.checkpoint_id] = {
                    'app_name': checkpoint.app_name,
                    'created_at': checkpoint.created_at.isoformat(),
                    'updated_at': checkpoint.updated_at.isoformat(),
                    'can_resume': checkpoint.can_resume(),
                    'stages': {
                        name: {
                            'status': stage.status,
                            'cost': stage.cost
                        }
                        for name, stage in checkpoint.stages.items()
                    },
                    'total_cost': checkpoint.total_cost
                }
            except Exception as e:
                logger.error(f"Error loading checkpoint {checkpoint_file}: {e}")
        
        return checkpoints
    
    def cleanup_old_checkpoints(self, days: int = 7):
        """Remove checkpoints older than N days."""
        cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)
        
        for checkpoint_file in self.checkpoint_dir.glob("*.json"):
            if checkpoint_file.stat().st_mtime < cutoff:
                logger.info(f"Removing old checkpoint: {checkpoint_file}")
                checkpoint_file.unlink()