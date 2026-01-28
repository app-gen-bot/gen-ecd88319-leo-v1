#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as crypto from 'crypto';
import * as net from 'net';
import * as os from 'os';
import { WSIServer } from './wsi-server.js';
import { DockerManager, ContainerSpawnConfig } from './container-manager.js';

/**
 * Leo Remote CLI
 *
 * Spawns a Leo container and runs app generation via WSI Protocol.
 * Streams output to terminal in real-time.
 *
 * Supports running multiple instances simultaneously - each finds its own free port.
 */

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

type LogTag = 'SETUP' | 'GEN' | 'PUSH' | 'GIT' | 'DONE' | 'ERROR';

function structuredLog(tag: LogTag, message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ' ' + Object.entries(data).map(([k, v]) => `${k}=${v}`).join(' ') : '';
  console.log(chalk.gray(`[${timestamp}]`) + chalk.cyan(` [${tag}] `) + message + chalk.gray(dataStr));
}

function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a deterministic UUID v5 from a namespace and name.
 * This ensures the same username always produces the same user_id.
 */
function generateDeterministicUUID(namespace: string, name: string): string {
  // UUID v5 namespace for Leo Remote (fixed, arbitrary UUID)
  const LEO_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace UUID
  const hash = crypto.createHash('sha1')
    .update(LEO_NAMESPACE)
    .update(name)
    .digest('hex');

  // Format as UUID v5: xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx
  // Version 5 at position 12, variant bits (8/9/a/b) at position 16
  const p1 = hash.substring(0, 8);
  const p2 = hash.substring(8, 12);
  const p3 = '5' + hash.substring(13, 16);  // Version 5
  const p4 = ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20);  // Variant
  const p5 = hash.substring(20, 32);

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

/**
 * Format duration in seconds to HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const program = new Command();

program
  .name('leo-remote')
  .description('Generate applications using Leo via containerized execution')
  .version('1.0.0');

program
  .argument('<prompt>', 'Application description prompt')
  .option('-n, --name <name>', 'Application name (default: generated from prompt)')
  .option('-m, --mode <mode>', 'Generation mode: autonomous, confirm_first, interactive', 'autonomous')
  .option('-i, --max-iterations <n>', 'Maximum iterations for autonomous mode', '50')
  .option('-p, --port <port>', 'WSI Server port (default: auto-find free port starting at 5013)')
  .option('--resume <path>', 'Resume from existing app path')
  .option('--image <image>', 'Docker image to use (default: from build)')
  .option('--github-owner <owner>', 'GitHub repo owner (default: app-gen-bot)')
  .option('--no-subagents', 'Disable sub-agent execution')
  .option('--debug', 'Enable debug output')
  .action(async (prompt: string, options: {
    name?: string;
    mode: string;
    maxIterations: string;
    port?: string;
    resume?: string;
    image?: string;
    githubOwner?: string;
    subagents: boolean;
    debug?: boolean;
  }) => {
    await runGeneration(prompt, options);
  });

/**
 * Check if a port is available on all interfaces (same as WebSocket server)
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    // Listen on all interfaces (::) to match WebSocket server behavior
    server.listen(port);
  });
}

/**
 * Find an available port starting from basePort
 */
async function findAvailablePort(basePort: number = 5013, maxAttempts: number = 100): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = basePort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${basePort}-${basePort + maxAttempts}`);
}

async function runGeneration(prompt: string, options: {
  name?: string;
  mode: string;
  maxIterations: string;
  port?: string;
  resume?: string;
  image?: string;
  githubOwner?: string;
  subagents: boolean;
  debug?: boolean;
}): Promise<void> {
  // Generate IDs for this generation session
  // Use deterministic UUID based on OS username for consistent user identification
  const username = os.userInfo().username;
  const userId = generateDeterministicUUID('leo-user', username);
  const appId = options.resume ? `app_resumed_${Date.now().toString(36)}` : generateUUID();
  const generationId = generateUUID();
  const githubOwner = options.githubOwner || process.env.GITHUB_REPO_OWNER || 'app-gen-bot';

  // Find available port (auto-allocate if not specified)
  let port: number;
  if (options.port) {
    port = parseInt(options.port, 10);
  } else {
    port = await findAvailablePort(5013);
  }

  const maxIterations = parseInt(options.maxIterations, 10);
  const appName = options.name || localGenerateAppName(prompt);
  const mode = options.mode as 'autonomous' | 'confirm_first' | 'interactive';

  // Set image if provided
  if (options.image) {
    process.env.LEO_CONTAINER_IMAGE = options.image;
  }

  // Track generation state
  const genState = {
    appId,
    generationId,
    userId,
    appName,
    githubOwner,
    isResume: !!options.resume,
    startTime: Date.now(),
    iteration: 0,
    state: 'pending' as 'pending' | 'generating' | 'ready' | 'failed',
  };

  console.log(chalk.blue('═'.repeat(60)));
  console.log(chalk.blue.bold('  Leo Remote - App Generator'));
  console.log(chalk.blue('═'.repeat(60)));
  console.log();

  // Structured setup logging
  structuredLog('SETUP', 'Initializing generation', {
    app_id: appId,
    generation_id: generationId,
    user_id: userId,
  });
  structuredLog('SETUP', 'Configuration', {
    app_name: appName,
    mode,
    max_iterations: maxIterations,
    is_resume: !!options.resume,
  });

  // Calculate expected GitHub repo name (matches git_manager.py logic)
  const userIdShort = userId.replace(/-/g, '').slice(-8);
  const appIdShort = appId.replace(/-/g, '').slice(-8);
  const expectedRepoName = `gen-${userIdShort}-${appIdShort}`;

  console.log();
  console.log(chalk.white('  IDs:'));
  console.log(chalk.gray(`    User:          ${userId}`));
  console.log(chalk.gray(`    App ID:        ${appId}`));
  console.log(chalk.gray(`    Generation ID: ${generationId}`));
  console.log();
  console.log(chalk.white('  Config:'));
  console.log(chalk.gray(`    App Name:      ${appName}`));
  console.log(chalk.gray(`    Mode:          ${mode}`));
  console.log(chalk.gray(`    Max Iters:     ${maxIterations}`));
  console.log(chalk.gray(`    Resume:        ${options.resume || 'no (new app)'}`));
  console.log();
  console.log(chalk.white('  GitHub:'));
  console.log(chalk.gray(`    Owner:         ${githubOwner}`));
  console.log(chalk.gray(`    Repo:          ${expectedRepoName}`));
  console.log(chalk.gray(`    URL:           https://github.com/${githubOwner}/${expectedRepoName}`));
  console.log();
  console.log(chalk.white('  Prompt:'));
  console.log(chalk.gray(`    ${prompt.substring(0, 70)}${prompt.length > 70 ? '...' : ''}`));
  console.log();

  // Initialize WSI Server
  const wsiServer = new WSIServer(port);

  // Queue the generation request
  wsiServer.queueGeneration({
    prompt,
    mode,
    appName,
    maxIterations,
    appPath: options.resume,
    enableSubagents: options.subagents,
  });

  // Set up event handlers
  wsiServer.on('log', (msg) => {
    const prefix = getLogPrefix(msg.level || 'info');
    console.log(`${prefix} ${msg.line}`);
  });

  wsiServer.on('progress', (msg) => {
    if (msg.stage) {
      console.log(chalk.cyan(`📊 ${msg.stage}${msg.step ? ` - ${msg.step}` : ''}`));
    }
  });

  wsiServer.on('error', (msg) => {
    console.error(chalk.red(`❌ ${msg.message}`));
    if (msg.fatal) {
      console.error(chalk.red('   This error is fatal - generation will stop'));
    }
  });

  wsiServer.on('iteration_complete', (msg) => {
    genState.iteration = msg.iteration;
    structuredLog('GEN', `Iteration ${msg.iteration} complete`, {
      app_path: msg.app_path,
      duration: msg.duration,
    });
    // TODO: Add push logging when git push is triggered
    // structuredLog('PUSH', 'Pushing to remote', { repo: 'app' });
  });

  wsiServer.on('all_work_complete', (msg) => {
    genState.state = 'ready';
    const durationSec = Math.round((Date.now() - genState.startTime) / 1000);
    const durationFormatted = formatDuration(durationSec);

    structuredLog('DONE', 'Generation complete', {
      app_id: genState.appId,
      generation_id: genState.generationId,
      state: 'ready',
      iterations: msg.total_iterations,
      duration: durationFormatted,
      reason: msg.completion_reason,
    });

    if (msg.github_url) {
      structuredLog('GIT', 'App pushed to GitHub', { url: msg.github_url });
    }
    if (msg.s3_url) {
      structuredLog('PUSH', 'App uploaded to S3', { url: msg.s3_url });
    }

    console.log();
    console.log(chalk.green('═'.repeat(60)));
    console.log(chalk.green.bold('  ✅ Generation Complete!'));
    console.log(chalk.green('═'.repeat(60)));
    console.log();
    console.log(chalk.white(`  App ID: ${genState.appId}`));
    console.log(chalk.white(`  App Path: ${msg.app_path}`));
    console.log(chalk.white(`  Iterations: ${msg.total_iterations}`));
    console.log(chalk.white(`  Duration: ${durationFormatted}`));
    console.log(chalk.white(`  Reason: ${msg.completion_reason}`));
    if (msg.github_url) {
      console.log(chalk.white(`  GitHub: ${msg.github_url}`));
    }
    if (msg.s3_url) {
      console.log(chalk.white(`  S3: ${msg.s3_url}`));
    }
    console.log();
  });

  // Start WSI Server
  try {
    await wsiServer.start();
  } catch (error) {
    console.error(chalk.red('Failed to start WSI Server:'), error);
    process.exit(1);
  }

  // Initialize Docker Manager and spawn container
  // Pass the WSI Server port so containers connect to the correct server
  process.env.WS_BASE_URL = `ws://host.docker.internal:${port}`;
  const dockerManager = new DockerManager();
  const requestId = localGenerateRequestId();

  const containerConfig: ContainerSpawnConfig = {
    requestId,
    prompt,
    mode,
    maxIterations,
    appName,
    userId: genState.userId,
    appId: genState.appId,
    githubOwner: genState.githubOwner,
    isResume: genState.isResume,
    resumeFromPath: options.resume,
  };

  let containerId: string | null = null;

  try {
    structuredLog('SETUP', 'Spawning container', {
      image: dockerManager.imageName,
      request_id: requestId,
    });
    console.log(chalk.yellow('🐳 Spawning container...'));
    containerId = await dockerManager.spawnContainer(containerConfig);
    genState.state = 'generating';
    structuredLog('SETUP', 'Container started', { container_id: containerId.substring(0, 12) });
    console.log(chalk.green(`✅ Container started: ${containerId.substring(0, 12)}`));
    console.log();
    structuredLog('GEN', 'Starting generation', { prompt_length: prompt.length });
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.gray.bold('  Generation Output'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    // Wait for completion or disconnection
    await new Promise<void>((resolve, reject) => {
      wsiServer.on('all_work_complete', () => {
        resolve();
      });

      wsiServer.on('error', (msg) => {
        if (msg.fatal) {
          reject(new Error(msg.message));
        }
      });

      wsiServer.on('disconnected', () => {
        // Give a moment for final messages
        setTimeout(() => {
          if (!wsiServer.isConnected()) {
            resolve();
          }
        }, 1000);
      });
    });

  } catch (error) {
    genState.state = 'failed';
    const errorMsg = error instanceof Error ? error.message : String(error);
    structuredLog('ERROR', 'Generation failed', {
      app_id: genState.appId,
      generation_id: genState.generationId,
      state: 'failed',
      error: errorMsg,
    });
    console.error(chalk.red('Generation failed:'), error);
    process.exitCode = 1;
  } finally {
    // Cleanup
    console.log();
    structuredLog('SETUP', 'Cleaning up', { container_id: containerId?.substring(0, 12) });
    console.log(chalk.gray('Cleaning up...'));

    if (containerId) {
      try {
        await dockerManager.stopContainer(requestId);
      } catch {
        // Ignore cleanup errors
      }
    }

    await wsiServer.stop();

    // Final summary
    const totalDurationSec = Math.round((Date.now() - genState.startTime) / 1000);
    const totalDurationFormatted = formatDuration(totalDurationSec);
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.gray(`  Summary: app_id=${genState.appId} state=${genState.state} duration=${totalDurationFormatted}`));
    console.log(chalk.gray('─'.repeat(60)));
  }
}

function getLogPrefix(level: string): string {
  switch (level) {
    case 'error':
      return chalk.red('ERROR');
    case 'warn':
      return chalk.yellow('WARN ');
    case 'debug':
      return chalk.gray('DEBUG');
    default:
      return chalk.blue('INFO ');
  }
}

function localGenerateAppName(prompt: string): string {
  // Extract first few meaningful words from prompt
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'create', 'build', 'make'].includes(w))
    .slice(0, 3);

  if (words.length === 0) {
    return `app-${Date.now().toString(36)}`;
  }

  return words.join('-');
}

function localGenerateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\nInterrupted - cleaning up...'));
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\nTerminated - cleaning up...'));
  process.exit(143);
});

// Run CLI
program.parse();
