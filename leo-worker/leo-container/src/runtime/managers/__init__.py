"""Managers for Git and artifact detection"""

# S3 removed - Git is the source of truth for versioning and state
# from .s3_manager import S3Manager
from .artifact_detector import detect_all_artifacts, DeploymentArtifacts
from .git_manager import GitManager, GitHubRepo, push_to_github

__all__ = [
    'detect_all_artifacts',
    'DeploymentArtifacts',
    'GitManager',
    'GitHubRepo',
    'push_to_github',
]
