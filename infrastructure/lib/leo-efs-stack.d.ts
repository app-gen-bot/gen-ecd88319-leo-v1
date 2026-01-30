import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import { Construct } from 'constructs';
/**
 * Props for the Leo EFS Stack.
 *
 * Requires VPC and security group from the main LeoSaasStack to enable
 * generator tasks to mount the EFS volume.
 */
export interface LeoEfsStackProps extends cdk.StackProps {
    /**
     * VPC where EFS mount targets will be created.
     */
    vpc: ec2.IVpc;
    /**
     * Security group of the generator tasks that will mount EFS.
     * The EFS security group will allow NFS traffic (port 2049) from this group.
     */
    generatorSecurityGroup: ec2.ISecurityGroup;
}
/**
 * Leo EFS Stack - Persistent storage for Leo Generator containers.
 *
 * Creates an EFS file system that generator containers can mount to persist:
 * - App source code and node_modules (instant resume)
 * - Claude session files (conversation context)
 *
 * This stack is separate from LeoSaasStack to allow:
 * - Independent deployment (EFS persists across main stack updates)
 * - Safe rollback (can delete EFS stack without affecting main stack)
 * - RETAIN policy protects data even if stack is deleted
 *
 * Directory structure on EFS:
 * /apps/{app_id}/
 * ├── workspace/app/    → source code + node_modules + .git
 * └── .claude/          → Claude session files
 */
export declare class LeoEfsStack extends cdk.Stack {
    /**
     * The EFS FileSystem resource.
     */
    readonly fileSystem: efs.FileSystem;
    /**
     * Access point for the /apps directory.
     * Provides POSIX user mapping (uid/gid 1000) for container access.
     */
    readonly accessPoint: efs.AccessPoint;
    /**
     * Security group for EFS mount targets.
     * Allows NFS traffic from generator tasks.
     */
    readonly securityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: LeoEfsStackProps);
}
