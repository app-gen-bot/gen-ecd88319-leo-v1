"""Sprint context management for incremental development.

This module provides data structures and utilities for managing sprint-based
development where each sprint builds incrementally on previous sprints.
"""

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from enum import Enum


class SprintStatus(str, Enum):
    """Status of a sprint build."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DEPLOYED = "deployed"
    FAILED = "failed"


@dataclass
class SprintFeature:
    """A feature to be implemented in a sprint."""
    name: str
    description: str
    user_story: str
    acceptance_criteria: List[str]
    priority: str  # P0, P1, P2
    estimated_effort: str  # S, M, L, XL


@dataclass 
class SprintSummary:
    """Summary of a completed sprint."""
    sprint_number: int
    theme: str
    duration: str
    features_implemented: List[str]
    key_components: List[str]  # Major code components added
    api_endpoints: List[str]  # API endpoints created
    database_changes: List[str]  # Schema changes made
    deployment_url: Optional[str] = None
    completion_date: Optional[datetime] = None
    total_cost: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        if self.completion_date:
            data['completion_date'] = self.completion_date.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SprintSummary':
        """Create from dictionary."""
        if data.get('completion_date'):
            data['completion_date'] = datetime.fromisoformat(data['completion_date'])
        return cls(**data)


@dataclass
class SprintContext:
    """Context for building a specific sprint."""
    sprint_number: int
    total_sprints: int
    sprint_theme: str
    sprint_duration: str
    features_to_implement: List[SprintFeature]
    previous_sprints: List[SprintSummary] = field(default_factory=list)
    existing_code_base: Optional[Path] = None
    sprint_breakdown_path: Optional[Path] = None
    
    @property
    def is_first_sprint(self) -> bool:
        """Check if this is the first sprint (MVP)."""
        return self.sprint_number == 1
    
    @property
    def has_existing_code(self) -> bool:
        """Check if there's existing code from previous sprints."""
        return self.existing_code_base is not None and self.existing_code_base.exists()
    
    def get_previous_features(self) -> List[str]:
        """Get all features implemented in previous sprints."""
        features = []
        for sprint in self.previous_sprints:
            features.extend(sprint.features_implemented)
        return features
    
    def get_all_api_endpoints(self) -> List[str]:
        """Get all API endpoints from previous sprints."""
        endpoints = []
        for sprint in self.previous_sprints:
            endpoints.extend(sprint.api_endpoints)
        return endpoints
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'sprint_number': self.sprint_number,
            'total_sprints': self.total_sprints,
            'sprint_theme': self.sprint_theme,
            'sprint_duration': self.sprint_duration,
            'features_to_implement': [asdict(f) for f in self.features_to_implement],
            'previous_sprints': [s.to_dict() for s in self.previous_sprints],
            'existing_code_base': str(self.existing_code_base) if self.existing_code_base else None,
            'sprint_breakdown_path': str(self.sprint_breakdown_path) if self.sprint_breakdown_path else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SprintContext':
        """Create from dictionary."""
        # Convert features
        features = [SprintFeature(**f) for f in data.get('features_to_implement', [])]
        
        # Convert previous sprints
        previous = [SprintSummary.from_dict(s) for s in data.get('previous_sprints', [])]
        
        # Convert paths
        existing_code = Path(data['existing_code_base']) if data.get('existing_code_base') else None
        breakdown_path = Path(data['sprint_breakdown_path']) if data.get('sprint_breakdown_path') else None
        
        return cls(
            sprint_number=data['sprint_number'],
            total_sprints=data['total_sprints'],
            sprint_theme=data['sprint_theme'],
            sprint_duration=data['sprint_duration'],
            features_to_implement=features,
            previous_sprints=previous,
            existing_code_base=existing_code,
            sprint_breakdown_path=breakdown_path
        )


def parse_sprint_breakdown(breakdown_path: Path, sprint_number: int) -> Optional[SprintContext]:
    """Parse sprint breakdown document to extract context for a specific sprint.
    
    Args:
        breakdown_path: Path to the sprints_breakdown.md file
        sprint_number: Which sprint to extract context for
        
    Returns:
        SprintContext or None if parsing fails
    """
    if not breakdown_path.exists():
        return None
    
    content = breakdown_path.read_text()
    lines = content.split('\n')
    
    # Extract total sprints from executive summary
    total_sprints = 3  # Default
    for line in lines[:20]:  # Check first 20 lines
        if 'Total Sprints:' in line:
            try:
                total_sprints = int(line.split(':')[1].strip())
            except:
                pass
            break
    
    # Find the sprint section
    sprint_section_start = -1
    sprint_theme = f"Sprint {sprint_number}"
    sprint_duration = "8 weeks"
    
    for i, line in enumerate(lines):
        if f"## Sprint {sprint_number}:" in line:
            sprint_section_start = i
            # Extract theme from the header
            if ':' in line:
                sprint_theme = line.split(':', 1)[1].strip()
            break
    
    if sprint_section_start == -1:
        return None
    
    # Extract duration
    for i in range(sprint_section_start, min(sprint_section_start + 5, len(lines))):
        if 'Duration' in lines[i]:
            if ':' in lines[i]:
                sprint_duration = lines[i].split(':', 1)[1].strip()
            break
    
    # Extract features
    features = []
    in_features_section = False
    current_feature = None
    
    for i in range(sprint_section_start, len(lines)):
        line = lines[i].strip()
        
        # Stop at next sprint
        if i > sprint_section_start and f"## Sprint {sprint_number + 1}:" in line:
            break
        
        # Detect features section
        if 'Features' in line and ('###' in line or '##' in line):
            in_features_section = True
            continue
        
        # End of features section
        if in_features_section and line.startswith('##'):
            break
        
        # Parse feature
        if in_features_section and line:
            # New feature (numbered or bulleted)
            if (line[0].isdigit() and '.' in line[:3]) or line.startswith('- '):
                if current_feature:
                    features.append(current_feature)
                
                # Extract feature name
                feature_name = line.lstrip('0123456789.- ').strip()
                if '**' in feature_name:
                    feature_name = feature_name.replace('**', '').strip()
                
                current_feature = SprintFeature(
                    name=feature_name,
                    description="",
                    user_story="",
                    acceptance_criteria=[],
                    priority="P0" if sprint_number == 1 else "P1",
                    estimated_effort="M"
                )
            
            # Feature details
            elif current_feature:
                if 'Description:' in line:
                    current_feature.description = line.split(':', 1)[1].strip()
                elif 'User Story:' in line:
                    current_feature.user_story = line.split(':', 1)[1].strip()
                elif line.startswith('- [ ]'):
                    current_feature.acceptance_criteria.append(line[5:].strip())
    
    # Add last feature
    if current_feature:
        features.append(current_feature)
    
    return SprintContext(
        sprint_number=sprint_number,
        total_sprints=total_sprints,
        sprint_theme=sprint_theme,
        sprint_duration=sprint_duration,
        features_to_implement=features,
        sprint_breakdown_path=breakdown_path
    )


def build_sprint_context_with_history(
    sprint_number: int,
    breakdown_path: Path,
    previous_sprint_paths: List[Path]
) -> Optional[SprintContext]:
    """Build sprint context including history from previous sprints.
    
    Args:
        sprint_number: Current sprint number
        breakdown_path: Path to sprint breakdown document
        previous_sprint_paths: List of paths to previous sprint directories
        
    Returns:
        Complete SprintContext with history
    """
    # Parse current sprint
    context = parse_sprint_breakdown(breakdown_path, sprint_number)
    if not context:
        return None
    
    # Add previous sprint summaries
    for sprint_path in previous_sprint_paths:
        summary = extract_sprint_summary(sprint_path)
        if summary:
            context.previous_sprints.append(summary)
    
    # Set existing code base (last sprint)
    if previous_sprint_paths:
        context.existing_code_base = previous_sprint_paths[-1]
    
    return context


def extract_sprint_summary(sprint_path: Path) -> Optional[SprintSummary]:
    """Extract summary from a completed sprint directory.
    
    Args:
        sprint_path: Path to sprint app directory
        
    Returns:
        SprintSummary or None
    """
    # This is a placeholder - would need to analyze the actual sprint
    # For now, return a basic summary
    if not sprint_path.exists():
        return None
    
    # Extract sprint number from path
    sprint_num = 1
    if 'sprint' in str(sprint_path).lower():
        try:
            # Try to extract number after 'sprint'
            parts = str(sprint_path).lower().split('sprint')
            if len(parts) > 1:
                num_str = ''.join(c for c in parts[1] if c.isdigit())
                if num_str:
                    sprint_num = int(num_str)
        except:
            pass
    
    return SprintSummary(
        sprint_number=sprint_num,
        theme=f"Sprint {sprint_num} Implementation",
        duration="Completed",
        features_implemented=["Features from sprint breakdown"],
        key_components=["Components added in this sprint"],
        api_endpoints=["API endpoints created"],
        database_changes=["Schema changes made"],
        completion_date=datetime.now()
    )