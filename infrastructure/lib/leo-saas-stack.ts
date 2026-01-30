import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class LeoSaasStack extends cdk.Stack {
  /**
   * The VPC where all Leo resources are deployed.
   * Exported for use by LeoEfsStack.
   */
  public readonly vpc: ec2.Vpc;

  /**
   * Security group for Leo generator tasks.
   * Exported for use by LeoEfsStack (to allow NFS traffic).
   */
  public readonly generatorSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Image tags from environment (set by deploy script)
    const leoSaasAppTag = process.env.LEO_SAAS_APP_TAG;
    const leoGeneratorTag = process.env.LEO_GENERATOR_TAG;
    const leoGeneratorUriTag = process.env.LEO_GENERATOR_URI_TAG;

    // Fail fast if tags not provided (no fallback to 'latest')
    if (!leoSaasAppTag || !leoGeneratorTag || !leoGeneratorUriTag) {
      throw new Error(
        'Image tags not provided. Run deployment via ./scripts/deploy.sh'
      );
    }

    // =========================================================================
    // Optional EFS Integration
    // =========================================================================
    // EFS provides persistent storage for generator containers, enabling
    // instant resume (~10s vs 5-10min). Pass these context vars to enable:
    //   -c efsFileSystemId=fs-xxx -c efsAccessPointId=fsap-xxx
    //
    // Get IDs from LeoEfsStack outputs after deploying:
    //   aws cloudformation describe-stacks --stack-name LeoEfsStack \
    //     --query 'Stacks[0].Outputs'
    const efsFileSystemId = this.node.tryGetContext('efsFileSystemId') as string | undefined;
    const efsAccessPointId = this.node.tryGetContext('efsAccessPointId') as string | undefined;
    const efsEnabled = !!(efsFileSystemId && efsAccessPointId);

    if (efsEnabled) {
      console.log(`EFS enabled: FileSystem=${efsFileSystemId}, AccessPoint=${efsAccessPointId}`);
    } else {
      console.log('EFS not enabled (pass -c efsFileSystemId=... -c efsAccessPointId=... to enable)');
    }

    // VPC for all Leo resources
    // Exported via this.vpc for use by LeoEfsStack
    this.vpc = new ec2.Vpc(this, 'LeoSaasVPC', {
      maxAzs: 2,
      natGateways: 0,
      ipProtocol: ec2.IpProtocol.DUAL_STACK,  // Enable IPv6
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
      ],
    });
    const vpc = this.vpc; // Local alias for convenience

    const supabaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseUrl',
      'leo/supabase-url'
    );

    const supabaseAnonKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseAnonKey',
      'leo/supabase-anon-key'
    );

    const supabaseServiceRoleKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseServiceRoleKey',
      'leo/supabase-service-role-key'
    );

    const databaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'DatabaseUrl',
      'leo/database-url'
    );

    const githubBotTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'GithubBotToken',
      'leo/github-bot-token'
    );

    const flyApiTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'FlyApiToken',
      'leo/fly-api-token'
    );

    // Pool mode removed - now using per-app Supabase mode
    // See STATUS.md 2026-01-04: "Pool Mode Removal"

    const appBucket = new s3.Bucket(this, 'LeoSaasGeneratedAppsBucket', {
      bucketName: `leo-saas-generated-apps-${this.account}`,
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          id: 'DeleteOldApps',
          enabled: true,
          expiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const claudeTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'ClaudeOAuthToken',
      'leo/claude-oauth-token'
    );

    const openaiApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'OpenaiApiKey',
      'leo/openai-api-key'
    );

    const supabaseAccessTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SupabaseAccessToken',
      'leo/supabase-access-token'
    );

    const cluster = new ecs.Cluster(this, 'LeoSaasCluster', {
      clusterName: 'leo-saas-cluster',
      vpc,
      containerInsights: true,
    });

    // CloudMap namespace for service discovery
    // This allows containers to discover each other via internal DNS (e.g., orchestrator.leo-saas.local)
    const namespace = new servicediscovery.PrivateDnsNamespace(this, 'LeoSaasNamespace', {
      name: 'leo-saas.local',
      vpc,
      description: 'CloudMap namespace for LEO SaaS service discovery',
    });

    const appGenSaasRepository = new ecr.Repository(this, 'LeoSaasAppRepository', {
      repositoryName: 'leo-saas-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true,
    });

    const appGeneratorRepository = new ecr.Repository(this, 'LeoRepository', {
      repositoryName: 'leo',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true,
    });

    const appGenSaasTaskRole = new iam.Role(this, 'LeoSaasAppTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for leo-saas-app service',
    });

    appGenSaasTaskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecs:RunTask',
        'ecs:StopTask',
        'ecs:DescribeTasks',
        'ecs:ListTasks',
        'ecs:TagResource',
      ],
      resources: ['*'],
      conditions: {
        'ArnEquals': {
          'ecs:cluster': cluster.clusterArn,
        },
      },
    }));

    appGenSaasTaskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['iam:PassRole'],
      resources: ['*'],
      conditions: {
        'StringLike': {
          'iam:PassedToService': 'ecs-tasks.amazonaws.com',
        },
      },
    }));

    appBucket.grantReadWrite(appGenSaasTaskRole);
    claudeTokenSecret.grantRead(appGenSaasTaskRole);
    supabaseUrlSecret.grantRead(appGenSaasTaskRole);
    supabaseAnonKeySecret.grantRead(appGenSaasTaskRole);
    supabaseServiceRoleKeySecret.grantRead(appGenSaasTaskRole);
    databaseUrlSecret.grantRead(appGenSaasTaskRole);
    githubBotTokenSecret.grantRead(appGenSaasTaskRole);
    flyApiTokenSecret.grantRead(appGenSaasTaskRole);

    const appGeneratorTaskRole = new iam.Role(this, 'LeoTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Task role for leo generator tasks',
    });

    appBucket.grantWrite(appGeneratorTaskRole);
    // All secrets loaded at runtime via aws_secrets.py (not ECS task definition)
    claudeTokenSecret.grantRead(appGeneratorTaskRole);
    supabaseAccessTokenSecret.grantRead(appGeneratorTaskRole);
    githubBotTokenSecret.grantRead(appGeneratorTaskRole);
    flyApiTokenSecret.grantRead(appGeneratorTaskRole);

    const executionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Execution role grants for leo-saas-app container (ECS secret injection)
    // Note: Generator container secrets are loaded at runtime via aws_secrets.py
    supabaseUrlSecret.grantRead(executionRole);
    supabaseAnonKeySecret.grantRead(executionRole);
    supabaseServiceRoleKeySecret.grantRead(executionRole);
    databaseUrlSecret.grantRead(executionRole);
    githubBotTokenSecret.grantRead(executionRole);
    flyApiTokenSecret.grantRead(executionRole);
    claudeTokenSecret.grantRead(executionRole);  // For leo-saas-app's CLAUDE_CODE_OAUTH_TOKEN
    openaiApiKeySecret.grantRead(executionRole);  // For leo-saas-app's OPENAI_API_KEY (summarizer)

    const appGenSaasTaskDef = new ecs.FargateTaskDefinition(this, 'LeoSaasAppTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskRole: appGenSaasTaskRole,
      executionRole,
    });

    appGenSaasTaskDef.addContainer('leo-saas-app', {
      image: ecs.ContainerImage.fromEcrRepository(appGenSaasRepository, leoSaasAppTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'leo-saas-app',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '5013',
        AUTH_MODE: 'supabase',
        STORAGE_MODE: 'database',
        AWS_REGION: this.region,  // Required for AWS SDK (Secrets Manager)
        USE_AWS_ORCHESTRATOR: 'true',
        USE_GITHUB_INTEGRATION: 'true',
        ECS_CLUSTER: cluster.clusterName,
        ECS_SUBNETS: vpc.publicSubnets.map(s => s.subnetId).join(','),
        ECS_CONTAINER_NAME: 'leo',  // Must match containerName in LeoTaskDef
        S3_BUCKET: appBucket.bucketName,
        GENERATOR_IMAGE: `${appGeneratorRepository.repositoryUri}:${leoGeneratorUriTag}`,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        // Note: ECS_SECURITY_GROUP, ECS_TASK_DEFINITION, and WSI_PUBLIC_URL
        // are added later via CloudFormation escape hatch after all resources are created
      },
      secrets: {
        // Main Leo SaaS database (leo-dev)
        SUPABASE_URL: ecs.Secret.fromSecretsManager(supabaseUrlSecret),
        SUPABASE_ANON_KEY: ecs.Secret.fromSecretsManager(supabaseAnonKeySecret),
        SUPABASE_SERVICE_ROLE_KEY: ecs.Secret.fromSecretsManager(supabaseServiceRoleKeySecret),
        DATABASE_URL: ecs.Secret.fromSecretsManager(databaseUrlSecret),
        // Pool secrets removed - using per-app Supabase mode
        GITHUB_BOT_TOKEN: ecs.Secret.fromSecretsManager(githubBotTokenSecret),
        FLY_API_TOKEN: ecs.Secret.fromSecretsManager(flyApiTokenSecret),
        CLAUDE_CODE_OAUTH_TOKEN: ecs.Secret.fromSecretsManager(claudeTokenSecret),
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openaiApiKeySecret),
      },
      portMappings: [{
        containerPort: 5013,
        protocol: ecs.Protocol.TCP,
      }],
    });

    // Generator task definition - optionally includes EFS volume
    const appGeneratorTaskDef = new ecs.FargateTaskDefinition(this, 'LeoTaskDef', {
      memoryLimitMiB: 8192,  // 8GB for MVP - prevents OOM kills, cheap at ~$0.05/15min
      cpu: 4096,  // 4 vCPU - Fargate requires 1:2 CPU:Memory ratio
      taskRole: appGeneratorTaskRole,
      executionRole,
      // Conditionally add EFS volume when enabled
      ...(efsEnabled ? {
        volumes: [{
          name: 'leo-efs',
          efsVolumeConfiguration: {
            fileSystemId: efsFileSystemId!,
            transitEncryption: 'ENABLED',
            authorizationConfig: {
              accessPointId: efsAccessPointId!,
              iam: 'ENABLED',
            },
          },
        }],
      } : {}),
    });

    // Add EFS IAM permissions when enabled
    if (efsEnabled) {
      appGeneratorTaskRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'elasticfilesystem:ClientMount',
          'elasticfilesystem:ClientWrite',
          'elasticfilesystem:ClientRootAccess',
        ],
        resources: [`arn:aws:elasticfilesystem:${this.region}:${this.account}:file-system/${efsFileSystemId}`],
      }));
    }

    // Generator container - optionally includes EFS mount point
    // Note: Generator gets CLAUDE_CODE_OAUTH_TOKEN passed via environment overrides
    // from orchestrator at runtime (see fargate-container-manager.ts). No secrets
    // block needed here.
    const generatorContainer = appGeneratorTaskDef.addContainer('leo', {
      containerName: 'leo',
      image: ecs.ContainerImage.fromEcrRepository(appGeneratorRepository, leoGeneratorTag),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'leo',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        AWS_REGION: this.region,
        S3_BUCKET: appBucket.bucketName,
      },
      // No secrets block - all secrets loaded at runtime via aws_secrets.py
    });

    // Add EFS mount point when enabled
    if (efsEnabled) {
      generatorContainer.addMountPoints({
        containerPath: '/efs',
        sourceVolume: 'leo-efs',
        readOnly: false,
      });
    }

    // Add ECS_TASK_DEFINITION to app-gen-saas container now that it's defined
    const appGenSaasContainer = appGenSaasTaskDef.defaultContainer!;
    appGenSaasContainer.addEnvironment('ECS_TASK_DEFINITION', appGeneratorTaskDef.taskDefinitionArn);
    appGenSaasContainer.addEnvironment('ECS_SECURITY_GROUP', ''); // Will be set after security group creation

    const appGenSaasSecurityGroup = new ec2.SecurityGroup(this, 'LeoSaasAppSG', {
      vpc,
      description: 'Security group for leo-saas-app service',
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,  // Required for Supabase IPv6 connectivity
    });

    // Security group for Leo generator tasks
    // Exported via this.generatorSecurityGroup for use by LeoEfsStack
    this.generatorSecurityGroup = new ec2.SecurityGroup(this, 'LeoSG', {
      vpc,
      description: 'Security group for leo generator tasks',
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,  // Required for Supabase IPv6 connectivity
    });
    const appGeneratorSecurityGroup = this.generatorSecurityGroup; // Local alias

    // Allow generator tasks to connect directly to orchestrator service (bypass ALB for WebSocket)
    // This is needed because internet-facing ALBs can't be reached from within VPC using public DNS
    appGenSaasSecurityGroup.addIngressRule(
      appGeneratorSecurityGroup,
      ec2.Port.tcp(5013),
      'Allow generator tasks to connect directly to orchestrator for WebSocket'
    );

    // Now update the ECS_SECURITY_GROUP with the actual value
    appGenSaasContainer.addEnvironment('ECS_SECURITY_GROUP', appGeneratorSecurityGroup.securityGroupId);

    const albSecurityGroup = new ec2.SecurityGroup(this, 'LeoSaasALBSG', {
      vpc,
      description: 'Security group for Leo SaaS ALB',
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,  // Required for IPv6 dual-stack
    });

    // Note: Security group ingress rules are overridden after CloudFront
    // is configured to allow traffic from CloudFront (geo-restricted).

    appGenSaasSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(5013),
      'Allow traffic from ALB on port 5013'
    );

    // Allow generator tasks to connect back to ALB for WebSocket communication
    // Using VPC CIDR instead of security group to avoid hairpinning issues
    albSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(80),
      'Allow VPC internal traffic to ALB on port 80 for WebSocket'
    );

    const alb = new elbv2.ApplicationLoadBalancer(this, 'LeoSaasALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    const appGenSaasService = new ecs.FargateService(this, 'LeoSaasService', {
      cluster,
      taskDefinition: appGenSaasTaskDef,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [appGenSaasSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      // Service Discovery: Register with CloudMap for internal DNS
      // This creates orchestrator.leo-saas.local DNS name for generator containers to connect
      cloudMapOptions: {
        name: 'orchestrator',
        cloudMapNamespace: namespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: cdk.Duration.seconds(10),
        containerPort: 5013,  // WebSocket server port
      },
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'LeoSaasTargetGroup', {
      vpc,
      port: 5013,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: '/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      // Enable sticky sessions for WebSocket support
      // WebSocket connections require session affinity to ensure all frames
      // go to the same backend instance for the duration of the connection
      stickinessCookieDuration: cdk.Duration.days(1),
      stickinessCookieName: 'LeoSaasStickiness',
    });

    appGenSaasService.attachToApplicationTargetGroup(targetGroup);

    // Add ALB DNS to container environment for WebSocket URL generation
    appGenSaasContainer.addEnvironment('ALB_DNS', alb.loadBalancerDnsName);

    // Optional: HTTPS support via ACM certificate
    // To enable HTTPS: cdk deploy -c certificateArn=arn:aws:acm:region:account:certificate/id
    const certificateArn = this.node.tryGetContext('certificateArn');

    // Add API_URL for frontend configuration injection
    // Frontend needs this to make API requests to the correct endpoint
    // Use HTTPS if certificate is configured, otherwise HTTP
    const apiUrl = certificateArn
      ? `https://${alb.loadBalancerDnsName}`
      : `http://${alb.loadBalancerDnsName}`;
    appGenSaasContainer.addEnvironment('API_URL', apiUrl);

    if (certificateArn) {
      // HTTPS listener (production)
      const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);

      alb.addListener('HTTPSListener', {
        port: 443,
        protocol: elbv2.ApplicationProtocol.HTTPS,
        certificates: [certificate],
        defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      });

      // HTTP listener redirects to HTTPS
      alb.addListener('HTTPListener', {
        port: 80,
        defaultAction: elbv2.ListenerAction.redirect({
          protocol: 'HTTPS',
          port: '443',
          permanent: true,
        }),
      });

      new cdk.CfnOutput(this, 'URL', {
        value: `https://${alb.loadBalancerDnsName}`,
        description: 'Application URL (HTTPS)',
      });
    } else {
      // HTTP listener only (testing/development)
      alb.addListener('HTTPListener', {
        port: 80,
        defaultAction: elbv2.ListenerAction.forward([targetGroup]),
      });

      new cdk.CfnOutput(this, 'URL', {
        value: `http://${alb.loadBalancerDnsName}`,
        description: 'Application URL (HTTP - add certificateArn context for HTTPS)',
      });
    }

    // CloudFront distribution with geo-restriction
    // Provides HTTPS via *.cloudfront.net domain and geo-fencing
    const cfnSecurityGroup = albSecurityGroup.node.defaultChild as ec2.CfnSecurityGroup;

    // S3 bucket for CloudFront access logs
    // Enables traffic analysis, bot detection, and geo-restriction verification
    const accessLogsBucket = new s3.Bucket(this, 'CloudFrontAccessLogsBucket', {
      bucketName: `leo-saas-access-logs-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(90), // Keep logs for 90 days
        },
      ],
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    const distribution = new cloudfront.Distribution(this, 'LeoSaasDistribution', {
      comment: 'Leo SaaS CDN with geo-restriction',
      defaultBehavior: {
        origin: new origins.HttpOrigin(alb.loadBalancerDnsName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      },
      // Geo-restriction: ALLOW only US, Mexico, Puerto Rico
      geoRestriction: cloudfront.GeoRestriction.allowlist('US', 'MX', 'PR'),
      // Enable HTTP/2 and HTTP/3 for better WebSocket performance
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe only
      // Access logging for traffic analysis and bot detection
      logBucket: accessLogsBucket,
      logFilePrefix: 'cloudfront/',
      enableLogging: true,
    });

    new cdk.CfnOutput(this, 'AccessLogsBucketName', {
      value: accessLogsBucket.bucketName,
      description: 'S3 bucket for CloudFront access logs',
    });

    // Look up CloudFront managed prefix list
    // This contains all CloudFront edge IP ranges and auto-updates
    const cloudFrontPrefixList = ec2.PrefixList.fromLookup(this, 'CloudFrontPrefixList', {
      prefixListName: 'com.amazonaws.global.cloudfront.origin-facing',
    });

    // Update security group to ONLY allow CloudFront traffic (enforces geo-restriction)
    cfnSecurityGroup.securityGroupIngress = [
      // CloudFront IP ranges via managed prefix list - blocks direct ALB access
      {
        ipProtocol: 'tcp',
        fromPort: 80,
        toPort: 80,
        sourcePrefixListId: cloudFrontPrefixList.prefixListId,
        description: 'Allow HTTP only from CloudFront (geo-restriction enforced)',
      },
      // VPC internal - required for generator WebSocket connections
      {
        ipProtocol: 'tcp',
        fromPort: 80,
        toPort: 80,
        cidrIp: '10.0.0.0/16',
        description: 'Allow HTTP from VPC internal (for generator WebSocket connections)',
      },
      {
        ipProtocol: 'tcp',
        fromPort: 80,
        toPort: 80,
        sourceSecurityGroupId: appGeneratorSecurityGroup.securityGroupId,
        description: 'Allow HTTP from generator tasks security group',
      },
    ];

    // Output CloudFront URL (this is now the primary access point)
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL (geo-restricted to US, MX, PR)',
      exportName: 'LeoSaasCloudFrontURL',
    });

    // Add ECS orchestrator environment variables via CloudFormation property override
    // These variables reference resources created later in the stack, so we can't
    // add them in the normal environment block. We use addPropertyOverride to add
    // them to the first container's environment variables.
    const cfnTaskDef = appGenSaasTaskDef.node.defaultChild as ecs.CfnTaskDefinition;

    // Get the current environment array length to append new vars
    // These names must match what FargateContainerManager expects
    cfnTaskDef.addPropertyOverride('ContainerDefinitions.0.Environment.12', {
      Name: 'ECS_SECURITY_GROUP',
      Value: appGeneratorSecurityGroup.securityGroupId,
    });
    cfnTaskDef.addPropertyOverride('ContainerDefinitions.0.Environment.13', {
      Name: 'ECS_TASK_DEFINITION',
      Value: appGeneratorTaskDef.taskDefinitionArn,
    });
    // Use CloudMap internal DNS for WebSocket connection from generator tasks
    // ALB public DNS doesn't work from inside VPC (hairpin NAT issue)
    cfnTaskDef.addPropertyOverride('ContainerDefinitions.0.Environment.14', {
      Name: 'WSI_PUBLIC_URL',
      Value: `ws://orchestrator.leo-saas.local:5013/wsi`,
    });

    new cdk.CfnOutput(this, 'SupabaseUrlSecretArn', {
      value: supabaseUrlSecret.secretArn,
      description: 'Supabase URL secret ARN',
      exportName: 'LeoSaas-SupabaseUrlSecretArn',
    });

    new cdk.CfnOutput(this, 'SupabaseAnonKeySecretArn', {
      value: supabaseAnonKeySecret.secretArn,
      description: 'Supabase anon key secret ARN',
      exportName: 'LeoSaas-SupabaseAnonKeySecretArn',
    });

    new cdk.CfnOutput(this, 'SupabaseServiceRoleKeySecretArn', {
      value: supabaseServiceRoleKeySecret.secretArn,
      description: 'Supabase service role key secret ARN',
      exportName: 'LeoSaas-SupabaseServiceRoleKeySecretArn',
    });

    new cdk.CfnOutput(this, 'ALBDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
      exportName: 'LeoSaasALBDnsName',
    });

    new cdk.CfnOutput(this, 'LeoTaskDefArn', {
      value: appGeneratorTaskDef.taskDefinitionArn,
      description: 'Leo Generator Task Definition ARN',
      exportName: 'LeoTaskDefArn',
    });

    new cdk.CfnOutput(this, 'LeoSecurityGroupId', {
      value: appGeneratorSecurityGroup.securityGroupId,
      description: 'Security Group ID for leo generator tasks',
      exportName: 'LeoSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'LeoSubnetIds', {
      value: vpc.publicSubnets.map(s => s.subnetId).join(','),
      description: 'Subnet IDs for leo generator tasks',
      exportName: 'LeoSubnetIds',
    });

    new cdk.CfnOutput(this, 'LeoSaasGeneratedAppsBucketName', {
      value: appBucket.bucketName,
      description: 'S3 bucket for generated apps',
      exportName: 'LeoSaasGeneratedAppsBucketName',
    });

    new cdk.CfnOutput(this, 'ClaudeTokenSecretArn', {
      value: claudeTokenSecret.secretArn,
      description: 'Claude OAuth token secret ARN',
      exportName: 'LeoSaas-ClaudeTokenSecretArn',
    });

    new cdk.CfnOutput(this, 'LeoSaasAppRepositoryUri', {
      value: appGenSaasRepository.repositoryUri,
      description: 'ECR URI for Leo SaaS App repository',
    });

    new cdk.CfnOutput(this, 'LeoRepositoryUri', {
      value: appGeneratorRepository.repositoryUri,
      description: 'ECR URI for Leo Generator repository',
    });
  }
}
