"""
S3 Manager - Upload generated apps to S3

Provides:
- Create tar.gz archive of generated app
- Upload to S3 bucket
- Generate presigned download URL
"""

import os
import tarfile
import tempfile
import logging
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


@dataclass
class S3UploadResult:
    """Result of S3 upload operation"""
    bucket: str
    key: str
    s3_url: str
    download_url: str  # Presigned URL


class S3Manager:
    """
    Manages S3 uploads for generated applications.

    Usage:
        s3 = S3Manager()
        result = s3.upload_app("/workspace/app/my-app", "gen_abc123")
        print(f"Download: {result.download_url}")
    """

    def __init__(
        self,
        bucket: Optional[str] = None,
        region: Optional[str] = None,
        presigned_expiry: int = 86400  # 24 hours default
    ):
        """
        Initialize S3 Manager.

        Args:
            bucket: S3 bucket name (default: S3_BUCKET env var)
            region: AWS region (default: AWS_REGION env var or us-east-1)
            presigned_expiry: Presigned URL expiry in seconds (default: 24h)
        """
        # Default bucket for leo-remote CLI
        DEFAULT_BUCKET = 'leo-saas-generated-apps-855235011337'

        self.bucket = bucket or os.environ.get('S3_BUCKET', DEFAULT_BUCKET)
        self.region = region or os.environ.get('AWS_REGION', 'us-east-1')
        self.presigned_expiry = presigned_expiry

        self._client: Optional[boto3.client] = None

    @property
    def client(self) -> boto3.client:
        """Lazy-initialize S3 client"""
        if self._client is None:
            try:
                self._client = boto3.client('s3', region_name=self.region)
            except NoCredentialsError:
                raise RuntimeError(
                    "AWS credentials not found. Set AWS_PROFILE, "
                    "AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, or use IAM role."
                )
        return self._client

    def upload_app(self, app_path: str, generation_id: str) -> S3UploadResult:
        """
        Create tar.gz of app and upload to S3.

        Args:
            app_path: Path to generated app directory
            generation_id: Unique generation identifier

        Returns:
            S3UploadResult with bucket, key, and URLs

        Raises:
            FileNotFoundError: If app_path doesn't exist
            ClientError: If S3 upload fails
        """
        app_path = Path(app_path)
        if not app_path.exists():
            raise FileNotFoundError(f"App path does not exist: {app_path}")

        # Create tar.gz in temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            tar_path = Path(temp_dir) / "app.tar.gz"

            logger.info(f"Creating archive: {tar_path}")
            self._create_tarball(app_path, tar_path)

            # Log file size
            file_size_mb = tar_path.stat().st_size / (1024 * 1024)
            logger.info(f"Archive size: {file_size_mb:.2f} MB")

            # Upload to S3
            key = f"generations/{generation_id}/app.tar.gz"
            logger.info(f"Uploading to s3://{self.bucket}/{key}")

            try:
                self.client.upload_file(str(tar_path), self.bucket, key)
            except ClientError as e:
                logger.error(f"S3 upload failed: {e}")
                raise

        logger.info(f"Upload complete: s3://{self.bucket}/{key}")

        # Generate presigned URL
        download_url = self.get_presigned_url(key)

        return S3UploadResult(
            bucket=self.bucket,
            key=key,
            s3_url=f"s3://{self.bucket}/{key}",
            download_url=download_url
        )

    def _create_tarball(self, source_path: Path, tar_path: Path) -> None:
        """
        Create tar.gz archive of source directory.

        Excludes:
        - node_modules/
        - .git/ (large, can recreate from remote)
        - __pycache__/
        - *.pyc
        - .env.local (secrets)
        """
        def exclude_filter(tarinfo: tarfile.TarInfo) -> Optional[tarfile.TarInfo]:
            # Get relative path within archive
            name = tarinfo.name

            # Exclude patterns
            excludes = [
                '/node_modules/',
                '/node_modules',
                '/.git/',
                '/.git',
                '/__pycache__/',
                '/__pycache__',
                '.pyc',
                '.env.local',
                '/dist/',  # Build artifacts
                '/.next/',  # Next.js cache
            ]

            for pattern in excludes:
                if pattern in name or name.endswith(pattern.lstrip('/')):
                    return None

            return tarinfo

        with tarfile.open(tar_path, "w:gz") as tar:
            # Add with arcname="app" so extraction creates app/ directory
            tar.add(source_path, arcname="app", filter=exclude_filter)

    def get_presigned_url(self, key: str, expiry: Optional[int] = None) -> str:
        """
        Generate presigned download URL.

        Args:
            key: S3 object key
            expiry: URL expiry in seconds (default: self.presigned_expiry)

        Returns:
            Presigned URL string
        """
        expiry = expiry or self.presigned_expiry

        return self.client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': self.bucket,
                'Key': key
            },
            ExpiresIn=expiry
        )

    def check_connection(self) -> bool:
        """
        Verify S3 connection and bucket access.

        Returns:
            True if bucket is accessible
        """
        try:
            self.client.head_bucket(Bucket=self.bucket)
            return True
        except ClientError:
            return False


# Convenience function for simple usage
def upload_generated_app(
    app_path: str,
    generation_id: str,
    bucket: Optional[str] = None
) -> S3UploadResult:
    """
    Upload generated app to S3.

    Args:
        app_path: Path to generated app
        generation_id: Unique ID for this generation
        bucket: S3 bucket (default: S3_BUCKET env var)

    Returns:
        S3UploadResult with download URL
    """
    manager = S3Manager(bucket=bucket)
    return manager.upload_app(app_path, generation_id)
