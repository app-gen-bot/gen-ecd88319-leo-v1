import { localOrchestrator } from './local-orchestrator';
import { awsOrchestrator } from './aws-orchestrator';

export interface IOrchestrator {
  startGeneration(requestId: number, userId: string, prompt: string, mode?: string): Promise<void>;
  getGenerationStatus(requestId: number): Promise<{
    status: 'queued' | 'generating' | 'completed' | 'failed' | 'paused' | 'cancelled';
    errorMessage?: string;
  }>;
}

export function createOrchestrator(): IOrchestrator {
  // Check USE_AWS_ORCHESTRATOR flag first - this is the authoritative source
  const useAWS = process.env.USE_AWS_ORCHESTRATOR === 'true';

  // Validate AWS configuration if AWS mode is requested
  if (useAWS) {
    const missingVars: string[] = [];

    // Check required AWS environment variables
    const requiredAWSVars = {
      ECS_CLUSTER: 'ECS cluster name',
      APP_GENERATOR_TASK_DEF: 'ECS task definition ARN',
      TASK_SUBNETS: 'Comma-separated subnet IDs',
      TASK_SECURITY_GROUP: 'Security group ID',
      S3_BUCKET: 'S3 bucket for generated apps',
      AWS_REGION: 'AWS region'
    };

    for (const [varName, description] of Object.entries(requiredAWSVars)) {
      if (!process.env[varName]) {
        missingVars.push(`  - ${varName}: ${description}`);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `AWS orchestrator configuration incomplete. Missing environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please configure these in your .env file or run 'npx cdk deploy' to provision AWS infrastructure.`
      );
    }
  }

  // Only use AWS mode if explicitly enabled AND all required config is present
  const isAWS = useAWS && !!process.env.ECS_CLUSTER;

  if (isAWS) {
    console.log('🚀 Orchestrator Mode: AWS ECS (production)');
    console.log('   ECS Cluster:', process.env.ECS_CLUSTER);
    console.log('   Task Definition:', process.env.APP_GENERATOR_TASK_DEF?.split('/').pop());
    console.log('   S3 Bucket:', process.env.S3_BUCKET);
    console.log('   AWS Region:', process.env.AWS_REGION);
    return awsOrchestrator;
  }

  console.log('🚀 Orchestrator Mode: DOCKER LOCAL (development)');
  console.log('   Workspace:', process.env.WORKSPACE_DIR || '/tmp/generations');
  console.log('   Docker Image:', process.env.GENERATOR_IMAGE || 'leo-websocket');
  return localOrchestrator;
}

export const orchestrator = createOrchestrator();
