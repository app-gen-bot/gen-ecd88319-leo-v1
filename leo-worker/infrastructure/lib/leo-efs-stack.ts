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
export class LeoEfsStack extends cdk.Stack {
  /**
   * The EFS FileSystem resource.
   */
  public readonly fileSystem: efs.FileSystem;

  /**
   * Access point for the /apps directory.
   * Provides POSIX user mapping (uid/gid 1000) for container access.
   */
  public readonly accessPoint: efs.AccessPoint;

  /**
   * Security group for EFS mount targets.
   * Allows NFS traffic from generator tasks.
   */
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: LeoEfsStackProps) {
    super(scope, id, props);

    // Security group for EFS mount targets
    // Only allows NFS traffic (port 2049) from generator tasks
    this.securityGroup = new ec2.SecurityGroup(this, 'LeoEfsSG', {
      vpc: props.vpc,
      description: 'Security group for Leo EFS mount targets',
      allowAllOutbound: true,
    });

    // Allow NFS traffic from generator tasks
    this.securityGroup.addIngressRule(
      props.generatorSecurityGroup,
      ec2.Port.tcp(2049),
      'Allow NFS from Leo generator tasks'
    );

    // EFS FileSystem for persistent storage
    // Configuration optimized for Leo's use case:
    // - General purpose mode (low latency for npm/node operations)
    // - Elastic throughput (scales with usage)
    // - 30-day lifecycle policy (move infrequently accessed files to IA)
    // - Encrypted at rest
    // - Automatic backups enabled
    // - RETAIN policy (protect data even if stack is deleted)
    this.fileSystem = new efs.FileSystem(this, 'LeoGeneratorEfs', {
      vpc: props.vpc,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.ELASTIC,
      encrypted: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Protect data!
      enableAutomaticBackups: true,
      securityGroup: this.securityGroup,
      fileSystemName: 'leo-generator-efs',
    });

    // Access point for /apps directory
    // Creates the /apps directory with proper permissions for containers
    // POSIX user (uid/gid 1000) matches typical container user
    this.accessPoint = this.fileSystem.addAccessPoint('LeoAppsAccessPoint', {
      path: '/apps',
      createAcl: {
        ownerGid: '1000',
        ownerUid: '1000',
        permissions: '755',
      },
      posixUser: {
        gid: '1000',
        uid: '1000',
      },
    });

    // =========================================================================
    // Outputs
    // =========================================================================
    // These are exported for use by LeoSaasStack when enabling EFS

    new cdk.CfnOutput(this, 'EfsFileSystemId', {
      value: this.fileSystem.fileSystemId,
      description: 'EFS FileSystem ID for Leo Generator',
      exportName: 'LeoEfsFileSystemId',
    });

    new cdk.CfnOutput(this, 'EfsAccessPointId', {
      value: this.accessPoint.accessPointId,
      description: 'EFS Access Point ID for Leo Generator',
      exportName: 'LeoEfsAccessPointId',
    });

    new cdk.CfnOutput(this, 'EfsSecurityGroupId', {
      value: this.securityGroup.securityGroupId,
      description: 'EFS Security Group ID',
      exportName: 'LeoEfsSecurityGroupId',
    });
  }
}
