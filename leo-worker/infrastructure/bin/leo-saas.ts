#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LeoSaasStack } from '../lib/leo-saas-stack';
import { LeoEfsStack } from '../lib/leo-efs-stack';

const app = new cdk.App();

// Common environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Common tags
const tags = {
  Environment: 'Production',
  Project: 'LeoSaas',
  ManagedBy: 'CDK',
};

// =============================================================================
// Main Stack - Leo SaaS Platform
// =============================================================================
// Creates VPC, ECS cluster, services, ALB, CloudFront, etc.
// Exports VPC and generatorSecurityGroup for use by EFS stack.
const saasStack = new LeoSaasStack(app, 'LeoSaasStack', {
  env,
  description: 'Leo SaaS platform deployment on AWS Fargate with Supabase authentication',
  tags,
});

// =============================================================================
// EFS Stack - Persistent Storage (Optional)
// =============================================================================
// Creates EFS file system for generator container persistent storage.
// Depends on LeoSaasStack for VPC and security group.
//
// Deployment workflow:
// 1. Deploy LeoSaasStack first (creates VPC, security groups)
// 2. Deploy LeoEfsStack (creates EFS in the VPC)
// 3. Re-deploy LeoSaasStack with EFS context to enable mount:
//      cdk deploy LeoSaasStack \
//        -c efsFileSystemId=$(aws cloudformation describe-stacks --stack-name LeoEfsStack \
//           --query 'Stacks[0].Outputs[?ExportName==`LeoEfsFileSystemId`].OutputValue' --output text) \
//        -c efsAccessPointId=$(aws cloudformation describe-stacks --stack-name LeoEfsStack \
//           --query 'Stacks[0].Outputs[?ExportName==`LeoEfsAccessPointId`].OutputValue' --output text)
const efsStack = new LeoEfsStack(app, 'LeoEfsStack', {
  env,
  description: 'EFS persistent storage for Leo Generator containers - enables instant resume',
  vpc: saasStack.vpc,
  generatorSecurityGroup: saasStack.generatorSecurityGroup,
  tags,
});

// EFS stack depends on main stack (needs VPC and security group)
efsStack.addDependency(saasStack);

app.synth();
