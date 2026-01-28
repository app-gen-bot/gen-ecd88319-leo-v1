import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getGitCommit(): Promise<string> {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD');
    return stdout.trim();
  } catch {
    return process.env.GIT_COMMIT || 'unknown';
  }
}

export async function getGitCommitShort(): Promise<string> {
  try {
    const { stdout } = await execAsync('git rev-parse --short HEAD');
    return stdout.trim();
  } catch {
    const full = process.env.GIT_COMMIT || 'unknown';
    return full.substring(0, 8);
  }
}
