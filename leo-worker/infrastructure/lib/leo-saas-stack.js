"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeoSaasStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const ecr = __importStar(require("aws-cdk-lib/aws-ecr"));
const elbv2 = __importStar(require("aws-cdk-lib/aws-elasticloadbalancingv2"));
const acm = __importStar(require("aws-cdk-lib/aws-certificatemanager"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const secretsmanager = __importStar(require("aws-cdk-lib/aws-secretsmanager"));
const servicediscovery = __importStar(require("aws-cdk-lib/aws-servicediscovery"));
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const origins = __importStar(require("aws-cdk-lib/aws-cloudfront-origins"));
class LeoSaasStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Image tags from environment (set by deploy script)
        const leoSaasAppTag = process.env.LEO_SAAS_APP_TAG;
        const leoGeneratorTag = process.env.LEO_GENERATOR_TAG;
        const leoGeneratorUriTag = process.env.LEO_GENERATOR_URI_TAG;
        // Fail fast if tags not provided (no fallback to 'latest')
        if (!leoSaasAppTag || !leoGeneratorTag || !leoGeneratorUriTag) {
            throw new Error('Image tags not provided. Run deployment via ./scripts/deploy.sh');
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
        const efsFileSystemId = this.node.tryGetContext('efsFileSystemId');
        const efsAccessPointId = this.node.tryGetContext('efsAccessPointId');
        const efsEnabled = !!(efsFileSystemId && efsAccessPointId);
        if (efsEnabled) {
            console.log(`EFS enabled: FileSystem=${efsFileSystemId}, AccessPoint=${efsAccessPointId}`);
        }
        else {
            console.log('EFS not enabled (pass -c efsFileSystemId=... -c efsAccessPointId=... to enable)');
        }
        // VPC for all Leo resources
        // Exported via this.vpc for use by LeoEfsStack
        this.vpc = new ec2.Vpc(this, 'LeoSaasVPC', {
            maxAzs: 2,
            natGateways: 0,
            ipProtocol: ec2.IpProtocol.DUAL_STACK, // Enable IPv6
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
        const supabaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(this, 'SupabaseUrl', 'leo/supabase-url');
        const supabaseAnonKeySecret = secretsmanager.Secret.fromSecretNameV2(this, 'SupabaseAnonKey', 'leo/supabase-anon-key');
        const supabaseServiceRoleKeySecret = secretsmanager.Secret.fromSecretNameV2(this, 'SupabaseServiceRoleKey', 'leo/supabase-service-role-key');
        const databaseUrlSecret = secretsmanager.Secret.fromSecretNameV2(this, 'DatabaseUrl', 'leo/database-url');
        const githubBotTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GithubBotToken', 'leo/github-bot-token');
        const flyApiTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'FlyApiToken', 'leo/fly-api-token');
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
        const claudeTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'ClaudeOAuthToken', 'leo/claude-oauth-token');
        const supabaseAccessTokenSecret = secretsmanager.Secret.fromSecretNameV2(this, 'SupabaseAccessToken', 'leo/supabase-access-token');
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
        claudeTokenSecret.grantRead(executionRole); // For leo-saas-app's CLAUDE_CODE_OAUTH_TOKEN
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
                AWS_REGION: this.region, // Required for AWS SDK (Secrets Manager)
                USE_AWS_ORCHESTRATOR: 'true',
                USE_GITHUB_INTEGRATION: 'true',
                ECS_CLUSTER: cluster.clusterName,
                ECS_SUBNETS: vpc.publicSubnets.map(s => s.subnetId).join(','),
                ECS_CONTAINER_NAME: 'leo', // Must match containerName in LeoTaskDef
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
            },
            portMappings: [{
                    containerPort: 5013,
                    protocol: ecs.Protocol.TCP,
                }],
        });
        // Generator task definition - optionally includes EFS volume
        const appGeneratorTaskDef = new ecs.FargateTaskDefinition(this, 'LeoTaskDef', {
            memoryLimitMiB: 8192, // 8GB for MVP - prevents OOM kills, cheap at ~$0.05/15min
            cpu: 4096, // 4 vCPU - Fargate requires 1:2 CPU:Memory ratio
            taskRole: appGeneratorTaskRole,
            executionRole,
            // Conditionally add EFS volume when enabled
            ...(efsEnabled ? {
                volumes: [{
                        name: 'leo-efs',
                        efsVolumeConfiguration: {
                            fileSystemId: efsFileSystemId,
                            transitEncryption: 'ENABLED',
                            authorizationConfig: {
                                accessPointId: efsAccessPointId,
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
        // Note: Secrets (ANTHROPIC_API_KEY, SUPABASE_ACCESS_TOKEN, etc.) are loaded
        // at runtime via aws_secrets.py, not via ECS task definition. This is simpler
        // because it doesn't require CDK changes to add new secrets.
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
        const appGenSaasContainer = appGenSaasTaskDef.defaultContainer;
        appGenSaasContainer.addEnvironment('ECS_TASK_DEFINITION', appGeneratorTaskDef.taskDefinitionArn);
        appGenSaasContainer.addEnvironment('ECS_SECURITY_GROUP', ''); // Will be set after security group creation
        const appGenSaasSecurityGroup = new ec2.SecurityGroup(this, 'LeoSaasAppSG', {
            vpc,
            description: 'Security group for leo-saas-app service',
            allowAllOutbound: true,
            allowAllIpv6Outbound: true, // Required for Supabase IPv6 connectivity
        });
        // Security group for Leo generator tasks
        // Exported via this.generatorSecurityGroup for use by LeoEfsStack
        this.generatorSecurityGroup = new ec2.SecurityGroup(this, 'LeoSG', {
            vpc,
            description: 'Security group for leo generator tasks',
            allowAllOutbound: true,
            allowAllIpv6Outbound: true, // Required for Supabase IPv6 connectivity
        });
        const appGeneratorSecurityGroup = this.generatorSecurityGroup; // Local alias
        // Allow generator tasks to connect directly to orchestrator service (bypass ALB for WebSocket)
        // This is needed because internet-facing ALBs can't be reached from within VPC using public DNS
        appGenSaasSecurityGroup.addIngressRule(appGeneratorSecurityGroup, ec2.Port.tcp(5013), 'Allow generator tasks to connect directly to orchestrator for WebSocket');
        // Now update the ECS_SECURITY_GROUP with the actual value
        appGenSaasContainer.addEnvironment('ECS_SECURITY_GROUP', appGeneratorSecurityGroup.securityGroupId);
        const albSecurityGroup = new ec2.SecurityGroup(this, 'LeoSaasALBSG', {
            vpc,
            description: 'Security group for Leo SaaS ALB',
            allowAllOutbound: true,
            allowAllIpv6Outbound: true, // Required for IPv6 dual-stack
        });
        // Note: Security group ingress rules are overridden after CloudFront
        // is configured to allow traffic from CloudFront (geo-restricted).
        appGenSaasSecurityGroup.addIngressRule(albSecurityGroup, ec2.Port.tcp(5013), 'Allow traffic from ALB on port 5013');
        // Allow generator tasks to connect back to ALB for WebSocket communication
        // Using VPC CIDR instead of security group to avoid hairpinning issues
        albSecurityGroup.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(80), 'Allow VPC internal traffic to ALB on port 80 for WebSocket');
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
                containerPort: 5013, // WebSocket server port
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
        }
        else {
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
        const cfnSecurityGroup = albSecurityGroup.node.defaultChild;
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
        const cfnTaskDef = appGenSaasTaskDef.node.defaultChild;
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
exports.LeoSaasStack = LeoSaasStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVvLXNhYXMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsZW8tc2Fhcy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyx5REFBMkM7QUFDM0MsOEVBQWdFO0FBQ2hFLHdFQUEwRDtBQUMxRCx1REFBeUM7QUFDekMsMkRBQTZDO0FBQzdDLHlEQUEyQztBQUMzQywrRUFBaUU7QUFDakUsbUZBQXFFO0FBQ3JFLHVFQUF5RDtBQUN6RCw0RUFBOEQ7QUFHOUQsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFhekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixxREFBcUQ7UUFDckQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO1FBQ3RELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztRQUU3RCwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FDYixpRUFBaUUsQ0FDbEUsQ0FBQztRQUNKLENBQUM7UUFFRCw0RUFBNEU7UUFDNUUsMkJBQTJCO1FBQzNCLDRFQUE0RTtRQUM1RSxxRUFBcUU7UUFDckUsdUVBQXVFO1FBQ3ZFLDJEQUEyRDtRQUMzRCxFQUFFO1FBQ0Ysb0RBQW9EO1FBQ3BELGtFQUFrRTtRQUNsRSxrQ0FBa0M7UUFDbEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFD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QVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFNBQVM7WUFDbEMsV0FBVyxFQUFFLCtCQUErQjtZQUM1QyxVQUFVLEVBQUUsOEJBQThCO1NBQzNDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDakQsS0FBSyxFQUFFLG9CQUFvQixDQUFDLGFBQWE7WUFDekMsV0FBVyxFQUFFLHFDQUFxQztTQUNuRCxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxzQkFBc0IsQ0FBQyxhQUFhO1lBQzNDLFdBQVcsRUFBRSxzQ0FBc0M7U0FDcEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaHFCRCxvQ0FncUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCAqIGFzIGVjciBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNyJztcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIHNlY3JldHNtYW5hZ2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcic7XG5pbXBvcnQgKiBhcyBzZXJ2aWNlZGlzY292ZXJ5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZXJ2aWNlZGlzY292ZXJ5JztcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgY2xhc3MgTGVvU2Fhc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgLyoqXG4gICAqIFRoZSBWUEMgd2hlcmUgYWxsIExlbyByZXNvdXJjZXMgYXJlIGRlcGxveWVkLlxuICAgKiBFeHBvcnRlZCBmb3IgdXNlIGJ5IExlb0Vmc1N0YWNrLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHZwYzogZWMyLlZwYztcblxuICAvKipcbiAgICogU2VjdXJpdHkgZ3JvdXAgZm9yIExlbyBnZW5lcmF0b3IgdGFza3MuXG4gICAqIEV4cG9ydGVkIGZvciB1c2UgYnkgTGVvRWZzU3RhY2sgKHRvIGFsbG93IE5GUyB0cmFmZmljKS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBnZW5lcmF0b3JTZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBJbWFnZSB0YWdzIGZyb20gZW52aXJvbm1lbnQgKHNldCBieSBkZXBsb3kgc2NyaXB0KVxuICAgIGNvbnN0IGxlb1NhYXNBcHBUYWcgPSBwcm9jZXNzLmVudi5MRU9fU0FBU19BUFBfVEFHO1xuICAgIGNvbnN0IGxlb0dlbmVyYXRvclRhZyA9IHByb2Nlc3MuZW52LkxFT19HRU5FUkFUT1JfVEFHO1xuICAgIGNvbnN0IGxlb0dlbmVyYXRvclVyaVRhZyA9IHByb2Nlc3MuZW52LkxFT19HRU5FUkFUT1JfVVJJX1RBRztcblxuICAgIC8vIEZhaWwgZmFzdCBpZiB0YWdzIG5vdCBwcm92aWRlZCAobm8gZmFsbGJhY2sgdG8gJ2xhdGVzdCcpXG4gICAgaWYgKCFsZW9TYWFzQXBwVGFnIHx8ICFsZW9HZW5lcmF0b3JUYWcgfHwgIWxlb0dlbmVyYXRvclVyaVRhZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSW1hZ2UgdGFncyBub3QgcHJvdmlkZWQuIFJ1biBkZXBsb3ltZW50IHZpYSAuL3NjcmlwdHMvZGVwbG95LnNoJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gT3B0aW9uYWwgRUZTIEludGVncmF0aW9uXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEVGUyBwcm92aWRlcyBwZXJzaXN0ZW50IHN0b3JhZ2UgZm9yIGdlbmVyYXRvciBjb250YWluZXJzLCBlbmFibGluZ1xuICAgIC8vIGluc3RhbnQgcmVzdW1lICh+MTBzIHZzIDUtMTBtaW4pLiBQYXNzIHRoZXNlIGNvbnRleHQgdmFycyB0byBlbmFibGU6XG4gICAgLy8gICAtYyBlZnNGaWxlU3lzdGVtSWQ9ZnMteHh4IC1jIGVmc0FjY2Vzc1BvaW50SWQ9ZnNhcC14eHhcbiAgICAvL1xuICAgIC8vIEdldCBJRHMgZnJvbSBMZW9FZnNTdGFjayBvdXRwdXRzIGFmdGVyIGRlcGxveWluZzpcbiAgICAvLyAgIGF3cyBjbG91ZGZvcm1hdGlvbiBkZXNjcmliZS1zdGFja3MgLS1zdGFjay1uYW1lIExlb0Vmc1N0YWNrIFxcXG4gICAgLy8gICAgIC0tcXVlcnkgJ1N0YWNrc1swXS5PdXRwdXRzJ1xuICAgIGNvbnN0IGVmc0ZpbGVTeXN0ZW1JZCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdlZnNGaWxlU3lzdGVtSWQnKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZWZzQWNjZXNzUG9pbnRJZCA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdlZnNBY2Nlc3NQb2ludElkJykgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGVmc0VuYWJsZWQgPSAhIShlZnNGaWxlU3lzdGVtSWQgJiYgZWZzQWNjZXNzUG9pbnRJZCk7XG5cbiAgICBpZiAoZWZzRW5hYmxlZCkge1xuICAgICAgY29uc29sZS5sb2coYEVGUyBlbmFibGVkOiBGaWxlU3lzdGVtPSR7ZWZzRmlsZVN5c3RlbUlkfSwgQWNjZXNzUG9pbnQ9JHtlZnNBY2Nlc3NQb2ludElkfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRUZTIG5vdCBlbmFibGVkIChwYXNzIC1jIGVmc0ZpbGVTeXN0ZW1JZD0uLi4gLWMgZWZzQWNjZXNzUG9pbnRJZD0uLi4gdG8gZW5hYmxlKScpO1xuICAgIH1cblxuICAgIC8vIFZQQyBmb3IgYWxsIExlbyByZXNvdXJjZXNcbiAgICAvLyBFeHBvcnRlZCB2aWEgdGhpcy52cGMgZm9yIHVzZSBieSBMZW9FZnNTdGFja1xuICAgIHRoaXMudnBjID0gbmV3IGVjMi5WcGModGhpcywgJ0xlb1NhYXNWUEMnLCB7XG4gICAgICBtYXhBenM6IDIsXG4gICAgICBuYXRHYXRld2F5czogMCxcbiAgICAgIGlwUHJvdG9jb2w6IGVjMi5JcFByb3RvY29sLkRVQUxfU1RBQ0ssICAvLyBFbmFibGUgSVB2NlxuICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW1xuICAgICAgICB7XG4gICAgICAgICAgY2lkck1hc2s6IDI0LFxuICAgICAgICAgIG5hbWU6ICdQdWJsaWMnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgICAgICBtYXBQdWJsaWNJcE9uTGF1bmNoOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICBjb25zdCB2cGMgPSB0aGlzLnZwYzsgLy8gTG9jYWwgYWxpYXMgZm9yIGNvbnZlbmllbmNlXG5cbiAgICBjb25zdCBzdXBhYmFzZVVybFNlY3JldCA9IHNlY3JldHNtYW5hZ2VyLlNlY3JldC5mcm9tU2VjcmV0TmFtZVYyKFxuICAgICAgdGhpcyxcbiAgICAgICdTdXBhYmFzZVVybCcsXG4gICAgICAnbGVvL3N1cGFiYXNlLXVybCdcbiAgICApO1xuXG4gICAgY29uc3Qgc3VwYWJhc2VBbm9uS2V5U2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ1N1cGFiYXNlQW5vbktleScsXG4gICAgICAnbGVvL3N1cGFiYXNlLWFub24ta2V5J1xuICAgICk7XG5cbiAgICBjb25zdCBzdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ1N1cGFiYXNlU2VydmljZVJvbGVLZXknLFxuICAgICAgJ2xlby9zdXBhYmFzZS1zZXJ2aWNlLXJvbGUta2V5J1xuICAgICk7XG5cbiAgICBjb25zdCBkYXRhYmFzZVVybFNlY3JldCA9IHNlY3JldHNtYW5hZ2VyLlNlY3JldC5mcm9tU2VjcmV0TmFtZVYyKFxuICAgICAgdGhpcyxcbiAgICAgICdEYXRhYmFzZVVybCcsXG4gICAgICAnbGVvL2RhdGFiYXNlLXVybCdcbiAgICApO1xuXG4gICAgY29uc3QgZ2l0aHViQm90VG9rZW5TZWNyZXQgPSBzZWNyZXRzbWFuYWdlci5TZWNyZXQuZnJvbVNlY3JldE5hbWVWMihcbiAgICAgIHRoaXMsXG4gICAgICAnR2l0aHViQm90VG9rZW4nLFxuICAgICAgJ2xlby9naXRodWItYm90LXRva2VuJ1xuICAgICk7XG5cbiAgICBjb25zdCBmbHlBcGlUb2tlblNlY3JldCA9IHNlY3JldHNtYW5hZ2VyLlNlY3JldC5mcm9tU2VjcmV0TmFtZVYyKFxuICAgICAgdGhpcyxcbiAgICAgICdGbHlBcGlUb2tlbicsXG4gICAgICAnbGVvL2ZseS1hcGktdG9rZW4nXG4gICAgKTtcblxuICAgIC8vIFBvb2wgbW9kZSByZW1vdmVkIC0gbm93IHVzaW5nIHBlci1hcHAgU3VwYWJhc2UgbW9kZVxuICAgIC8vIFNlZSBTVEFUVVMubWQgMjAyNi0wMS0wNDogXCJQb29sIE1vZGUgUmVtb3ZhbFwiXG5cbiAgICBjb25zdCBhcHBCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdMZW9TYWFzR2VuZXJhdGVkQXBwc0J1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IGBsZW8tc2Fhcy1nZW5lcmF0ZWQtYXBwcy0ke3RoaXMuYWNjb3VudH1gLFxuICAgICAgdmVyc2lvbmVkOiBmYWxzZSxcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ0RlbGV0ZU9sZEFwcHMnLFxuICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgZXhwaXJhdGlvbjogY2RrLkR1cmF0aW9uLmRheXMoMzApLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNsYXVkZVRva2VuU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ0NsYXVkZU9BdXRoVG9rZW4nLFxuICAgICAgJ2xlby9jbGF1ZGUtb2F1dGgtdG9rZW4nXG4gICAgKTtcblxuICAgIGNvbnN0IHN1cGFiYXNlQWNjZXNzVG9rZW5TZWNyZXQgPSBzZWNyZXRzbWFuYWdlci5TZWNyZXQuZnJvbVNlY3JldE5hbWVWMihcbiAgICAgIHRoaXMsXG4gICAgICAnU3VwYWJhc2VBY2Nlc3NUb2tlbicsXG4gICAgICAnbGVvL3N1cGFiYXNlLWFjY2Vzcy10b2tlbidcbiAgICApO1xuXG4gICAgY29uc3QgY2x1c3RlciA9IG5ldyBlY3MuQ2x1c3Rlcih0aGlzLCAnTGVvU2Fhc0NsdXN0ZXInLCB7XG4gICAgICBjbHVzdGVyTmFtZTogJ2xlby1zYWFzLWNsdXN0ZXInLFxuICAgICAgdnBjLFxuICAgICAgY29udGFpbmVySW5zaWdodHM6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBDbG91ZE1hcCBuYW1lc3BhY2UgZm9yIHNlcnZpY2UgZGlzY292ZXJ5XG4gICAgLy8gVGhpcyBhbGxvd3MgY29udGFpbmVycyB0byBkaXNjb3ZlciBlYWNoIG90aGVyIHZpYSBpbnRlcm5hbCBETlMgKGUuZy4sIG9yY2hlc3RyYXRvci5sZW8tc2Fhcy5sb2NhbClcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBuZXcgc2VydmljZWRpc2NvdmVyeS5Qcml2YXRlRG5zTmFtZXNwYWNlKHRoaXMsICdMZW9TYWFzTmFtZXNwYWNlJywge1xuICAgICAgbmFtZTogJ2xlby1zYWFzLmxvY2FsJyxcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRNYXAgbmFtZXNwYWNlIGZvciBMRU8gU2FhUyBzZXJ2aWNlIGRpc2NvdmVyeScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcHBHZW5TYWFzUmVwb3NpdG9yeSA9IG5ldyBlY3IuUmVwb3NpdG9yeSh0aGlzLCAnTGVvU2Fhc0FwcFJlcG9zaXRvcnknLCB7XG4gICAgICByZXBvc2l0b3J5TmFtZTogJ2xlby1zYWFzLWFwcCcsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZUltYWdlczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwcEdlbmVyYXRvclJlcG9zaXRvcnkgPSBuZXcgZWNyLlJlcG9zaXRvcnkodGhpcywgJ0xlb1JlcG9zaXRvcnknLCB7XG4gICAgICByZXBvc2l0b3J5TmFtZTogJ2xlbycsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZUltYWdlczogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwcEdlblNhYXNUYXNrUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnTGVvU2Fhc0FwcFRhc2tSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1Rhc2sgcm9sZSBmb3IgbGVvLXNhYXMtYXBwIHNlcnZpY2UnLFxuICAgIH0pO1xuXG4gICAgYXBwR2VuU2Fhc1Rhc2tSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2VjczpSdW5UYXNrJyxcbiAgICAgICAgJ2VjczpTdG9wVGFzaycsXG4gICAgICAgICdlY3M6RGVzY3JpYmVUYXNrcycsXG4gICAgICAgICdlY3M6TGlzdFRhc2tzJyxcbiAgICAgICAgJ2VjczpUYWdSZXNvdXJjZScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgJ0FybkVxdWFscyc6IHtcbiAgICAgICAgICAnZWNzOmNsdXN0ZXInOiBjbHVzdGVyLmNsdXN0ZXJBcm4sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIGFwcEdlblNhYXNUYXNrUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ2lhbTpQYXNzUm9sZSddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgJ1N0cmluZ0xpa2UnOiB7XG4gICAgICAgICAgJ2lhbTpQYXNzZWRUb1NlcnZpY2UnOiAnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICBhcHBCdWNrZXQuZ3JhbnRSZWFkV3JpdGUoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBjbGF1ZGVUb2tlblNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBzdXBhYmFzZVVybFNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBzdXBhYmFzZUFub25LZXlTZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgc3VwYWJhc2VTZXJ2aWNlUm9sZUtleVNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBkYXRhYmFzZVVybFNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBnaXRodWJCb3RUb2tlblNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcbiAgICBmbHlBcGlUb2tlblNlY3JldC5ncmFudFJlYWQoYXBwR2VuU2Fhc1Rhc2tSb2xlKTtcblxuICAgIGNvbnN0IGFwcEdlbmVyYXRvclRhc2tSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdMZW9UYXNrUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246ICdUYXNrIHJvbGUgZm9yIGxlbyBnZW5lcmF0b3IgdGFza3MnLFxuICAgIH0pO1xuXG4gICAgYXBwQnVja2V0LmdyYW50V3JpdGUoYXBwR2VuZXJhdG9yVGFza1JvbGUpO1xuICAgIC8vIEFsbCBzZWNyZXRzIGxvYWRlZCBhdCBydW50aW1lIHZpYSBhd3Nfc2VjcmV0cy5weSAobm90IEVDUyB0YXNrIGRlZmluaXRpb24pXG4gICAgY2xhdWRlVG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlbmVyYXRvclRhc2tSb2xlKTtcbiAgICBzdXBhYmFzZUFjY2Vzc1Rva2VuU2VjcmV0LmdyYW50UmVhZChhcHBHZW5lcmF0b3JUYXNrUm9sZSk7XG4gICAgZ2l0aHViQm90VG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlbmVyYXRvclRhc2tSb2xlKTtcbiAgICBmbHlBcGlUb2tlblNlY3JldC5ncmFudFJlYWQoYXBwR2VuZXJhdG9yVGFza1JvbGUpO1xuXG4gICAgY29uc3QgZXhlY3V0aW9uUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnVGFza0V4ZWN1dGlvblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BbWF6b25FQ1NUYXNrRXhlY3V0aW9uUm9sZVBvbGljeScpLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIEV4ZWN1dGlvbiByb2xlIGdyYW50cyBmb3IgbGVvLXNhYXMtYXBwIGNvbnRhaW5lciAoRUNTIHNlY3JldCBpbmplY3Rpb24pXG4gICAgLy8gTm90ZTogR2VuZXJhdG9yIGNvbnRhaW5lciBzZWNyZXRzIGFyZSBsb2FkZWQgYXQgcnVudGltZSB2aWEgYXdzX3NlY3JldHMucHlcbiAgICBzdXBhYmFzZVVybFNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7XG4gICAgc3VwYWJhc2VBbm9uS2V5U2VjcmV0LmdyYW50UmVhZChleGVjdXRpb25Sb2xlKTtcbiAgICBzdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0LmdyYW50UmVhZChleGVjdXRpb25Sb2xlKTtcbiAgICBkYXRhYmFzZVVybFNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7XG4gICAgZ2l0aHViQm90VG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGV4ZWN1dGlvblJvbGUpO1xuICAgIGZseUFwaVRva2VuU2VjcmV0LmdyYW50UmVhZChleGVjdXRpb25Sb2xlKTtcbiAgICBjbGF1ZGVUb2tlblNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7ICAvLyBGb3IgbGVvLXNhYXMtYXBwJ3MgQ0xBVURFX0NPREVfT0FVVEhfVE9LRU5cblxuICAgIGNvbnN0IGFwcEdlblNhYXNUYXNrRGVmID0gbmV3IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgJ0xlb1NhYXNBcHBUYXNrRGVmJywge1xuICAgICAgbWVtb3J5TGltaXRNaUI6IDIwNDgsXG4gICAgICBjcHU6IDEwMjQsXG4gICAgICB0YXNrUm9sZTogYXBwR2VuU2Fhc1Rhc2tSb2xlLFxuICAgICAgZXhlY3V0aW9uUm9sZSxcbiAgICB9KTtcblxuICAgIGFwcEdlblNhYXNUYXNrRGVmLmFkZENvbnRhaW5lcignbGVvLXNhYXMtYXBwJywge1xuICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tRWNyUmVwb3NpdG9yeShhcHBHZW5TYWFzUmVwb3NpdG9yeSwgbGVvU2Fhc0FwcFRhZyksXG4gICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgc3RyZWFtUHJlZml4OiAnbGVvLXNhYXMtYXBwJyxcbiAgICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICB9KSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIFBPUlQ6ICc1MDEzJyxcbiAgICAgICAgQVVUSF9NT0RFOiAnc3VwYWJhc2UnLFxuICAgICAgICBTVE9SQUdFX01PREU6ICdkYXRhYmFzZScsXG4gICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLCAgLy8gUmVxdWlyZWQgZm9yIEFXUyBTREsgKFNlY3JldHMgTWFuYWdlcilcbiAgICAgICAgVVNFX0FXU19PUkNIRVNUUkFUT1I6ICd0cnVlJyxcbiAgICAgICAgVVNFX0dJVEhVQl9JTlRFR1JBVElPTjogJ3RydWUnLFxuICAgICAgICBFQ1NfQ0xVU1RFUjogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgRUNTX1NVQk5FVFM6IHZwYy5wdWJsaWNTdWJuZXRzLm1hcChzID0+IHMuc3VibmV0SWQpLmpvaW4oJywnKSxcbiAgICAgICAgRUNTX0NPTlRBSU5FUl9OQU1FOiAnbGVvJywgIC8vIE11c3QgbWF0Y2ggY29udGFpbmVyTmFtZSBpbiBMZW9UYXNrRGVmXG4gICAgICAgIFMzX0JVQ0tFVDogYXBwQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIEdFTkVSQVRPUl9JTUFHRTogYCR7YXBwR2VuZXJhdG9yUmVwb3NpdG9yeS5yZXBvc2l0b3J5VXJpfToke2xlb0dlbmVyYXRvclVyaVRhZ31gLFxuICAgICAgICBOT0RFX09QVElPTlM6ICctLWRucy1yZXN1bHQtb3JkZXI9aXB2NGZpcnN0JyxcbiAgICAgICAgLy8gTm90ZTogRUNTX1NFQ1VSSVRZX0dST1VQLCBFQ1NfVEFTS19ERUZJTklUSU9OLCBhbmQgV1NJX1BVQkxJQ19VUkxcbiAgICAgICAgLy8gYXJlIGFkZGVkIGxhdGVyIHZpYSBDbG91ZEZvcm1hdGlvbiBlc2NhcGUgaGF0Y2ggYWZ0ZXIgYWxsIHJlc291cmNlcyBhcmUgY3JlYXRlZFxuICAgICAgfSxcbiAgICAgIHNlY3JldHM6IHtcbiAgICAgICAgLy8gTWFpbiBMZW8gU2FhUyBkYXRhYmFzZSAobGVvLWRldilcbiAgICAgICAgU1VQQUJBU0VfVVJMOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZVVybFNlY3JldCksXG4gICAgICAgIFNVUEFCQVNFX0FOT05fS0VZOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZUFub25LZXlTZWNyZXQpLFxuICAgICAgICBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0KSxcbiAgICAgICAgREFUQUJBU0VfVVJMOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihkYXRhYmFzZVVybFNlY3JldCksXG4gICAgICAgIC8vIFBvb2wgc2VjcmV0cyByZW1vdmVkIC0gdXNpbmcgcGVyLWFwcCBTdXBhYmFzZSBtb2RlXG4gICAgICAgIEdJVEhVQl9CT1RfVE9LRU46IGVjcy5TZWNyZXQuZnJvbVNlY3JldHNNYW5hZ2VyKGdpdGh1YkJvdFRva2VuU2VjcmV0KSxcbiAgICAgICAgRkxZX0FQSV9UT0tFTjogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIoZmx5QXBpVG9rZW5TZWNyZXQpLFxuICAgICAgICBDTEFVREVfQ09ERV9PQVVUSF9UT0tFTjogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIoY2xhdWRlVG9rZW5TZWNyZXQpLFxuICAgICAgfSxcbiAgICAgIHBvcnRNYXBwaW5nczogW3tcbiAgICAgICAgY29udGFpbmVyUG9ydDogNTAxMyxcbiAgICAgICAgcHJvdG9jb2w6IGVjcy5Qcm90b2NvbC5UQ1AsXG4gICAgICB9XSxcbiAgICB9KTtcblxuICAgIC8vIEdlbmVyYXRvciB0YXNrIGRlZmluaXRpb24gLSBvcHRpb25hbGx5IGluY2x1ZGVzIEVGUyB2b2x1bWVcbiAgICBjb25zdCBhcHBHZW5lcmF0b3JUYXNrRGVmID0gbmV3IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgJ0xlb1Rhc2tEZWYnLCB7XG4gICAgICBtZW1vcnlMaW1pdE1pQjogODE5MiwgIC8vIDhHQiBmb3IgTVZQIC0gcHJldmVudHMgT09NIGtpbGxzLCBjaGVhcCBhdCB+JDAuMDUvMTVtaW5cbiAgICAgIGNwdTogNDA5NiwgIC8vIDQgdkNQVSAtIEZhcmdhdGUgcmVxdWlyZXMgMToyIENQVTpNZW1vcnkgcmF0aW9cbiAgICAgIHRhc2tSb2xlOiBhcHBHZW5lcmF0b3JUYXNrUm9sZSxcbiAgICAgIGV4ZWN1dGlvblJvbGUsXG4gICAgICAvLyBDb25kaXRpb25hbGx5IGFkZCBFRlMgdm9sdW1lIHdoZW4gZW5hYmxlZFxuICAgICAgLi4uKGVmc0VuYWJsZWQgPyB7XG4gICAgICAgIHZvbHVtZXM6IFt7XG4gICAgICAgICAgbmFtZTogJ2xlby1lZnMnLFxuICAgICAgICAgIGVmc1ZvbHVtZUNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgIGZpbGVTeXN0ZW1JZDogZWZzRmlsZVN5c3RlbUlkISxcbiAgICAgICAgICAgIHRyYW5zaXRFbmNyeXB0aW9uOiAnRU5BQkxFRCcsXG4gICAgICAgICAgICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgICAgICAgICAgIGFjY2Vzc1BvaW50SWQ6IGVmc0FjY2Vzc1BvaW50SWQhLFxuICAgICAgICAgICAgICBpYW06ICdFTkFCTEVEJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfV0sXG4gICAgICB9IDoge30pLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIEVGUyBJQU0gcGVybWlzc2lvbnMgd2hlbiBlbmFibGVkXG4gICAgaWYgKGVmc0VuYWJsZWQpIHtcbiAgICAgIGFwcEdlbmVyYXRvclRhc2tSb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgJ2VsYXN0aWNmaWxlc3lzdGVtOkNsaWVudE1vdW50JyxcbiAgICAgICAgICAnZWxhc3RpY2ZpbGVzeXN0ZW06Q2xpZW50V3JpdGUnLFxuICAgICAgICAgICdlbGFzdGljZmlsZXN5c3RlbTpDbGllbnRSb290QWNjZXNzJyxcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6ZWxhc3RpY2ZpbGVzeXN0ZW06JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OmZpbGUtc3lzdGVtLyR7ZWZzRmlsZVN5c3RlbUlkfWBdLFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRvciBjb250YWluZXIgLSBvcHRpb25hbGx5IGluY2x1ZGVzIEVGUyBtb3VudCBwb2ludFxuICAgIC8vIE5vdGU6IFNlY3JldHMgKEFOVEhST1BJQ19BUElfS0VZLCBTVVBBQkFTRV9BQ0NFU1NfVE9LRU4sIGV0Yy4pIGFyZSBsb2FkZWRcbiAgICAvLyBhdCBydW50aW1lIHZpYSBhd3Nfc2VjcmV0cy5weSwgbm90IHZpYSBFQ1MgdGFzayBkZWZpbml0aW9uLiBUaGlzIGlzIHNpbXBsZXJcbiAgICAvLyBiZWNhdXNlIGl0IGRvZXNuJ3QgcmVxdWlyZSBDREsgY2hhbmdlcyB0byBhZGQgbmV3IHNlY3JldHMuXG4gICAgY29uc3QgZ2VuZXJhdG9yQ29udGFpbmVyID0gYXBwR2VuZXJhdG9yVGFza0RlZi5hZGRDb250YWluZXIoJ2xlbycsIHtcbiAgICAgIGNvbnRhaW5lck5hbWU6ICdsZW8nLFxuICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tRWNyUmVwb3NpdG9yeShhcHBHZW5lcmF0b3JSZXBvc2l0b3J5LCBsZW9HZW5lcmF0b3JUYWcpLFxuICAgICAgbG9nZ2luZzogZWNzLkxvZ0RyaXZlcnMuYXdzTG9ncyh7XG4gICAgICAgIHN0cmVhbVByZWZpeDogJ2xlbycsXG4gICAgICAgIGxvZ1JldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9XRUVLLFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBBV1NfUkVHSU9OOiB0aGlzLnJlZ2lvbixcbiAgICAgICAgUzNfQlVDS0VUOiBhcHBCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIH0sXG4gICAgICAvLyBObyBzZWNyZXRzIGJsb2NrIC0gYWxsIHNlY3JldHMgbG9hZGVkIGF0IHJ1bnRpbWUgdmlhIGF3c19zZWNyZXRzLnB5XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgRUZTIG1vdW50IHBvaW50IHdoZW4gZW5hYmxlZFxuICAgIGlmIChlZnNFbmFibGVkKSB7XG4gICAgICBnZW5lcmF0b3JDb250YWluZXIuYWRkTW91bnRQb2ludHMoe1xuICAgICAgICBjb250YWluZXJQYXRoOiAnL2VmcycsXG4gICAgICAgIHNvdXJjZVZvbHVtZTogJ2xlby1lZnMnLFxuICAgICAgICByZWFkT25seTogZmFsc2UsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgRUNTX1RBU0tfREVGSU5JVElPTiB0byBhcHAtZ2VuLXNhYXMgY29udGFpbmVyIG5vdyB0aGF0IGl0J3MgZGVmaW5lZFxuICAgIGNvbnN0IGFwcEdlblNhYXNDb250YWluZXIgPSBhcHBHZW5TYWFzVGFza0RlZi5kZWZhdWx0Q29udGFpbmVyITtcbiAgICBhcHBHZW5TYWFzQ29udGFpbmVyLmFkZEVudmlyb25tZW50KCdFQ1NfVEFTS19ERUZJTklUSU9OJywgYXBwR2VuZXJhdG9yVGFza0RlZi50YXNrRGVmaW5pdGlvbkFybik7XG4gICAgYXBwR2VuU2Fhc0NvbnRhaW5lci5hZGRFbnZpcm9ubWVudCgnRUNTX1NFQ1VSSVRZX0dST1VQJywgJycpOyAvLyBXaWxsIGJlIHNldCBhZnRlciBzZWN1cml0eSBncm91cCBjcmVhdGlvblxuXG4gICAgY29uc3QgYXBwR2VuU2Fhc1NlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ0xlb1NhYXNBcHBTRycsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIGxlby1zYWFzLWFwcCBzZXJ2aWNlJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgICBhbGxvd0FsbElwdjZPdXRib3VuZDogdHJ1ZSwgIC8vIFJlcXVpcmVkIGZvciBTdXBhYmFzZSBJUHY2IGNvbm5lY3Rpdml0eVxuICAgIH0pO1xuXG4gICAgLy8gU2VjdXJpdHkgZ3JvdXAgZm9yIExlbyBnZW5lcmF0b3IgdGFza3NcbiAgICAvLyBFeHBvcnRlZCB2aWEgdGhpcy5nZW5lcmF0b3JTZWN1cml0eUdyb3VwIGZvciB1c2UgYnkgTGVvRWZzU3RhY2tcbiAgICB0aGlzLmdlbmVyYXRvclNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ0xlb1NHJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgbGVvIGdlbmVyYXRvciB0YXNrcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgICAgYWxsb3dBbGxJcHY2T3V0Ym91bmQ6IHRydWUsICAvLyBSZXF1aXJlZCBmb3IgU3VwYWJhc2UgSVB2NiBjb25uZWN0aXZpdHlcbiAgICB9KTtcbiAgICBjb25zdCBhcHBHZW5lcmF0b3JTZWN1cml0eUdyb3VwID0gdGhpcy5nZW5lcmF0b3JTZWN1cml0eUdyb3VwOyAvLyBMb2NhbCBhbGlhc1xuXG4gICAgLy8gQWxsb3cgZ2VuZXJhdG9yIHRhc2tzIHRvIGNvbm5lY3QgZGlyZWN0bHkgdG8gb3JjaGVzdHJhdG9yIHNlcnZpY2UgKGJ5cGFzcyBBTEIgZm9yIFdlYlNvY2tldClcbiAgICAvLyBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIGludGVybmV0LWZhY2luZyBBTEJzIGNhbid0IGJlIHJlYWNoZWQgZnJvbSB3aXRoaW4gVlBDIHVzaW5nIHB1YmxpYyBETlNcbiAgICBhcHBHZW5TYWFzU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIGFwcEdlbmVyYXRvclNlY3VyaXR5R3JvdXAsXG4gICAgICBlYzIuUG9ydC50Y3AoNTAxMyksXG4gICAgICAnQWxsb3cgZ2VuZXJhdG9yIHRhc2tzIHRvIGNvbm5lY3QgZGlyZWN0bHkgdG8gb3JjaGVzdHJhdG9yIGZvciBXZWJTb2NrZXQnXG4gICAgKTtcblxuICAgIC8vIE5vdyB1cGRhdGUgdGhlIEVDU19TRUNVUklUWV9HUk9VUCB3aXRoIHRoZSBhY3R1YWwgdmFsdWVcbiAgICBhcHBHZW5TYWFzQ29udGFpbmVyLmFkZEVudmlyb25tZW50KCdFQ1NfU0VDVVJJVFlfR1JPVVAnLCBhcHBHZW5lcmF0b3JTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCk7XG5cbiAgICBjb25zdCBhbGJTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMZW9TYWFzQUxCU0cnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBMZW8gU2FhUyBBTEInLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgIGFsbG93QWxsSXB2Nk91dGJvdW5kOiB0cnVlLCAgLy8gUmVxdWlyZWQgZm9yIElQdjYgZHVhbC1zdGFja1xuICAgIH0pO1xuXG4gICAgLy8gTm90ZTogU2VjdXJpdHkgZ3JvdXAgaW5ncmVzcyBydWxlcyBhcmUgb3ZlcnJpZGRlbiBhZnRlciBDbG91ZEZyb250XG4gICAgLy8gaXMgY29uZmlndXJlZCB0byBhbGxvdyB0cmFmZmljIGZyb20gQ2xvdWRGcm9udCAoZ2VvLXJlc3RyaWN0ZWQpLlxuXG4gICAgYXBwR2VuU2Fhc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBhbGJTZWN1cml0eUdyb3VwLFxuICAgICAgZWMyLlBvcnQudGNwKDUwMTMpLFxuICAgICAgJ0FsbG93IHRyYWZmaWMgZnJvbSBBTEIgb24gcG9ydCA1MDEzJ1xuICAgICk7XG5cbiAgICAvLyBBbGxvdyBnZW5lcmF0b3IgdGFza3MgdG8gY29ubmVjdCBiYWNrIHRvIEFMQiBmb3IgV2ViU29ja2V0IGNvbW11bmljYXRpb25cbiAgICAvLyBVc2luZyBWUEMgQ0lEUiBpbnN0ZWFkIG9mIHNlY3VyaXR5IGdyb3VwIHRvIGF2b2lkIGhhaXJwaW5uaW5nIGlzc3Vlc1xuICAgIGFsYlNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBlYzIuUGVlci5pcHY0KHZwYy52cGNDaWRyQmxvY2spLFxuICAgICAgZWMyLlBvcnQudGNwKDgwKSxcbiAgICAgICdBbGxvdyBWUEMgaW50ZXJuYWwgdHJhZmZpYyB0byBBTEIgb24gcG9ydCA4MCBmb3IgV2ViU29ja2V0J1xuICAgICk7XG5cbiAgICBjb25zdCBhbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgJ0xlb1NhYXNBTEInLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnRlcm5ldEZhY2luZzogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGFsYlNlY3VyaXR5R3JvdXAsXG4gICAgICB2cGNTdWJuZXRzOiB7XG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcHBHZW5TYWFzU2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ0xlb1NhYXNTZXJ2aWNlJywge1xuICAgICAgY2x1c3RlcixcbiAgICAgIHRhc2tEZWZpbml0aW9uOiBhcHBHZW5TYWFzVGFza0RlZixcbiAgICAgIGRlc2lyZWRDb3VudDogMSxcbiAgICAgIGFzc2lnblB1YmxpY0lwOiB0cnVlLFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFthcHBHZW5TYWFzU2VjdXJpdHlHcm91cF0sXG4gICAgICB2cGNTdWJuZXRzOiB7XG4gICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyxcbiAgICAgIH0sXG4gICAgICBoZWFsdGhDaGVja0dyYWNlUGVyaW9kOiBjZGsuRHVyYXRpb24uc2Vjb25kcyg2MCksXG4gICAgICAvLyBTZXJ2aWNlIERpc2NvdmVyeTogUmVnaXN0ZXIgd2l0aCBDbG91ZE1hcCBmb3IgaW50ZXJuYWwgRE5TXG4gICAgICAvLyBUaGlzIGNyZWF0ZXMgb3JjaGVzdHJhdG9yLmxlby1zYWFzLmxvY2FsIEROUyBuYW1lIGZvciBnZW5lcmF0b3IgY29udGFpbmVycyB0byBjb25uZWN0XG4gICAgICBjbG91ZE1hcE9wdGlvbnM6IHtcbiAgICAgICAgbmFtZTogJ29yY2hlc3RyYXRvcicsXG4gICAgICAgIGNsb3VkTWFwTmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICAgIGRuc1JlY29yZFR5cGU6IHNlcnZpY2VkaXNjb3ZlcnkuRG5zUmVjb3JkVHlwZS5BLFxuICAgICAgICBkbnNUdGw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDEwKSxcbiAgICAgICAgY29udGFpbmVyUG9ydDogNTAxMywgIC8vIFdlYlNvY2tldCBzZXJ2ZXIgcG9ydFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRhcmdldEdyb3VwID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgJ0xlb1NhYXNUYXJnZXRHcm91cCcsIHtcbiAgICAgIHZwYyxcbiAgICAgIHBvcnQ6IDUwMTMsXG4gICAgICBwcm90b2NvbDogZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQLFxuICAgICAgdGFyZ2V0VHlwZTogZWxidjIuVGFyZ2V0VHlwZS5JUCxcbiAgICAgIGhlYWx0aENoZWNrOiB7XG4gICAgICAgIHBhdGg6ICcvaGVhbHRoJyxcbiAgICAgICAgaW50ZXJ2YWw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNSksXG4gICAgICAgIGhlYWx0aHlUaHJlc2hvbGRDb3VudDogMixcbiAgICAgICAgdW5oZWFsdGh5VGhyZXNob2xkQ291bnQ6IDMsXG4gICAgICB9LFxuICAgICAgLy8gRW5hYmxlIHN0aWNreSBzZXNzaW9ucyBmb3IgV2ViU29ja2V0IHN1cHBvcnRcbiAgICAgIC8vIFdlYlNvY2tldCBjb25uZWN0aW9ucyByZXF1aXJlIHNlc3Npb24gYWZmaW5pdHkgdG8gZW5zdXJlIGFsbCBmcmFtZXNcbiAgICAgIC8vIGdvIHRvIHRoZSBzYW1lIGJhY2tlbmQgaW5zdGFuY2UgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgY29ubmVjdGlvblxuICAgICAgc3RpY2tpbmVzc0Nvb2tpZUR1cmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygxKSxcbiAgICAgIHN0aWNraW5lc3NDb29raWVOYW1lOiAnTGVvU2Fhc1N0aWNraW5lc3MnLFxuICAgIH0pO1xuXG4gICAgYXBwR2VuU2Fhc1NlcnZpY2UuYXR0YWNoVG9BcHBsaWNhdGlvblRhcmdldEdyb3VwKHRhcmdldEdyb3VwKTtcblxuICAgIC8vIEFkZCBBTEIgRE5TIHRvIGNvbnRhaW5lciBlbnZpcm9ubWVudCBmb3IgV2ViU29ja2V0IFVSTCBnZW5lcmF0aW9uXG4gICAgYXBwR2VuU2Fhc0NvbnRhaW5lci5hZGRFbnZpcm9ubWVudCgnQUxCX0ROUycsIGFsYi5sb2FkQmFsYW5jZXJEbnNOYW1lKTtcblxuICAgIC8vIE9wdGlvbmFsOiBIVFRQUyBzdXBwb3J0IHZpYSBBQ00gY2VydGlmaWNhdGVcbiAgICAvLyBUbyBlbmFibGUgSFRUUFM6IGNkayBkZXBsb3kgLWMgY2VydGlmaWNhdGVBcm49YXJuOmF3czphY206cmVnaW9uOmFjY291bnQ6Y2VydGlmaWNhdGUvaWRcbiAgICBjb25zdCBjZXJ0aWZpY2F0ZUFybiA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCdjZXJ0aWZpY2F0ZUFybicpO1xuXG4gICAgLy8gQWRkIEFQSV9VUkwgZm9yIGZyb250ZW5kIGNvbmZpZ3VyYXRpb24gaW5qZWN0aW9uXG4gICAgLy8gRnJvbnRlbmQgbmVlZHMgdGhpcyB0byBtYWtlIEFQSSByZXF1ZXN0cyB0byB0aGUgY29ycmVjdCBlbmRwb2ludFxuICAgIC8vIFVzZSBIVFRQUyBpZiBjZXJ0aWZpY2F0ZSBpcyBjb25maWd1cmVkLCBvdGhlcndpc2UgSFRUUFxuICAgIGNvbnN0IGFwaVVybCA9IGNlcnRpZmljYXRlQXJuXG4gICAgICA/IGBodHRwczovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YFxuICAgICAgOiBgaHR0cDovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YDtcbiAgICBhcHBHZW5TYWFzQ29udGFpbmVyLmFkZEVudmlyb25tZW50KCdBUElfVVJMJywgYXBpVXJsKTtcblxuICAgIGlmIChjZXJ0aWZpY2F0ZUFybikge1xuICAgICAgLy8gSFRUUFMgbGlzdGVuZXIgKHByb2R1Y3Rpb24pXG4gICAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IGFjbS5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4odGhpcywgJ0NlcnRpZmljYXRlJywgY2VydGlmaWNhdGVBcm4pO1xuXG4gICAgICBhbGIuYWRkTGlzdGVuZXIoJ0hUVFBTTGlzdGVuZXInLCB7XG4gICAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUFMsXG4gICAgICAgIGNlcnRpZmljYXRlczogW2NlcnRpZmljYXRlXSxcbiAgICAgICAgZGVmYXVsdEFjdGlvbjogZWxidjIuTGlzdGVuZXJBY3Rpb24uZm9yd2FyZChbdGFyZ2V0R3JvdXBdKSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBIVFRQIGxpc3RlbmVyIHJlZGlyZWN0cyB0byBIVFRQU1xuICAgICAgYWxiLmFkZExpc3RlbmVyKCdIVFRQTGlzdGVuZXInLCB7XG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICBkZWZhdWx0QWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5yZWRpcmVjdCh7XG4gICAgICAgICAgcHJvdG9jb2w6ICdIVFRQUycsXG4gICAgICAgICAgcG9ydDogJzQ0MycsXG4gICAgICAgICAgcGVybWFuZW50OiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgIH0pO1xuXG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnVVJMJywge1xuICAgICAgICB2YWx1ZTogYGh0dHBzOi8vJHthbGIubG9hZEJhbGFuY2VyRG5zTmFtZX1gLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIFVSTCAoSFRUUFMpJyxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBIVFRQIGxpc3RlbmVyIG9ubHkgKHRlc3RpbmcvZGV2ZWxvcG1lbnQpXG4gICAgICBhbGIuYWRkTGlzdGVuZXIoJ0hUVFBMaXN0ZW5lcicsIHtcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIGRlZmF1bHRBY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZvcndhcmQoW3RhcmdldEdyb3VwXSksXG4gICAgICB9KTtcblxuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VSTCcsIHtcbiAgICAgICAgdmFsdWU6IGBodHRwOi8vJHthbGIubG9hZEJhbGFuY2VyRG5zTmFtZX1gLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIFVSTCAoSFRUUCAtIGFkZCBjZXJ0aWZpY2F0ZUFybiBjb250ZXh0IGZvciBIVFRQUyknLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ2xvdWRGcm9udCBkaXN0cmlidXRpb24gd2l0aCBnZW8tcmVzdHJpY3Rpb25cbiAgICAvLyBQcm92aWRlcyBIVFRQUyB2aWEgKi5jbG91ZGZyb250Lm5ldCBkb21haW4gYW5kIGdlby1mZW5jaW5nXG4gICAgY29uc3QgY2ZuU2VjdXJpdHlHcm91cCA9IGFsYlNlY3VyaXR5R3JvdXAubm9kZS5kZWZhdWx0Q2hpbGQgYXMgZWMyLkNmblNlY3VyaXR5R3JvdXA7XG5cbiAgICAvLyBTMyBidWNrZXQgZm9yIENsb3VkRnJvbnQgYWNjZXNzIGxvZ3NcbiAgICAvLyBFbmFibGVzIHRyYWZmaWMgYW5hbHlzaXMsIGJvdCBkZXRlY3Rpb24sIGFuZCBnZW8tcmVzdHJpY3Rpb24gdmVyaWZpY2F0aW9uXG4gICAgY29uc3QgYWNjZXNzTG9nc0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0Nsb3VkRnJvbnRBY2Nlc3NMb2dzQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogYGxlby1zYWFzLWFjY2Vzcy1sb2dzLSR7dGhpcy5hY2NvdW50fWAsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgICBsaWZlY3ljbGVSdWxlczogW1xuICAgICAgICB7XG4gICAgICAgICAgZXhwaXJhdGlvbjogY2RrLkR1cmF0aW9uLmRheXMoOTApLCAvLyBLZWVwIGxvZ3MgZm9yIDkwIGRheXNcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBvYmplY3RPd25lcnNoaXA6IHMzLk9iamVjdE93bmVyc2hpcC5CVUNLRVRfT1dORVJfUFJFRkVSUkVELFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsICdMZW9TYWFzRGlzdHJpYnV0aW9uJywge1xuICAgICAgY29tbWVudDogJ0xlbyBTYWFTIENETiB3aXRoIGdlby1yZXN0cmljdGlvbicsXG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5IdHRwT3JpZ2luKGFsYi5sb2FkQmFsYW5jZXJEbnNOYW1lLCB7XG4gICAgICAgICAgcHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUF9PTkxZLFxuICAgICAgICAgIGh0dHBQb3J0OiA4MCxcbiAgICAgICAgfSksXG4gICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsXG4gICAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5BTExfVklFV0VSLFxuICAgICAgfSxcbiAgICAgIC8vIEdlby1yZXN0cmljdGlvbjogQUxMT1cgb25seSBVUywgTWV4aWNvLCBQdWVydG8gUmljb1xuICAgICAgZ2VvUmVzdHJpY3Rpb246IGNsb3VkZnJvbnQuR2VvUmVzdHJpY3Rpb24uYWxsb3dsaXN0KCdVUycsICdNWCcsICdQUicpLFxuICAgICAgLy8gRW5hYmxlIEhUVFAvMiBhbmQgSFRUUC8zIGZvciBiZXR0ZXIgV2ViU29ja2V0IHBlcmZvcm1hbmNlXG4gICAgICBodHRwVmVyc2lvbjogY2xvdWRmcm9udC5IdHRwVmVyc2lvbi5IVFRQMl9BTkRfMyxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU18xMDAsIC8vIFVTLCBDYW5hZGEsIEV1cm9wZSBvbmx5XG4gICAgICAvLyBBY2Nlc3MgbG9nZ2luZyBmb3IgdHJhZmZpYyBhbmFseXNpcyBhbmQgYm90IGRldGVjdGlvblxuICAgICAgbG9nQnVja2V0OiBhY2Nlc3NMb2dzQnVja2V0LFxuICAgICAgbG9nRmlsZVByZWZpeDogJ2Nsb3VkZnJvbnQvJyxcbiAgICAgIGVuYWJsZUxvZ2dpbmc6IHRydWUsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQWNjZXNzTG9nc0J1Y2tldE5hbWUnLCB7XG4gICAgICB2YWx1ZTogYWNjZXNzTG9nc0J1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIENsb3VkRnJvbnQgYWNjZXNzIGxvZ3MnLFxuICAgIH0pO1xuXG4gICAgLy8gTG9vayB1cCBDbG91ZEZyb250IG1hbmFnZWQgcHJlZml4IGxpc3RcbiAgICAvLyBUaGlzIGNvbnRhaW5zIGFsbCBDbG91ZEZyb250IGVkZ2UgSVAgcmFuZ2VzIGFuZCBhdXRvLXVwZGF0ZXNcbiAgICBjb25zdCBjbG91ZEZyb250UHJlZml4TGlzdCA9IGVjMi5QcmVmaXhMaXN0LmZyb21Mb29rdXAodGhpcywgJ0Nsb3VkRnJvbnRQcmVmaXhMaXN0Jywge1xuICAgICAgcHJlZml4TGlzdE5hbWU6ICdjb20uYW1hem9uYXdzLmdsb2JhbC5jbG91ZGZyb250Lm9yaWdpbi1mYWNpbmcnLFxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHNlY3VyaXR5IGdyb3VwIHRvIE9OTFkgYWxsb3cgQ2xvdWRGcm9udCB0cmFmZmljIChlbmZvcmNlcyBnZW8tcmVzdHJpY3Rpb24pXG4gICAgY2ZuU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSW5ncmVzcyA9IFtcbiAgICAgIC8vIENsb3VkRnJvbnQgSVAgcmFuZ2VzIHZpYSBtYW5hZ2VkIHByZWZpeCBsaXN0IC0gYmxvY2tzIGRpcmVjdCBBTEIgYWNjZXNzXG4gICAgICB7XG4gICAgICAgIGlwUHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICBmcm9tUG9ydDogODAsXG4gICAgICAgIHRvUG9ydDogODAsXG4gICAgICAgIHNvdXJjZVByZWZpeExpc3RJZDogY2xvdWRGcm9udFByZWZpeExpc3QucHJlZml4TGlzdElkLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FsbG93IEhUVFAgb25seSBmcm9tIENsb3VkRnJvbnQgKGdlby1yZXN0cmljdGlvbiBlbmZvcmNlZCknLFxuICAgICAgfSxcbiAgICAgIC8vIFZQQyBpbnRlcm5hbCAtIHJlcXVpcmVkIGZvciBnZW5lcmF0b3IgV2ViU29ja2V0IGNvbm5lY3Rpb25zXG4gICAgICB7XG4gICAgICAgIGlwUHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICBmcm9tUG9ydDogODAsXG4gICAgICAgIHRvUG9ydDogODAsXG4gICAgICAgIGNpZHJJcDogJzEwLjAuMC4wLzE2JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBIVFRQIGZyb20gVlBDIGludGVybmFsIChmb3IgZ2VuZXJhdG9yIFdlYlNvY2tldCBjb25uZWN0aW9ucyknLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaXBQcm90b2NvbDogJ3RjcCcsXG4gICAgICAgIGZyb21Qb3J0OiA4MCxcbiAgICAgICAgdG9Qb3J0OiA4MCxcbiAgICAgICAgc291cmNlU2VjdXJpdHlHcm91cElkOiBhcHBHZW5lcmF0b3JTZWN1cml0eUdyb3VwLnNlY3VyaXR5R3JvdXBJZCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBIVFRQIGZyb20gZ2VuZXJhdG9yIHRhc2tzIHNlY3VyaXR5IGdyb3VwJyxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIC8vIE91dHB1dCBDbG91ZEZyb250IFVSTCAodGhpcyBpcyBub3cgdGhlIHByaW1hcnkgYWNjZXNzIHBvaW50KVxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbG91ZEZyb250VVJMJywge1xuICAgICAgdmFsdWU6IGBodHRwczovLyR7ZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWV9YCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBVUkwgKGdlby1yZXN0cmljdGVkIHRvIFVTLCBNWCwgUFIpJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TYWFzQ2xvdWRGcm9udFVSTCcsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgRUNTIG9yY2hlc3RyYXRvciBlbnZpcm9ubWVudCB2YXJpYWJsZXMgdmlhIENsb3VkRm9ybWF0aW9uIHByb3BlcnR5IG92ZXJyaWRlXG4gICAgLy8gVGhlc2UgdmFyaWFibGVzIHJlZmVyZW5jZSByZXNvdXJjZXMgY3JlYXRlZCBsYXRlciBpbiB0aGUgc3RhY2ssIHNvIHdlIGNhbid0XG4gICAgLy8gYWRkIHRoZW0gaW4gdGhlIG5vcm1hbCBlbnZpcm9ubWVudCBibG9jay4gV2UgdXNlIGFkZFByb3BlcnR5T3ZlcnJpZGUgdG8gYWRkXG4gICAgLy8gdGhlbSB0byB0aGUgZmlyc3QgY29udGFpbmVyJ3MgZW52aXJvbm1lbnQgdmFyaWFibGVzLlxuICAgIGNvbnN0IGNmblRhc2tEZWYgPSBhcHBHZW5TYWFzVGFza0RlZi5ub2RlLmRlZmF1bHRDaGlsZCBhcyBlY3MuQ2ZuVGFza0RlZmluaXRpb247XG5cbiAgICAvLyBHZXQgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgYXJyYXkgbGVuZ3RoIHRvIGFwcGVuZCBuZXcgdmFyc1xuICAgIC8vIFRoZXNlIG5hbWVzIG11c3QgbWF0Y2ggd2hhdCBGYXJnYXRlQ29udGFpbmVyTWFuYWdlciBleHBlY3RzXG4gICAgY2ZuVGFza0RlZi5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdDb250YWluZXJEZWZpbml0aW9ucy4wLkVudmlyb25tZW50LjEyJywge1xuICAgICAgTmFtZTogJ0VDU19TRUNVUklUWV9HUk9VUCcsXG4gICAgICBWYWx1ZTogYXBwR2VuZXJhdG9yU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgfSk7XG4gICAgY2ZuVGFza0RlZi5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdDb250YWluZXJEZWZpbml0aW9ucy4wLkVudmlyb25tZW50LjEzJywge1xuICAgICAgTmFtZTogJ0VDU19UQVNLX0RFRklOSVRJT04nLFxuICAgICAgVmFsdWU6IGFwcEdlbmVyYXRvclRhc2tEZWYudGFza0RlZmluaXRpb25Bcm4sXG4gICAgfSk7XG4gICAgLy8gVXNlIENsb3VkTWFwIGludGVybmFsIEROUyBmb3IgV2ViU29ja2V0IGNvbm5lY3Rpb24gZnJvbSBnZW5lcmF0b3IgdGFza3NcbiAgICAvLyBBTEIgcHVibGljIEROUyBkb2Vzbid0IHdvcmsgZnJvbSBpbnNpZGUgVlBDIChoYWlycGluIE5BVCBpc3N1ZSlcbiAgICBjZm5UYXNrRGVmLmFkZFByb3BlcnR5T3ZlcnJpZGUoJ0NvbnRhaW5lckRlZmluaXRpb25zLjAuRW52aXJvbm1lbnQuMTQnLCB7XG4gICAgICBOYW1lOiAnV1NJX1BVQkxJQ19VUkwnLFxuICAgICAgVmFsdWU6IGB3czovL29yY2hlc3RyYXRvci5sZW8tc2Fhcy5sb2NhbDo1MDEzL3dzaWAsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3VwYWJhc2VVcmxTZWNyZXRBcm4nLCB7XG4gICAgICB2YWx1ZTogc3VwYWJhc2VVcmxTZWNyZXQuc2VjcmV0QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdTdXBhYmFzZSBVUkwgc2VjcmV0IEFSTicsXG4gICAgICBleHBvcnROYW1lOiAnTGVvU2Fhcy1TdXBhYmFzZVVybFNlY3JldEFybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3VwYWJhc2VBbm9uS2V5U2VjcmV0QXJuJywge1xuICAgICAgdmFsdWU6IHN1cGFiYXNlQW5vbktleVNlY3JldC5zZWNyZXRBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ1N1cGFiYXNlIGFub24ga2V5IHNlY3JldCBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1NhYXMtU3VwYWJhc2VBbm9uS2V5U2VjcmV0QXJuJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdTdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0QXJuJywge1xuICAgICAgdmFsdWU6IHN1cGFiYXNlU2VydmljZVJvbGVLZXlTZWNyZXQuc2VjcmV0QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdTdXBhYmFzZSBzZXJ2aWNlIHJvbGUga2V5IHNlY3JldCBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1NhYXMtU3VwYWJhc2VTZXJ2aWNlUm9sZUtleVNlY3JldEFybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQUxCRG5zTmFtZScsIHtcbiAgICAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlciBETlMgTmFtZScsXG4gICAgICBleHBvcnROYW1lOiAnTGVvU2Fhc0FMQkRuc05hbWUnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xlb1Rhc2tEZWZBcm4nLCB7XG4gICAgICB2YWx1ZTogYXBwR2VuZXJhdG9yVGFza0RlZi50YXNrRGVmaW5pdGlvbkFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnTGVvIEdlbmVyYXRvciBUYXNrIERlZmluaXRpb24gQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9UYXNrRGVmQXJuJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZW9TZWN1cml0eUdyb3VwSWQnLCB7XG4gICAgICB2YWx1ZTogYXBwR2VuZXJhdG9yU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IEdyb3VwIElEIGZvciBsZW8gZ2VuZXJhdG9yIHRhc2tzJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TZWN1cml0eUdyb3VwSWQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xlb1N1Ym5ldElkcycsIHtcbiAgICAgIHZhbHVlOiB2cGMucHVibGljU3VibmV0cy5tYXAocyA9PiBzLnN1Ym5ldElkKS5qb2luKCcsJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ1N1Ym5ldCBJRHMgZm9yIGxlbyBnZW5lcmF0b3IgdGFza3MnLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1N1Ym5ldElkcycsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGVvU2Fhc0dlbmVyYXRlZEFwcHNCdWNrZXROYW1lJywge1xuICAgICAgdmFsdWU6IGFwcEJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGdlbmVyYXRlZCBhcHBzJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TYWFzR2VuZXJhdGVkQXBwc0J1Y2tldE5hbWUnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0NsYXVkZVRva2VuU2VjcmV0QXJuJywge1xuICAgICAgdmFsdWU6IGNsYXVkZVRva2VuU2VjcmV0LnNlY3JldEFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xhdWRlIE9BdXRoIHRva2VuIHNlY3JldCBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1NhYXMtQ2xhdWRlVG9rZW5TZWNyZXRBcm4nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xlb1NhYXNBcHBSZXBvc2l0b3J5VXJpJywge1xuICAgICAgdmFsdWU6IGFwcEdlblNhYXNSZXBvc2l0b3J5LnJlcG9zaXRvcnlVcmksXG4gICAgICBkZXNjcmlwdGlvbjogJ0VDUiBVUkkgZm9yIExlbyBTYWFTIEFwcCByZXBvc2l0b3J5JyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZW9SZXBvc2l0b3J5VXJpJywge1xuICAgICAgdmFsdWU6IGFwcEdlbmVyYXRvclJlcG9zaXRvcnkucmVwb3NpdG9yeVVyaSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRUNSIFVSSSBmb3IgTGVvIEdlbmVyYXRvciByZXBvc2l0b3J5JyxcbiAgICB9KTtcbiAgfVxufVxuIl19