/**
 * GitHub Repository Manager
 *
 * Handles automated creation of GitHub repositories for generated apps.
 * Creates public repos under bot account, extracts S3 tarballs, and pushes code.
 */

import { Octokit } from '@octokit/rest';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as tar from 'tar-fs';
import * as zlib from 'zlib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import { generateFlyToml, generateDeploymentReadme } from './templates/fly-toml';
import { generateDockerfile, generateDockerignore, generateSimpleDockerfile } from './templates/dockerfile';

const exec = promisify(execCallback);

export interface CreateRepoOptions {
  generationId: number;
  userId: string;
  s3Key?: string;
  s3Bucket?: string;
  localPath?: string;
}

export interface GitHubRepo {
  url: string;
  cloneUrl: string;
  name: string;
}

class GitHubManager {
  private octokit: Octokit | null = null;
  private s3Client: S3Client;
  private botUsername = 'app-gen-saas-bot'; // Can be configured via env var

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // Octokit will be initialized lazily when first needed
  }

  /**
   * Initialize Octokit if not already done (lazy initialization)
   */
  private ensureInitialized(): void {
    if (this.octokit === null) {
      const githubToken = process.env.GITHUB_BOT_TOKEN;
      if (githubToken) {
        this.octokit = new Octokit({ auth: githubToken });
        console.log('[GitHub Manager] Initialized with bot token');
      }
    }
  }

  /**
   * Check if GitHub integration is enabled
   */
  isEnabled(): boolean {
    this.ensureInitialized();
    return this.octokit !== null;
  }

  /**
   * Create GitHub repository for a generated app
   *
   * @param options - Repository creation options
   * @returns GitHub repository information
   */
  async createRepoForGeneration(options: CreateRepoOptions): Promise<GitHubRepo> {
    this.ensureInitialized();
    if (!this.octokit) {
      throw new Error('GitHub integration not configured - GITHUB_BOT_TOKEN missing');
    }

    const { generationId, userId, s3Key, s3Bucket, localPath } = options;

    // Generate repository name
    const repoName = this.generateRepoName(userId, generationId);
    console.log(`[GitHub Manager] Creating repo: ${repoName}`);

    try {
      // Step 1: Create GitHub repository
      const repo = await this.createRepository(repoName);
      console.log(`[GitHub Manager] Repo created: ${repo.url}`);

      // Step 2: Get source directory (from S3 or local)
      let tempDir: string;
      let shouldCleanup = true;

      if (localPath) {
        // Local mode: copy to temp directory
        tempDir = await this.copyLocalFiles(localPath);
        console.log(`[GitHub Manager] Copied from local: ${localPath}`);
      } else if (s3Bucket && s3Key) {
        // AWS mode: download and extract tarball from S3
        tempDir = await this.downloadAndExtract(s3Bucket, s3Key);
        console.log(`[GitHub Manager] Extracted from S3: ${s3Key}`);
      } else {
        throw new Error('Must provide either localPath or s3Bucket+s3Key');
      }

      // Step 3: Add Fly.io configuration files
      await this.addFlyioConfig(tempDir, repoName, repo.url);
      console.log(`[GitHub Manager] Added Fly.io config`);

      // Step 4: Push code to GitHub
      await this.pushToGitHub(tempDir, repo.cloneUrl);
      console.log(`[GitHub Manager] Pushed code to GitHub`);

      // Step 5: Cleanup temp directory
      if (shouldCleanup) {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log(`[GitHub Manager] Cleaned up temp files`);
      }

      return repo;
    } catch (error) {
      console.error(`[GitHub Manager] Error creating repo for generation ${generationId}:`, error);
      throw error;
    }
  }

  /**
   * Generate repository name
   */
  private generateRepoName(userId: string, generationId: number): string {
    // Sanitize userId (take last 8 chars to keep names shorter)
    const userIdShort = userId.slice(-8);
    return `gen-${userIdShort}-${generationId}`;
  }

  /**
   * Create GitHub repository
   */
  private async createRepository(name: string): Promise<GitHubRepo> {
    if (!this.octokit) {
      throw new Error('Octokit not initialized');
    }

    const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
      name,
      description: `Generated app from Happy Llama (ID: ${name})`,
      private: true, // Private repos for user privacy
      auto_init: false, // We'll push our own initial commit
      has_issues: true,
      has_projects: false,
      has_wiki: false,
    });

    return {
      url: data.html_url,
      cloneUrl: data.clone_url,
      name: data.name,
    };
  }

  /**
   * Download tarball from S3 and extract to temp directory
   */
  private async downloadAndExtract(bucket: string, key: string): Promise<string> {
    // Create temp directory
    const tempDir = path.join('/tmp', `github-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Download from S3
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('S3 object has no body');
      }

      // Stream S3 body through gunzip then tar extraction
      // Files are uploaded as .tar.gz, so we need to gunzip before extracting
      const stream = response.Body as Readable;

      return new Promise((resolve, reject) => {
        stream
          .pipe(zlib.createGunzip())
          .pipe(tar.extract(tempDir))
          .on('finish', () => resolve(tempDir))
          .on('error', reject);
      });
    } catch (error) {
      // Cleanup on error
      await fs.rm(tempDir, { recursive: true, force: true });
      throw error;
    }
  }

  /**
   * Copy local files to temp directory for GitHub push
   * Excludes node_modules, logs, and other unnecessary files
   *
   * Generator always creates: /tmp/generations/X/app/<app-name>/ with client/, server/, etc.
   * We need to copy the contents of <app-name>/ to tempDir root for correct GitHub structure
   */
  private async copyLocalFiles(sourcePath: string): Promise<string> {
    // Create temp directory
    const tempDir = path.join('/tmp', `github-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Generator creates a nested structure: /tmp/generations/X/app/<app-name>/
      // Find the app directory by checking for package.json or client/server directories
      const entries = await fs.readdir(sourcePath, { withFileTypes: true });
      const directories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

      let appSourcePath: string | null = null;

      // Find the directory containing the actual app (has package.json or client/server)
      for (const dir of directories) {
        const dirPath = path.join(sourcePath, dir.name);
        const hasPackageJson = await fs.access(path.join(dirPath, 'package.json'))
          .then(() => true).catch(() => false);
        const hasClientDir = await fs.access(path.join(dirPath, 'client'))
          .then(() => true).catch(() => false);

        if (hasPackageJson || hasClientDir) {
          appSourcePath = dirPath;
          console.log(`[GitHub Manager] Found app directory: ${dir.name}`);
          break;
        }
      }

      // If no nested app directory found, use sourcePath directly (fallback for simple apps)
      if (!appSourcePath) {
        appSourcePath = sourcePath;
        console.log(`[GitHub Manager] No nested app directory found, using source path directly`);
      }

      // Copy app contents to tempDir (not the directory itself)
      // Using shell glob to copy contents: /path/to/app/* → /tempDir/
      await exec(`cp -r ${appSourcePath}/* ${tempDir}/`, { maxBuffer: 50 * 1024 * 1024 });
      console.log(`[GitHub Manager] Copied app from: ${appSourcePath} to: ${tempDir}`);

      // Remove node_modules directories (could be nested at any level)
      console.log('[GitHub Manager] Removing node_modules from temp directory...');
      await exec(`find ${tempDir} -type d -name "node_modules" -prune -exec rm -rf {} +`, {
        maxBuffer: 10 * 1024 * 1024
      });

      // Remove log files
      await exec(`find ${tempDir} -type f -name "*.log" -delete`, {
        maxBuffer: 10 * 1024 * 1024
      });

      // Remove .env.local files (keep .env for template)
      await exec(`find ${tempDir} -type f -name ".env.local" -delete`, {
        maxBuffer: 10 * 1024 * 1024
      });

      console.log('[GitHub Manager] Cleaned up unnecessary files from temp directory');

      return tempDir;
    } catch (error) {
      // Cleanup on error
      await fs.rm(tempDir, { recursive: true, force: true });
      throw error;
    }
  }

  /**
   * Detect if app is a simple static app or full-stack app
   */
  private async isSimpleStaticApp(tempDir: string): Promise<boolean> {
    try {
      // Check for indicators of full-stack app
      const clientExists = await fs.access(path.join(tempDir, 'client')).then(() => true).catch(() => false);
      const serverExists = await fs.access(path.join(tempDir, 'server')).then(() => true).catch(() => false);
      const viteConfigExists = await fs.access(path.join(tempDir, 'vite.config.ts')).then(() => true).catch(() => false);

      // If any full-stack indicators exist, it's NOT a simple app
      if (clientExists || serverExists || viteConfigExists) {
        return false;
      }

      // Check for simple static app indicators
      const indexHtmlExists = await fs.access(path.join(tempDir, 'index.html')).then(() => true).catch(() => false);

      return indexHtmlExists;
    } catch (error) {
      // Default to simple static app if detection fails
      return true;
    }
  }

  /**
   * Add Fly.io configuration files to the extracted app
   */
  private async addFlyioConfig(tempDir: string, repoName: string, githubUrl: string): Promise<void> {
    // Detect app type
    const isSimple = await this.isSimpleStaticApp(tempDir);
    console.log(`[GitHub Manager] App type: ${isSimple ? 'simple static' : 'full-stack'}`);

    // Port selection based on app type
    const port = isSimple ? 8080 : 3000;

    // Generate fly.toml with correct port (disable health checks for static apps)
    const flyToml = generateFlyToml({
      appName: repoName,
      port: port,
      enableHealthCheck: !isSimple, // Only full-stack apps have /health endpoint
    });
    await fs.writeFile(path.join(tempDir, 'fly.toml'), flyToml);

    // Generate appropriate Dockerfile based on app type
    const dockerfile = isSimple
      ? generateSimpleDockerfile({
          appName: repoName,
          port: port,
        })
      : generateDockerfile({
          appName: repoName,
          port: port,
        });
    await fs.writeFile(path.join(tempDir, 'Dockerfile'), dockerfile);

    // Generate .dockerignore to optimize build
    const dockerignore = generateDockerignore();
    await fs.writeFile(path.join(tempDir, '.dockerignore'), dockerignore);

    // Generate deployment README
    const readme = generateDeploymentReadme(repoName, githubUrl);
    await fs.writeFile(path.join(tempDir, 'README.md'), readme);

    // Normalize package.json build script to fix generator inconsistencies
    // The generator sometimes creates tsconfig.server.json and sometimes doesn't,
    // but always references it in the build script: "tsc -p tsconfig.server.json && vite build"
    // This causes Dockerfile build failures when the file is missing.
    // Since production uses tsx to run TypeScript directly (see dockerfile.ts:118),
    // server compilation is unnecessary - we only need to build the frontend.
    const pkgJsonPath = path.join(tempDir, 'package.json');
    try {
      const pkgJsonContent = await fs.readFile(pkgJsonPath, 'utf-8');
      const pkgJson = JSON.parse(pkgJsonContent);

      if (pkgJson.scripts?.build) {
        const originalBuild = pkgJson.scripts.build;
        // Normalize to only build frontend - tsx handles server TypeScript at runtime
        pkgJson.scripts.build = 'vite build';

        await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
        console.log(`[GitHub Manager] Normalized build script: "${originalBuild}" → "${pkgJson.scripts.build}"`);
      }
    } catch (error) {
      console.warn(`[GitHub Manager] Failed to normalize package.json build script:`, error);
      // Non-fatal - continue with original package.json
    }

    console.log(`[GitHub Manager] Added ${isSimple ? 'simple static' : 'full-stack'} Dockerfile, .dockerignore, fly.toml, and README.md`);
  }

  /**
   * Initialize git and push to GitHub
   */
  private async pushToGitHub(dir: string, cloneUrl: string): Promise<void> {
    // Log what we're about to push
    console.log(`[GitHub Manager] Preparing to push from directory: ${dir}`);
    const pushEntries = await fs.readdir(dir, { withFileTypes: true });
    console.log(`[GitHub Manager] Files to be pushed:`, pushEntries.map(e => `${e.name} (${e.isDirectory() ? 'dir' : 'file'})`));

    // Configure git to use token authentication
    const tokenUrl = this.getAuthenticatedCloneUrl(cloneUrl);

    const commands = [
      'git init',
      'git add .',
      'git commit -m "Initial commit: Generated app from App-Gen-SaaS"',
      `git remote add origin ${tokenUrl}`,
      'git branch -M main',
      'git push -u origin main',
    ];

    // Increase maxBuffer to handle large commits with many files (e.g., node_modules)
    // Default is 1MB, we set to 50MB to handle generated apps
    const execOptions = { cwd: dir, maxBuffer: 50 * 1024 * 1024 };

    for (const command of commands) {
      await exec(command, execOptions);
    }

    console.log(`[GitHub Manager] Successfully pushed to GitHub`);
  }

  /**
   * Convert clone URL to authenticated URL with token
   */
  private getAuthenticatedCloneUrl(cloneUrl: string): string {
    // Convert https://github.com/user/repo.git
    // to https://x-access-token:TOKEN@github.com/user/repo.git
    const token = process.env.GITHUB_BOT_TOKEN;
    if (!token) {
      throw new Error('GITHUB_BOT_TOKEN not available');
    }

    return cloneUrl.replace(
      'https://github.com/',
      `https://x-access-token:${token}@github.com/`
    );
  }

  /**
   * Delete a repository (for cleanup)
   */
  async deleteRepository(repoName: string): Promise<void> {
    if (!this.octokit) {
      throw new Error('Octokit not initialized');
    }

    console.log(`[GitHub Manager] Deleting repo: ${repoName}`);

    await this.octokit.repos.delete({
      owner: this.botUsername,
      repo: repoName,
    });
  }

  /**
   * Get repository info
   */
  async getRepository(repoName: string) {
    if (!this.octokit) {
      throw new Error('Octokit not initialized');
    }

    const { data } = await this.octokit.repos.get({
      owner: this.botUsername,
      repo: repoName,
    });

    return data;
  }
}

// Export singleton instance
export const githubManager = new GitHubManager();
