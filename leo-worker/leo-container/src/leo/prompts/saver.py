"""
Prompt saver for Leo generation prompts.

Saves prompts to leo-artifacts/prompts/ with timestamps for audit trail.
"""

import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


class PromptSaver:
    """
    Saves generation prompts to the artifacts directory.

    Directory structure:
        leo-artifacts/prompts/
            YYYY-MM-DD-HH-MM-SS-initial.md
            YYYY-MM-DD-HH-MM-SS-iteration-1.md
            YYYY-MM-DD-HH-MM-SS-iteration-2.md
            ...
    """

    def __init__(self, workspace: str):
        """
        Initialize prompt saver.

        Args:
            workspace: Workspace root directory (contains leo-artifacts/)

        Raises:
            FileNotFoundError: If prompts directory doesn't exist (workspace setup failed)
        """
        self.workspace = workspace
        self.prompts_dir = Path(workspace) / "leo-artifacts" / "prompts"

        # Verify prompts directory exists (should be created during workspace setup)
        # If it doesn't exist, workspace initialization failed - this is fatal
        if not self.prompts_dir.exists():
            raise FileNotFoundError(
                f"Prompts directory does not exist: {self.prompts_dir}. "
                f"Workspace setup may have failed. Check that {workspace}/leo-artifacts/ is writable."
            )
        logger.info(f"PromptSaver initialized: {self.prompts_dir}")

    def _generate_filename(self, prompt_type: str, iteration: Optional[int] = None) -> str:
        """
        Generate timestamped filename for prompt.

        Args:
            prompt_type: Type of prompt (initial, iteration, etc.)
            iteration: Iteration number (for iteration prompts)

        Returns:
            Filename like YYYY-MM-DD-HH-MM-SS-initial.md
        """
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        if iteration is not None:
            return f"{timestamp}-{prompt_type}-{iteration}.md"
        return f"{timestamp}-{prompt_type}.md"

    def save_initial_prompt(
        self,
        prompt: str,
        mode: str,
        app_name: Optional[str] = None,
        app_path: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Path:
        """
        Save the initial generation prompt.

        Args:
            prompt: The user's prompt text
            mode: Generation mode (autonomous/confirm_first)
            app_name: Name of new app (if new generation)
            app_path: Path to existing app (if resume)
            attachments: List of attachment metadata
            metadata: Additional metadata to include

        Returns:
            Path to saved prompt file
        """
        filename = self._generate_filename("initial")
        filepath = self.prompts_dir / filename

        content = self._format_prompt_markdown(
            prompt=prompt,
            prompt_type="Initial Generation",
            mode=mode,
            app_name=app_name,
            app_path=app_path,
            attachments=attachments,
            metadata=metadata
        )

        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Saved initial prompt: {filepath}")
        return filepath

    def save_iteration_prompt(
        self,
        prompt: str,
        iteration: int,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Path:
        """
        Save an iteration prompt.

        Args:
            prompt: The iteration prompt text
            iteration: Iteration number (1-based)
            metadata: Additional metadata to include

        Returns:
            Path to saved prompt file
        """
        filename = self._generate_filename("iteration", iteration)
        filepath = self.prompts_dir / filename

        content = self._format_prompt_markdown(
            prompt=prompt,
            prompt_type=f"Iteration {iteration}",
            metadata=metadata
        )

        filepath.write_text(content, encoding="utf-8")
        logger.info(f"Saved iteration {iteration} prompt: {filepath}")
        return filepath

    def _format_prompt_markdown(
        self,
        prompt: str,
        prompt_type: str,
        mode: Optional[str] = None,
        app_name: Optional[str] = None,
        app_path: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Format prompt as markdown document.

        Args:
            prompt: The prompt text
            prompt_type: Type label (Initial Generation, Iteration N, etc.)
            mode: Generation mode
            app_name: App name (for new apps)
            app_path: App path (for resume)
            attachments: Attachment metadata list
            metadata: Additional metadata

        Returns:
            Formatted markdown string
        """
        lines = [
            f"# {prompt_type} Prompt",
            "",
            f"**Timestamp:** {datetime.now().isoformat()}",
        ]

        if mode:
            lines.append(f"**Mode:** {mode}")
        if app_name:
            lines.append(f"**App Name:** {app_name}")
        if app_path:
            lines.append(f"**App Path:** {app_path}")

        if metadata:
            lines.append("")
            lines.append("## Metadata")
            lines.append("")
            for key, value in metadata.items():
                lines.append(f"- **{key}:** {value}")

        if attachments:
            lines.append("")
            lines.append("## Attachments")
            lines.append("")
            for att in attachments:
                att_name = att.get("name", att.get("filename", "unknown"))
                att_type = att.get("type", att.get("content_type", "unknown"))
                lines.append(f"- {att_name} ({att_type})")

        lines.append("")
        lines.append("## Prompt")
        lines.append("")
        lines.append(prompt)
        lines.append("")

        return "\n".join(lines)


def save_prompt(
    workspace: str,
    prompt: str,
    prompt_type: str = "initial",
    iteration: Optional[int] = None,
    **kwargs
) -> Optional[Path]:
    """
    Convenience function to save a prompt.

    Args:
        workspace: Workspace root directory
        prompt: The prompt text
        prompt_type: Type of prompt (initial, iteration)
        iteration: Iteration number (for iteration prompts)
        **kwargs: Additional arguments passed to save method

    Returns:
        Path to saved file, or None if save failed
    """
    try:
        saver = PromptSaver(workspace)
        if prompt_type == "initial":
            return saver.save_initial_prompt(prompt, **kwargs)
        elif prompt_type == "iteration" and iteration is not None:
            return saver.save_iteration_prompt(prompt, iteration, **kwargs)
        else:
            logger.warning(f"Unknown prompt_type: {prompt_type}")
            return None
    except Exception as e:
        logger.error(f"Failed to save prompt: {e}")
        return None
