import archiver from 'archiver';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/tmp/generations';

export class FileManager {
  async createAndStreamZip(generationId: number, res: Response): Promise<void> {
    const workspacePath = path.join(WORKSPACE_DIR, generationId.toString());
    const appPath = path.join(workspacePath, 'app');

    // Check if app directory exists
    if (!fs.existsSync(appPath)) {
      throw new Error('Generated app not found');
    }

    console.log(`[FileManager] Streaming ZIP for generation ${generationId}`);

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="generated-app-${generationId}.zip"`);

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle errors
    archive.on('error', (err) => {
      console.error(`[FileManager] Archive error:`, err);
      throw err;
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add app directory to archive
    archive.directory(appPath, false);

    // Finalize archive
    await archive.finalize();

    console.log(`[FileManager] ZIP streamed: ${archive.pointer()} bytes`);
  }

  async saveZip(generationId: number): Promise<string> {
    const workspacePath = path.join(WORKSPACE_DIR, generationId.toString());
    const appPath = path.join(workspacePath, 'app');
    const zipPath = path.join(workspacePath, 'output.zip');

    console.log(`[FileManager] Creating ZIP for generation ${generationId}`);

    // Create archive
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`[FileManager] ZIP created: ${archive.pointer()} bytes at ${zipPath}`);
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        console.error(`[FileManager] Archive error:`, err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(appPath, false);
      archive.finalize();
    });
  }
}

export const fileManager = new FileManager();
