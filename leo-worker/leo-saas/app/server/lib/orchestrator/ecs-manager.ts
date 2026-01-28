import { ECSClient, RunTaskCommand, StopTaskCommand, DescribeTasksCommand } from '@aws-sdk/client-ecs';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import fs from 'fs/promises';
import * as tar from 'tar';
import { Readable } from 'stream';
import { wsManager } from '../websocket-server.js';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/tmp/generations';

export class ECSManager {
  private ecs: ECSClient;
  private s3: S3Client;
  private taskMap: Map<number, string> = new Map(); // generationId -> taskArn

  constructor() {
    this.ecs = new ECSClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
  }

  async runGeneration(generationId: number, prompt: string): Promise<string> {
    console.log(`[ECSManager] Starting task for generation ${generationId}`);
    console.log(`[ECSManager] Prompt: ${prompt.substring(0, 100)}...`);

    // Build WebSocket URL for generator to connect back to orchestrator
    // ALB listens on port 80 (HTTP), direct connection uses port 5013
    const wsHost = process.env.WS_HOST || process.env.ALB_DNS || 'localhost';
    const jobId = `job_${generationId}`;

    // If using ALB DNS, use port 80 (default HTTP), otherwise use 5013
    const wsUrl = process.env.ALB_DNS
      ? `ws://${wsHost}/ws/${jobId}`
      : `ws://${wsHost}:5013/ws/${jobId}`;

    console.log(`[ECSManager] WebSocket URL: ${wsUrl}`);

    // Pre-register WebSocket session to prevent race conditions
    // This ensures waitForReady() won't fail if called before WebSocket connects
    wsManager.registerSession(jobId);

    const params = {
      cluster: process.env.ECS_CLUSTER!,
      taskDefinition: process.env.APP_GENERATOR_TASK_DEF!,
      launchType: 'FARGATE' as const,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.TASK_SUBNETS!.split(','),
          securityGroups: [process.env.TASK_SECURITY_GROUP!],
          assignPublicIp: 'ENABLED' as const,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'app-generator',
            environment: [
              { name: 'GENERATION_ID', value: generationId.toString() },
              { name: 'PROMPT', value: prompt },
              { name: 'PYTHONUNBUFFERED', value: '1' },
              { name: 'S3_BUCKET', value: process.env.S3_BUCKET! },
              { name: 'WS_URL', value: wsUrl },
            ],
          },
        ],
      },
      tags: [
        { key: 'GenerationId', value: generationId.toString() },
        { key: 'Type', value: 'app-generator' },
      ],
    };

    try {
      const command = new RunTaskCommand(params);
      const result = await this.ecs.send(command);

      if (!result.tasks || result.tasks.length === 0) {
        const failure = result.failures?.[0];
        throw new Error(
          `Failed to start ECS task: ${failure?.reason || 'Unknown error'}`
        );
      }

      const taskArn = result.tasks[0].taskArn!;
      this.taskMap.set(generationId, taskArn);

      console.log(`[ECSManager] Task started: ${taskArn}`);

      // Wait for container to connect via WebSocket
      console.log(`[ECSManager] Waiting for container to connect...`);
      try {
        await wsManager.waitForReady(jobId, 60000); // 60 second timeout for container to start
        console.log(`[ECSManager] Container connected, sending initial command`);

        // Send initial command with prompt
        const sent = wsManager.sendCommand(jobId, prompt);
        if (!sent) {
          throw new Error('Failed to send command to container');
        }
        console.log(`[ECSManager] Initial command sent successfully`);
      } catch (error) {
        console.error(`[ECSManager] Failed to initialize container:`, error);
        // Clean up
        wsManager.cleanup(jobId);
        throw error;
      }

      return taskArn;
    } catch (error) {
      console.error(`[ECSManager] Failed to run task:`, error);
      throw error;
    }
  }

  async waitForCompletion(generationId: number, timeoutMs: number = 3600000): Promise<boolean> {
    const taskArn = this.taskMap.get(generationId);
    if (!taskArn) {
      console.error(`[ECSManager] No task found for generation ${generationId}`);
      return false;
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const command = new DescribeTasksCommand({
          cluster: process.env.ECS_CLUSTER!,
          tasks: [taskArn],
        });
        const result = await this.ecs.send(command);

        if (!result.tasks || result.tasks.length === 0) {
          console.error(`[ECSManager] Task ${taskArn} not found`);
          return false;
        }

        const task = result.tasks[0];
        const lastStatus = task.lastStatus;

        console.log(`[ECSManager] Task ${taskArn} status: ${lastStatus}`);

        if (lastStatus === 'STOPPED') {
          const exitCode = task.containers?.[0]?.exitCode;
          console.log(`[ECSManager] Task stopped with exit code: ${exitCode}`);
          return exitCode === 0;
        }

        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`[ECSManager] Error checking task status:`, error);
        return false;
      }
    }

    console.error(`[ECSManager] Task ${taskArn} timed out after ${timeoutMs}ms`);
    return false;
  }

  async extractFiles(generationId: number, _taskArn: string): Promise<string> {
    const bucketName = process.env.S3_BUCKET!;
    const key = `generations/${generationId}/app.tar.gz`;

    console.log(`[ECSManager] Downloading from S3: s3://${bucketName}/${key}`);

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      const result = await this.s3.send(command);

      if (!result.Body) {
        throw new Error('S3 object body is empty');
      }

      const workspacePath = path.join(WORKSPACE_DIR, generationId.toString());
      const archivePath = path.join(workspacePath, 'app.tar.gz');
      const appPath = path.join(workspacePath, 'app');

      await fs.mkdir(workspacePath, { recursive: true });

      // Write S3 body to file
      const bodyStream = result.Body as Readable;
      const writeStream = (await import('fs')).createWriteStream(archivePath);

      await new Promise<void>((resolve, reject) => {
        bodyStream.pipe(writeStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });

      // Extract tar.gz
      await tar.extract({
        file: archivePath,
        cwd: workspacePath,
      });

      console.log(`[ECSManager] Files extracted to: ${appPath}`);
      return appPath;
    } catch (error) {
      console.error(`[ECSManager] Failed to extract files from S3:`, error);
      throw error;
    }
  }

  async uploadToS3(generationId: number, userId: string, zipPath: string): Promise<string> {
    const bucketName = process.env.S3_BUCKET!;
    const key = `generations/${userId}/${generationId}.zip`;

    console.log(`[ECSManager] Uploading to S3: s3://${bucketName}/${key}`);

    try {
      const fileContent = await fs.readFile(zipPath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/zip',
      });

      await this.s3.send(command);

      // Generate pre-signed URL (expires in 24 hours)
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const downloadUrl = await getSignedUrl(this.s3, getCommand, {
        expiresIn: 86400, // 24 hours
      });

      console.log(`[ECSManager] Upload successful, pre-signed URL generated`);
      return downloadUrl;
    } catch (error) {
      console.error(`[ECSManager] Failed to upload to S3:`, error);
      throw error;
    }
  }

  async stopContainer(taskArn: string): Promise<void> {
    console.log(`[ECSManager] Stopping task ${taskArn}`);

    try {
      const command = new StopTaskCommand({
        cluster: process.env.ECS_CLUSTER!,
        task: taskArn,
        reason: 'Generation completed or cancelled',
      });
      await this.ecs.send(command);

      // Remove from task map
      for (const [generationId, arn] of this.taskMap.entries()) {
        if (arn === taskArn) {
          this.taskMap.delete(generationId);
          break;
        }
      }
    } catch (error) {
      console.error(`[ECSManager] Failed to stop task:`, error);
      // Don't throw - cleanup is best effort
    }
  }

  async getContainerLogs(_taskArn: string): Promise<string> {
    console.warn('[ECSManager] getContainerLogs should use CloudWatch Logs API');
    return 'Logs available in CloudWatch Logs';
  }
}

export const ecsManager = new ECSManager();
