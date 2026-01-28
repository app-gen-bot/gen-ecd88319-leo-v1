"""
Git Manager for pushing generated apps to GitHub.

Creates private repos under bot account and pushes generated code.
"""

import os
import subprocess
import shutil
import structlog
from dataclasses import dataclass
from typing import Optional
from github import Github, GithubException

logger = structlog.get_logger(__name__)


@dataclass
class GitHubRepo:
    """GitHub repository information."""
    url: str  # https://github.com/owner/repo
    clone_url: str  # https://github.com/owner/repo.git
    name: str


class GitManager:
    """
    Manages GitHub repository creation and code pushing.

    Repo creation rules:
    - Only create repos for our bot account (app-gen-bot)
    - Only create for new generations (not resume)
    - If repo already exists, reuse it

    Usage:
        git_manager = GitManager()
        if git_manager.is_enabled():
            repo = git_manager.create_repo_and_push(
                app_path="/workspace/app",  # App at /workspace/app per CONTAINER-STRUCTURE.md
                app_id="7c9e6679-7425-40de-944b-e07fc1f90ae7",
                user_id="jake"
            )
            print(f"Pushed to: {repo.url}")
    """

    # Our bot account - only create repos under this owner
    # Note: This must match the account that owns GITHUB_BOT_TOKEN
    BOT_USERNAME = 'app-gen-bot'

    def __init__(self, token: Optional[str] = None, owner: Optional[str] = None):
        """
        Initialize GitManager.

        Args:
            token: GitHub token. Defaults to GITHUB_BOT_TOKEN env var.
            owner: GitHub owner/org for repos. Defaults to GITHUB_OWNER env var or bot account.
        """
        self.token = token or os.environ.get('GITHUB_BOT_TOKEN')
        self.owner = owner or os.environ.get('GITHUB_OWNER', self.BOT_USERNAME)
        self.is_resume = os.environ.get('IS_RESUME', 'false').lower() == 'true'
        self.github: Optional[Github] = None

        if self.token:
            self.github = Github(self.token)
            logger.info("git_manager.initialized",
                       owner=self.owner,
                       is_bot_account=(self.owner == self.BOT_USERNAME),
                       is_resume=self.is_resume)

    def is_enabled(self) -> bool:
        """Check if GitHub integration is enabled."""
        return self.github is not None

    def init_repo_for_generation(
        self,
        app_dir: str,
        app_id: str,
        user_id: str,
    ) -> Optional[GitHubRepo]:
        """
        Initialize GitHub repo and local git BEFORE generation starts.

        This allows the agent to commit and push throughout generation,
        providing incremental visibility and crash resilience.

        Args:
            app_dir: Local directory for the app (will be created if needed)
            app_id: App UUID
            user_id: User UUID

        Returns:
            GitHubRepo if successful, None if GitHub not configured
        """
        if not self.github:
            logger.info("git_manager.init_skipped", reason="GitHub not configured")
            return None

        # Generate repo name
        repo_name = self._generate_repo_name(user_id, app_id)
        logger.info("git_manager.init_repo_for_generation", repo_name=repo_name, app_dir=app_dir)

        try:
            # Step 1: Create GitHub repository (or get existing)
            repo = self._create_repository(repo_name)
            logger.info("git_manager.repo_ready", url=repo.url)

            # Step 2: Create local directory if needed
            os.makedirs(app_dir, exist_ok=True)

            # Step 3: Initialize local git
            git_dir = os.path.join(app_dir, '.git')
            if not os.path.exists(git_dir):
                self._run_git(app_dir, ['git', 'init'])

            # Step 4: Configure git user
            self._run_git(app_dir, ['git', 'config', 'user.email', 'leo-bot@app-gen-saas.com'])
            self._run_git(app_dir, ['git', 'config', 'user.name', 'Leo App Generator'])

            # Step 5: Set up remote
            auth_url = self._get_authenticated_url(repo.clone_url)
            remote_result = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'],
                cwd=app_dir,
                capture_output=True,
                text=True
            )
            if remote_result.returncode != 0:
                self._run_git(app_dir, ['git', 'remote', 'add', 'origin', auth_url])
            else:
                self._run_git(app_dir, ['git', 'remote', 'set-url', 'origin', auth_url])

            # Step 6: Create initial commit with .gitignore
            gitignore_path = os.path.join(app_dir, '.gitignore')
            if not os.path.exists(gitignore_path):
                with open(gitignore_path, 'w') as f:
                    f.write("node_modules/\n.env.local\n*.log\n.DS_Store\n")

            # Check if there's anything to commit
            status = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=app_dir,
                capture_output=True,
                text=True
            )
            if status.stdout.strip():
                self._run_git(app_dir, ['git', 'add', '.'])
                self._run_git(app_dir, ['git', 'commit', '-m', 'Initial commit: Leo generation starting'])
                self._run_git(app_dir, ['git', 'branch', '-M', 'main'])
                self._run_git(app_dir, ['git', 'push', '-u', 'origin', 'main', '--force'])
                logger.info("git_manager.initial_push_complete", url=repo.url)
            else:
                # Try to set up tracking even without initial commit
                self._run_git(app_dir, ['git', 'branch', '-M', 'main'])
                logger.info("git_manager.repo_configured", url=repo.url)

            return repo

        except Exception as e:
            logger.error("git_manager.init_error", error=str(e), repo_name=repo_name)
            # Non-fatal - generation can continue without GitHub
            return None

    def init_artifacts_repo(
        self,
        workspace_dir: str,
        app_id: str,
        user_id: str,
    ) -> Optional[GitHubRepo]:
        """
        Initialize GitHub repo for artifacts at workspace root.

        Creates a repo at /workspace/ that tracks:
        - changelog/ - Generation changelog files
        - summary_changes/ - Concise summaries for reprompter
        - leo-artifacts/ - Internal logs, state, sessions

        The app/ directory is excluded via .gitignore (it's a separate repo).

        Args:
            workspace_dir: Workspace root directory (e.g., /workspace)
            app_id: App UUID
            user_id: User UUID

        Returns:
            GitHubRepo if successful, None if GitHub not configured
        """
        if not self.github:
            logger.info("git_manager.artifacts_init_skipped", reason="GitHub not configured")
            return None

        # Generate repo name with -artifacts suffix
        repo_name = self._generate_repo_name(user_id, app_id, suffix="-artifacts")
        logger.info("git_manager.init_artifacts_repo", repo_name=repo_name, workspace_dir=workspace_dir)

        try:
            # Step 1: Create GitHub repository (or get existing)
            repo = self._create_repository(repo_name)
            logger.info("git_manager.artifacts_repo_ready", url=repo.url)

            # Step 2: Create local directory structure
            # Artifacts repo is at workspace root, with app/ excluded
            os.makedirs(workspace_dir, exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'changelog'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'summary_changes'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'logs'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'state'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'sessions'), exist_ok=True)
            os.makedirs(os.path.join(workspace_dir, 'leo-artifacts', 'prompts'), exist_ok=True)

            # Step 3: Initialize local git
            git_dir = os.path.join(workspace_dir, '.git')
            if not os.path.exists(git_dir):
                self._run_git(workspace_dir, ['git', 'init'])

            # Step 4: Configure git user
            self._run_git(workspace_dir, ['git', 'config', 'user.email', 'leo-bot@app-gen-saas.com'])
            self._run_git(workspace_dir, ['git', 'config', 'user.name', 'Leo App Generator'])

            # Step 5: Set up remote
            auth_url = self._get_authenticated_url(repo.clone_url)
            remote_result = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'],
                cwd=workspace_dir,
                capture_output=True,
                text=True
            )
            if remote_result.returncode != 0:
                self._run_git(workspace_dir, ['git', 'remote', 'add', 'origin', auth_url])
            else:
                self._run_git(workspace_dir, ['git', 'remote', 'set-url', 'origin', auth_url])

            # Step 6: Create initial commit with README
            readme_path = os.path.join(workspace_dir, 'README.md')
            if not os.path.exists(readme_path):
                with open(readme_path, 'w') as f:
                    f.write("# Leo Generation Artifacts\n\n")
                    f.write("Artifacts from Leo app generation (app code is in separate repo).\n\n")
                    f.write("## Contents\n\n")
                    f.write("- `changelog/` - Generation changelog files\n")
                    f.write("- `summary_changes/` - Concise summaries for reprompter\n")
                    f.write("- `leo-artifacts/` - Internal logs, state, sessions, prompts\n")

            # Create .gitignore - MUST exclude app/ (separate repo)
            gitignore_path = os.path.join(workspace_dir, '.gitignore')
            if not os.path.exists(gitignore_path):
                with open(gitignore_path, 'w') as f:
                    f.write("# App is a separate git repo\n")
                    f.write("app/\n")
                    f.write("\n")
                    f.write("# Python\n")
                    f.write("*.pyc\n")
                    f.write("__pycache__/\n")
                    f.write("\n")
                    f.write("# OS\n")
                    f.write(".DS_Store\n")

            # Check if there's anything to commit
            status = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=workspace_dir,
                capture_output=True,
                text=True
            )
            if status.stdout.strip():
                self._run_git(workspace_dir, ['git', 'add', '.'])
                self._run_git(workspace_dir, ['git', 'commit', '-m', 'Initial commit: Leo artifacts repository'])
                self._run_git(workspace_dir, ['git', 'branch', '-M', 'main'])
                self._run_git(workspace_dir, ['git', 'push', '-u', 'origin', 'main', '--force'])
                logger.info("git_manager.artifacts_initial_push_complete", url=repo.url)
            else:
                self._run_git(workspace_dir, ['git', 'branch', '-M', 'main'])
                logger.info("git_manager.artifacts_repo_configured", url=repo.url)

            return repo

        except Exception as e:
            logger.error("git_manager.artifacts_init_error", error=str(e), repo_name=repo_name)
            # Non-fatal - generation can continue without artifacts repo
            return None

    def create_repo_and_push(
        self,
        app_path: str,
        app_id: str,
        user_id: str,
        commit_message: str = "Initial commit: Generated app"
    ) -> GitHubRepo:
        """
        Create GitHub repo and push generated app.

        Args:
            app_path: Path to generated app directory
            app_id: App UUID
            user_id: User UUID
            commit_message: Git commit message

        Returns:
            GitHubRepo with URL information

        Raises:
            ValueError: If GitHub not configured
            GithubException: If repo creation fails
            subprocess.CalledProcessError: If git commands fail
        """
        if not self.github:
            raise ValueError("GitHub integration not configured - GITHUB_BOT_TOKEN missing")

        # Generate repo name using short IDs
        repo_name = self._generate_repo_name(user_id, app_id)
        logger.info("git_manager.creating_repo", repo_name=repo_name)

        try:
            # Step 1: Create GitHub repository
            repo = self._create_repository(repo_name)
            logger.info("git_manager.repo_created", url=repo.url)

            # Step 2: Copy to temp directory and clean up
            temp_dir = self._prepare_for_push(app_path)
            logger.info("git_manager.prepared", temp_dir=temp_dir)

            # Step 3: Push code to GitHub
            self._push_to_github(temp_dir, repo.clone_url, commit_message)
            logger.info("git_manager.pushed", url=repo.url)

            # Step 4: Cleanup temp directory
            shutil.rmtree(temp_dir, ignore_errors=True)
            logger.debug("git_manager.cleanup_complete")

            return repo

        except Exception as e:
            logger.error("git_manager.error", error=str(e), repo_name=repo_name)
            raise

    def _generate_repo_name(self, user_id: str, app_id: str, suffix: str = "") -> str:
        """
        Generate repository name from user and app IDs.

        Format: gen-{user_id_short}-{app_id_short}{suffix}
        Uses last 8 chars of each UUID (no dashes).

        Example: gen-55440000-c3d479
        Example with suffix: gen-55440000-c3d479-artifacts

        Args:
            user_id: User UUID
            app_id: App UUID
            suffix: Optional suffix (e.g., "-artifacts")
        """
        # Extract last 8 chars of UUID (removing dashes)
        user_id_clean = user_id.replace('-', '')
        app_id_clean = app_id.replace('-', '')

        user_short = user_id_clean[-8:] if len(user_id_clean) >= 8 else user_id_clean
        app_short = app_id_clean[-8:] if len(app_id_clean) >= 8 else app_id_clean

        return f"gen-{user_short}-{app_short}{suffix}"

    def _should_create_repo(self) -> bool:
        """
        Determine if we should create a new repo.

        Rules:
        - Only create for our bot account (not user repos)
        - Only create for new generations (not resume)
        """
        is_our_account = (self.owner == self.BOT_USERNAME)
        return is_our_account and not self.is_resume

    def _create_repository(self, name: str) -> GitHubRepo:
        """
        Get or create GitHub repository.

        - For our bot account + new generation: create if doesn't exist
        - For resume or user repos: repo must already exist
        """
        if not self.github:
            raise ValueError("GitHub not initialized")

        user = self.github.get_user()

        # Check if repo already exists
        try:
            existing = user.get_repo(name)
            logger.info("git_manager.repo_exists", name=name, owner=self.owner)
            return GitHubRepo(
                url=existing.html_url,
                clone_url=existing.clone_url,
                name=existing.name
            )
        except GithubException as e:
            if e.status != 404:
                raise
            # Repo doesn't exist - fall through to creation logic

        # Check if we should create
        if not self._should_create_repo():
            if self.is_resume:
                raise ValueError(f"Resume mode but repo '{name}' doesn't exist")
            else:
                raise ValueError(
                    f"Cannot create repo '{name}' under '{self.owner}' - "
                    f"only allowed for bot account '{self.BOT_USERNAME}'"
                )

        # Create new repo under our bot account
        logger.info("git_manager.creating_new_repo", name=name, owner=self.owner)
        repo = user.create_repo(
            name=name,
            description=f"Generated app from Leo (ID: {name})",
            private=True,
            auto_init=False,
            has_issues=True,
            has_projects=False,
            has_wiki=False,
        )

        return GitHubRepo(
            url=repo.html_url,
            clone_url=repo.clone_url,
            name=repo.name
        )

    def _prepare_for_push(self, app_path: str) -> str:
        """
        Copy app to temp directory, excluding unnecessary files.

        Returns path to temp directory ready for git operations.
        """
        import tempfile

        temp_dir = tempfile.mkdtemp(prefix="github-")

        # Find actual app directory (may be nested)
        actual_app_path = self._find_app_directory(app_path)

        # Copy contents (not the directory itself)
        for item in os.listdir(actual_app_path):
            src = os.path.join(actual_app_path, item)
            dst = os.path.join(temp_dir, item)

            # Skip node_modules, .git, secrets, and other unwanted
            if item in ['node_modules', '.git', '__pycache__', '.env', '.env.local', '.agent_session.json']:
                continue

            if os.path.isdir(src):
                shutil.copytree(src, dst, ignore=shutil.ignore_patterns(
                    'node_modules', '__pycache__', '*.pyc', '.git', '*.log', '.env', '.env.local'
                ))
            else:
                shutil.copy2(src, dst)

        logger.debug("git_manager.files_copied",
                    from_path=actual_app_path,
                    to_path=temp_dir,
                    items=os.listdir(temp_dir))

        return temp_dir

    def _find_app_directory(self, source_path: str) -> str:
        """
        Find the actual app directory containing package.json or client/server.

        Generator creates app directly at /workspace/app/ with client/, server/, etc.
        (per CONTAINER-STRUCTURE.md)
        """
        # Check if source_path directly contains app files
        if self._is_app_directory(source_path):
            return source_path

        # Look for nested app directory
        for item in os.listdir(source_path):
            item_path = os.path.join(source_path, item)
            if os.path.isdir(item_path) and not item.startswith('.'):
                if self._is_app_directory(item_path):
                    logger.debug("git_manager.found_app_dir", path=item_path)
                    return item_path

        # Fallback to source path
        logger.debug("git_manager.using_source_directly", path=source_path)
        return source_path

    def _is_app_directory(self, path: str) -> bool:
        """Check if path contains app indicators (package.json, client/, server/)."""
        return (
            os.path.exists(os.path.join(path, 'package.json')) or
            os.path.exists(os.path.join(path, 'client')) or
            os.path.exists(os.path.join(path, 'server'))
        )

    def _push_to_github(self, directory: str, clone_url: str, commit_message: str) -> None:
        """Initialize git repo and push to GitHub."""
        # Add token to URL for authentication
        auth_url = self._get_authenticated_url(clone_url)

        # Check if git is already initialized
        git_dir = os.path.join(directory, '.git')
        if not os.path.exists(git_dir):
            self._run_git(directory, ['git', 'init'])

        # Configure git user (required for commits in fresh repos)
        self._run_git(directory, ['git', 'config', 'user.email', 'leo-bot@app-gen-saas.com'])
        self._run_git(directory, ['git', 'config', 'user.name', 'Leo App Generator'])

        # Check if there are changes to commit
        status = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=directory,
            capture_output=True,
            text=True
        )

        if status.stdout.strip():
            # There are uncommitted changes - stage and commit
            self._run_git(directory, ['git', 'add', '.'])
            self._run_git(directory, ['git', 'commit', '-m', commit_message])
        else:
            # Check if there are any commits at all
            log_result = subprocess.run(
                ['git', 'log', '--oneline', '-1'],
                cwd=directory,
                capture_output=True,
                text=True
            )
            if not log_result.stdout.strip():
                # No commits at all - nothing to push
                raise ValueError("No commits to push - directory has no changes")
            else:
                logger.info("git_manager.using_existing_commits",
                           message="No uncommitted changes, pushing existing commits")

        # Set up remote and push
        # First check if remote already exists
        remote_result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            cwd=directory,
            capture_output=True,
            text=True
        )

        if remote_result.returncode != 0:
            # No remote - add it
            self._run_git(directory, ['git', 'remote', 'add', 'origin', auth_url])
        else:
            # Remote exists - update it
            self._run_git(directory, ['git', 'remote', 'set-url', 'origin', auth_url])

        self._run_git(directory, ['git', 'branch', '-M', 'main'])
        self._run_git(directory, ['git', 'push', '-u', 'origin', 'main', '--force'])

    def _run_git(self, directory: str, cmd: list) -> subprocess.CompletedProcess:
        """Run a git command and log it."""
        # Don't log URLs with tokens
        log_cmd = [c if 'token' not in c.lower() and '@' not in c else '***' for c in cmd]
        logger.debug("git_manager.running_command", cmd=log_cmd[:3])

        result = subprocess.run(
            cmd,
            cwd=directory,
            capture_output=True,
            text=True,
            check=True
        )
        if result.stderr and 'warning' not in result.stderr.lower():
            logger.debug("git_manager.stderr", output=result.stderr)
        return result

    def _get_authenticated_url(self, clone_url: str) -> str:
        """Convert clone URL to authenticated URL with token."""
        if not self.token:
            raise ValueError("GITHUB_BOT_TOKEN not available")

        # https://github.com/user/repo.git → https://x-access-token:TOKEN@github.com/user/repo.git
        return clone_url.replace(
            'https://github.com/',
            f'https://x-access-token:{self.token}@github.com/'
        )

    def delete_repository(self, repo_name: str) -> None:
        """Delete a repository (for cleanup/testing)."""
        if not self.github:
            raise ValueError("GitHub not initialized")

        logger.info("git_manager.deleting_repo", repo_name=repo_name)
        repo = self.github.get_user().get_repo(repo_name)
        repo.delete()

    def get_repository(self, repo_name: str) -> GitHubRepo:
        """Get repository info."""
        if not self.github:
            raise ValueError("GitHub not initialized")

        repo = self.github.get_user().get_repo(repo_name)
        return GitHubRepo(
            url=repo.html_url,
            clone_url=repo.clone_url,
            name=repo.name
        )


# Convenience function for one-shot usage
def push_to_github(
    app_path: str,
    app_id: str,
    user_id: str,
    commit_message: str = "Initial commit: Generated app"
) -> Optional[GitHubRepo]:
    """
    Push generated app to GitHub (convenience function).

    Returns GitHubRepo if successful, None if GitHub not configured.
    """
    manager = GitManager()
    if not manager.is_enabled():
        logger.warning("git_manager.disabled", reason="GITHUB_BOT_TOKEN not set")
        return None

    return manager.create_repo_and_push(app_path, app_id, user_id, commit_message)
