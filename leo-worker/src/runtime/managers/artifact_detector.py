"""
Artifact Detector - Detect GitHub and Fly.io deployments from generated app

Checks for:
- GitHub: .git/config with remote origin URL
- Fly.io: fly.toml with app name
"""

import os
import re
from pathlib import Path
from typing import Optional
from dataclasses import dataclass


@dataclass
class DeploymentArtifacts:
    """Detected deployment artifacts from generated app"""
    github_url: Optional[str] = None
    flyio_app_name: Optional[str] = None
    flyio_url: Optional[str] = None


def detect_github_remote(app_path: str) -> Optional[str]:
    """
    Detect GitHub remote URL from .git/config

    Returns:
        GitHub URL (https://github.com/user/repo) or None
    """
    git_config = Path(app_path) / ".git" / "config"

    if not git_config.exists():
        return None

    try:
        content = git_config.read_text()

        # Match: url = https://github.com/user/repo.git
        # Or:    url = git@github.com:user/repo.git
        https_match = re.search(r'url\s*=\s*(https://github\.com/[^\s]+)', content)
        if https_match:
            url = https_match.group(1)
            # Remove .git suffix if present
            return url.rstrip('.git')

        ssh_match = re.search(r'url\s*=\s*git@github\.com:([^\s]+)', content)
        if ssh_match:
            repo_path = ssh_match.group(1).rstrip('.git')
            return f"https://github.com/{repo_path}"

        return None

    except Exception:
        return None


def detect_flyio_deployment(app_path: str) -> tuple[Optional[str], Optional[str]]:
    """
    Detect Fly.io deployment from fly.toml

    Returns:
        Tuple of (app_name, fly_url) or (None, None)
    """
    fly_toml = Path(app_path) / "fly.toml"

    if not fly_toml.exists():
        return None, None

    try:
        content = fly_toml.read_text()

        # Match: app = "my-app-name" or app = 'my-app-name'
        match = re.search(r'app\s*=\s*["\']([^"\']+)["\']', content)
        if match:
            app_name = match.group(1)
            fly_url = f"https://{app_name}.fly.dev"
            return app_name, fly_url

        return None, None

    except Exception:
        return None, None


def detect_all_artifacts(app_path: str) -> DeploymentArtifacts:
    """
    Detect all deployment artifacts from generated app

    Args:
        app_path: Path to generated app directory

    Returns:
        DeploymentArtifacts with detected URLs
    """
    github_url = detect_github_remote(app_path)
    flyio_app_name, flyio_url = detect_flyio_deployment(app_path)

    return DeploymentArtifacts(
        github_url=github_url,
        flyio_app_name=flyio_app_name,
        flyio_url=flyio_url
    )


# Example usage
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python artifact_detector.py <app_path>")
        sys.exit(1)

    app_path = sys.argv[1]
    artifacts = detect_all_artifacts(app_path)

    print(f"GitHub URL: {artifacts.github_url or 'Not found'}")
    print(f"Fly.io App: {artifacts.flyio_app_name or 'Not found'}")
    print(f"Fly.io URL: {artifacts.flyio_url or 'Not found'}")
