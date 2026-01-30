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
        const openaiApiKeySecret = secretsmanager.Secret.fromSecretNameV2(this, 'OpenaiApiKey', 'leo/openai-api-key');
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
        openaiApiKeySecret.grantRead(executionRole); // For leo-saas-app's OPENAI_API_KEY (summarizer)
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
                OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openaiApiKeySecret),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVvLXNhYXMtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsZW8tc2Fhcy1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMseURBQTJDO0FBQzNDLHlEQUEyQztBQUMzQyx5REFBMkM7QUFDM0MsOEVBQWdFO0FBQ2hFLHdFQUEwRDtBQUMxRCx1REFBeUM7QUFDekMsMkRBQTZDO0FBQzdDLHlEQUEyQztBQUMzQywrRUFBaUU7QUFDakUsbUZBQXFFO0FBQ3JFLHVFQUF5RDtBQUN6RCw0RUFBOEQ7QUFHOUQsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFhekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixxREFBcUQ7UUFDckQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO1FBQ3RELE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztRQUU3RCwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FDYixpRUFBaUUsQ0FDbEUsQ0FBQztRQUNKLENBQUM7UUFFRCw0RUFBNEU7UUFDNUUsMkJBQTJCO1FBQzNCLDRFQUE0RTtRQUM1RSxxRUFBcUU7UUFDckUsdUVBQXVFO1FBQ3ZFLDJEQUEyRDtRQUMzRCxFQUFFO1FBQ0Ysb0RBQW9EO1FBQ3BELGtFQUFrRTtRQUNsRSxrQ0FBa0M7UUFDbEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFD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QUFvQztZQUNqRCxVQUFVLEVBQUUsY0FBYztTQUMzQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxFQUFFO1lBQ3hELEtBQUssRUFBRSxTQUFTLENBQUMsVUFBVTtZQUMzQixXQUFXLEVBQUUsOEJBQThCO1lBQzNDLFVBQVUsRUFBRSxnQ0FBZ0M7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUM5QyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsU0FBUztZQUNsQyxXQUFXLEVBQUUsK0JBQStCO1lBQzVDLFVBQVUsRUFBRSw4QkFBOEI7U0FDM0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUNqRCxLQUFLLEVBQUUsb0JBQW9CLENBQUMsYUFBYTtZQUN6QyxXQUFXLEVBQUUscUNBQXFDO1NBQ25ELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDMUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLGFBQWE7WUFDM0MsV0FBVyxFQUFFLHNDQUFzQztTQUNwRCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF4cUJELG9DQXdxQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgZWNyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3InO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgc2VjcmV0c21hbmFnZXIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlY3JldHNtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHNlcnZpY2VkaXNjb3ZlcnkgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlcnZpY2VkaXNjb3ZlcnknO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5cbmV4cG9ydCBjbGFzcyBMZW9TYWFzU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAvKipcbiAgICogVGhlIFZQQyB3aGVyZSBhbGwgTGVvIHJlc291cmNlcyBhcmUgZGVwbG95ZWQuXG4gICAqIEV4cG9ydGVkIGZvciB1c2UgYnkgTGVvRWZzU3RhY2suXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgdnBjOiBlYzIuVnBjO1xuXG4gIC8qKlxuICAgKiBTZWN1cml0eSBncm91cCBmb3IgTGVvIGdlbmVyYXRvciB0YXNrcy5cbiAgICogRXhwb3J0ZWQgZm9yIHVzZSBieSBMZW9FZnNTdGFjayAodG8gYWxsb3cgTkZTIHRyYWZmaWMpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGdlbmVyYXRvclNlY3VyaXR5R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIEltYWdlIHRhZ3MgZnJvbSBlbnZpcm9ubWVudCAoc2V0IGJ5IGRlcGxveSBzY3JpcHQpXG4gICAgY29uc3QgbGVvU2Fhc0FwcFRhZyA9IHByb2Nlc3MuZW52LkxFT19TQUFTX0FQUF9UQUc7XG4gICAgY29uc3QgbGVvR2VuZXJhdG9yVGFnID0gcHJvY2Vzcy5lbnYuTEVPX0dFTkVSQVRPUl9UQUc7XG4gICAgY29uc3QgbGVvR2VuZXJhdG9yVXJpVGFnID0gcHJvY2Vzcy5lbnYuTEVPX0dFTkVSQVRPUl9VUklfVEFHO1xuXG4gICAgLy8gRmFpbCBmYXN0IGlmIHRhZ3Mgbm90IHByb3ZpZGVkIChubyBmYWxsYmFjayB0byAnbGF0ZXN0JylcbiAgICBpZiAoIWxlb1NhYXNBcHBUYWcgfHwgIWxlb0dlbmVyYXRvclRhZyB8fCAhbGVvR2VuZXJhdG9yVXJpVGFnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJbWFnZSB0YWdzIG5vdCBwcm92aWRlZC4gUnVuIGRlcGxveW1lbnQgdmlhIC4vc2NyaXB0cy9kZXBsb3kuc2gnXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBPcHRpb25hbCBFRlMgSW50ZWdyYXRpb25cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRUZTIHByb3ZpZGVzIHBlcnNpc3RlbnQgc3RvcmFnZSBmb3IgZ2VuZXJhdG9yIGNvbnRhaW5lcnMsIGVuYWJsaW5nXG4gICAgLy8gaW5zdGFudCByZXN1bWUgKH4xMHMgdnMgNS0xMG1pbikuIFBhc3MgdGhlc2UgY29udGV4dCB2YXJzIHRvIGVuYWJsZTpcbiAgICAvLyAgIC1jIGVmc0ZpbGVTeXN0ZW1JZD1mcy14eHggLWMgZWZzQWNjZXNzUG9pbnRJZD1mc2FwLXh4eFxuICAgIC8vXG4gICAgLy8gR2V0IElEcyBmcm9tIExlb0Vmc1N0YWNrIG91dHB1dHMgYWZ0ZXIgZGVwbG95aW5nOlxuICAgIC8vICAgYXdzIGNsb3VkZm9ybWF0aW9uIGRlc2NyaWJlLXN0YWNrcyAtLXN0YWNrLW5hbWUgTGVvRWZzU3RhY2sgXFxcbiAgICAvLyAgICAgLS1xdWVyeSAnU3RhY2tzWzBdLk91dHB1dHMnXG4gICAgY29uc3QgZWZzRmlsZVN5c3RlbUlkID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2Vmc0ZpbGVTeXN0ZW1JZCcpIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBlZnNBY2Nlc3NQb2ludElkID0gdGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ2Vmc0FjY2Vzc1BvaW50SWQnKSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY29uc3QgZWZzRW5hYmxlZCA9ICEhKGVmc0ZpbGVTeXN0ZW1JZCAmJiBlZnNBY2Nlc3NQb2ludElkKTtcblxuICAgIGlmIChlZnNFbmFibGVkKSB7XG4gICAgICBjb25zb2xlLmxvZyhgRUZTIGVuYWJsZWQ6IEZpbGVTeXN0ZW09JHtlZnNGaWxlU3lzdGVtSWR9LCBBY2Nlc3NQb2ludD0ke2Vmc0FjY2Vzc1BvaW50SWR9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdFRlMgbm90IGVuYWJsZWQgKHBhc3MgLWMgZWZzRmlsZVN5c3RlbUlkPS4uLiAtYyBlZnNBY2Nlc3NQb2ludElkPS4uLiB0byBlbmFibGUpJyk7XG4gICAgfVxuXG4gICAgLy8gVlBDIGZvciBhbGwgTGVvIHJlc291cmNlc1xuICAgIC8vIEV4cG9ydGVkIHZpYSB0aGlzLnZwYyBmb3IgdXNlIGJ5IExlb0Vmc1N0YWNrXG4gICAgdGhpcy52cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnTGVvU2Fhc1ZQQycsIHtcbiAgICAgIG1heEF6czogMixcbiAgICAgIG5hdEdhdGV3YXlzOiAwLFxuICAgICAgaXBQcm90b2NvbDogZWMyLklwUHJvdG9jb2wuRFVBTF9TVEFDSywgIC8vIEVuYWJsZSBJUHY2XG4gICAgICBzdWJuZXRDb25maWd1cmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1B1YmxpYycsXG4gICAgICAgICAgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDLFxuICAgICAgICAgIG1hcFB1YmxpY0lwT25MYXVuY2g6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIGNvbnN0IHZwYyA9IHRoaXMudnBjOyAvLyBMb2NhbCBhbGlhcyBmb3IgY29udmVuaWVuY2VcblxuICAgIGNvbnN0IHN1cGFiYXNlVXJsU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ1N1cGFiYXNlVXJsJyxcbiAgICAgICdsZW8vc3VwYWJhc2UtdXJsJ1xuICAgICk7XG5cbiAgICBjb25zdCBzdXBhYmFzZUFub25LZXlTZWNyZXQgPSBzZWNyZXRzbWFuYWdlci5TZWNyZXQuZnJvbVNlY3JldE5hbWVWMihcbiAgICAgIHRoaXMsXG4gICAgICAnU3VwYWJhc2VBbm9uS2V5JyxcbiAgICAgICdsZW8vc3VwYWJhc2UtYW5vbi1rZXknXG4gICAgKTtcblxuICAgIGNvbnN0IHN1cGFiYXNlU2VydmljZVJvbGVLZXlTZWNyZXQgPSBzZWNyZXRzbWFuYWdlci5TZWNyZXQuZnJvbVNlY3JldE5hbWVWMihcbiAgICAgIHRoaXMsXG4gICAgICAnU3VwYWJhc2VTZXJ2aWNlUm9sZUtleScsXG4gICAgICAnbGVvL3N1cGFiYXNlLXNlcnZpY2Utcm9sZS1rZXknXG4gICAgKTtcblxuICAgIGNvbnN0IGRhdGFiYXNlVXJsU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ0RhdGFiYXNlVXJsJyxcbiAgICAgICdsZW8vZGF0YWJhc2UtdXJsJ1xuICAgICk7XG5cbiAgICBjb25zdCBnaXRodWJCb3RUb2tlblNlY3JldCA9IHNlY3JldHNtYW5hZ2VyLlNlY3JldC5mcm9tU2VjcmV0TmFtZVYyKFxuICAgICAgdGhpcyxcbiAgICAgICdHaXRodWJCb3RUb2tlbicsXG4gICAgICAnbGVvL2dpdGh1Yi1ib3QtdG9rZW4nXG4gICAgKTtcblxuICAgIGNvbnN0IGZseUFwaVRva2VuU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ0ZseUFwaVRva2VuJyxcbiAgICAgICdsZW8vZmx5LWFwaS10b2tlbidcbiAgICApO1xuXG4gICAgLy8gUG9vbCBtb2RlIHJlbW92ZWQgLSBub3cgdXNpbmcgcGVyLWFwcCBTdXBhYmFzZSBtb2RlXG4gICAgLy8gU2VlIFNUQVRVUy5tZCAyMDI2LTAxLTA0OiBcIlBvb2wgTW9kZSBSZW1vdmFsXCJcblxuICAgIGNvbnN0IGFwcEJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ0xlb1NhYXNHZW5lcmF0ZWRBcHBzQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogYGxlby1zYWFzLWdlbmVyYXRlZC1hcHBzLSR7dGhpcy5hY2NvdW50fWAsXG4gICAgICB2ZXJzaW9uZWQ6IGZhbHNlLFxuICAgICAgcHVibGljUmVhZEFjY2VzczogZmFsc2UsXG4gICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAnRGVsZXRlT2xkQXBwcycsXG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBleHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygzMCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2xhdWRlVG9rZW5TZWNyZXQgPSBzZWNyZXRzbWFuYWdlci5TZWNyZXQuZnJvbVNlY3JldE5hbWVWMihcbiAgICAgIHRoaXMsXG4gICAgICAnQ2xhdWRlT0F1dGhUb2tlbicsXG4gICAgICAnbGVvL2NsYXVkZS1vYXV0aC10b2tlbidcbiAgICApO1xuXG4gICAgY29uc3Qgb3BlbmFpQXBpS2V5U2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ09wZW5haUFwaUtleScsXG4gICAgICAnbGVvL29wZW5haS1hcGkta2V5J1xuICAgICk7XG5cbiAgICBjb25zdCBzdXBhYmFzZUFjY2Vzc1Rva2VuU2VjcmV0ID0gc2VjcmV0c21hbmFnZXIuU2VjcmV0LmZyb21TZWNyZXROYW1lVjIoXG4gICAgICB0aGlzLFxuICAgICAgJ1N1cGFiYXNlQWNjZXNzVG9rZW4nLFxuICAgICAgJ2xlby9zdXBhYmFzZS1hY2Nlc3MtdG9rZW4nXG4gICAgKTtcblxuICAgIGNvbnN0IGNsdXN0ZXIgPSBuZXcgZWNzLkNsdXN0ZXIodGhpcywgJ0xlb1NhYXNDbHVzdGVyJywge1xuICAgICAgY2x1c3Rlck5hbWU6ICdsZW8tc2Fhcy1jbHVzdGVyJyxcbiAgICAgIHZwYyxcbiAgICAgIGNvbnRhaW5lckluc2lnaHRzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ2xvdWRNYXAgbmFtZXNwYWNlIGZvciBzZXJ2aWNlIGRpc2NvdmVyeVxuICAgIC8vIFRoaXMgYWxsb3dzIGNvbnRhaW5lcnMgdG8gZGlzY292ZXIgZWFjaCBvdGhlciB2aWEgaW50ZXJuYWwgRE5TIChlLmcuLCBvcmNoZXN0cmF0b3IubGVvLXNhYXMubG9jYWwpXG4gICAgY29uc3QgbmFtZXNwYWNlID0gbmV3IHNlcnZpY2VkaXNjb3ZlcnkuUHJpdmF0ZURuc05hbWVzcGFjZSh0aGlzLCAnTGVvU2Fhc05hbWVzcGFjZScsIHtcbiAgICAgIG5hbWU6ICdsZW8tc2Fhcy5sb2NhbCcsXG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkTWFwIG5hbWVzcGFjZSBmb3IgTEVPIFNhYVMgc2VydmljZSBkaXNjb3ZlcnknLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBwR2VuU2Fhc1JlcG9zaXRvcnkgPSBuZXcgZWNyLlJlcG9zaXRvcnkodGhpcywgJ0xlb1NhYXNBcHBSZXBvc2l0b3J5Jywge1xuICAgICAgcmVwb3NpdG9yeU5hbWU6ICdsZW8tc2Fhcy1hcHAnLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVJbWFnZXM6IHRydWUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcHBHZW5lcmF0b3JSZXBvc2l0b3J5ID0gbmV3IGVjci5SZXBvc2l0b3J5KHRoaXMsICdMZW9SZXBvc2l0b3J5Jywge1xuICAgICAgcmVwb3NpdG9yeU5hbWU6ICdsZW8nLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVJbWFnZXM6IHRydWUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcHBHZW5TYWFzVGFza1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0xlb1NhYXNBcHBUYXNrUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxuICAgICAgZGVzY3JpcHRpb246ICdUYXNrIHJvbGUgZm9yIGxlby1zYWFzLWFwcCBzZXJ2aWNlJyxcbiAgICB9KTtcblxuICAgIGFwcEdlblNhYXNUYXNrUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdlY3M6UnVuVGFzaycsXG4gICAgICAgICdlY3M6U3RvcFRhc2snLFxuICAgICAgICAnZWNzOkRlc2NyaWJlVGFza3MnLFxuICAgICAgICAnZWNzOkxpc3RUYXNrcycsXG4gICAgICAgICdlY3M6VGFnUmVzb3VyY2UnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICdBcm5FcXVhbHMnOiB7XG4gICAgICAgICAgJ2VjczpjbHVzdGVyJzogY2x1c3Rlci5jbHVzdGVyQXJuLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KSk7XG5cbiAgICBhcHBHZW5TYWFzVGFza1JvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydpYW06UGFzc1JvbGUnXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgICdTdHJpbmdMaWtlJzoge1xuICAgICAgICAgICdpYW06UGFzc2VkVG9TZXJ2aWNlJzogJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgYXBwQnVja2V0LmdyYW50UmVhZFdyaXRlKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgY2xhdWRlVG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgc3VwYWJhc2VVcmxTZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgc3VwYWJhc2VBbm9uS2V5U2VjcmV0LmdyYW50UmVhZChhcHBHZW5TYWFzVGFza1JvbGUpO1xuICAgIHN1cGFiYXNlU2VydmljZVJvbGVLZXlTZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgZGF0YWJhc2VVcmxTZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgZ2l0aHViQm90VG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG4gICAgZmx5QXBpVG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlblNhYXNUYXNrUm9sZSk7XG5cbiAgICBjb25zdCBhcHBHZW5lcmF0b3JUYXNrUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnTGVvVGFza1JvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGFzayByb2xlIGZvciBsZW8gZ2VuZXJhdG9yIHRhc2tzJyxcbiAgICB9KTtcblxuICAgIGFwcEJ1Y2tldC5ncmFudFdyaXRlKGFwcEdlbmVyYXRvclRhc2tSb2xlKTtcbiAgICAvLyBBbGwgc2VjcmV0cyBsb2FkZWQgYXQgcnVudGltZSB2aWEgYXdzX3NlY3JldHMucHkgKG5vdCBFQ1MgdGFzayBkZWZpbml0aW9uKVxuICAgIGNsYXVkZVRva2VuU2VjcmV0LmdyYW50UmVhZChhcHBHZW5lcmF0b3JUYXNrUm9sZSk7XG4gICAgc3VwYWJhc2VBY2Nlc3NUb2tlblNlY3JldC5ncmFudFJlYWQoYXBwR2VuZXJhdG9yVGFza1JvbGUpO1xuICAgIGdpdGh1YkJvdFRva2VuU2VjcmV0LmdyYW50UmVhZChhcHBHZW5lcmF0b3JUYXNrUm9sZSk7XG4gICAgZmx5QXBpVG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGFwcEdlbmVyYXRvclRhc2tSb2xlKTtcblxuICAgIGNvbnN0IGV4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1Rhc2tFeGVjdXRpb25Sb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQW1hem9uRUNTVGFza0V4ZWN1dGlvblJvbGVQb2xpY3knKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBFeGVjdXRpb24gcm9sZSBncmFudHMgZm9yIGxlby1zYWFzLWFwcCBjb250YWluZXIgKEVDUyBzZWNyZXQgaW5qZWN0aW9uKVxuICAgIC8vIE5vdGU6IEdlbmVyYXRvciBjb250YWluZXIgc2VjcmV0cyBhcmUgbG9hZGVkIGF0IHJ1bnRpbWUgdmlhIGF3c19zZWNyZXRzLnB5XG4gICAgc3VwYWJhc2VVcmxTZWNyZXQuZ3JhbnRSZWFkKGV4ZWN1dGlvblJvbGUpO1xuICAgIHN1cGFiYXNlQW5vbktleVNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7XG4gICAgc3VwYWJhc2VTZXJ2aWNlUm9sZUtleVNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7XG4gICAgZGF0YWJhc2VVcmxTZWNyZXQuZ3JhbnRSZWFkKGV4ZWN1dGlvblJvbGUpO1xuICAgIGdpdGh1YkJvdFRva2VuU2VjcmV0LmdyYW50UmVhZChleGVjdXRpb25Sb2xlKTtcbiAgICBmbHlBcGlUb2tlblNlY3JldC5ncmFudFJlYWQoZXhlY3V0aW9uUm9sZSk7XG4gICAgY2xhdWRlVG9rZW5TZWNyZXQuZ3JhbnRSZWFkKGV4ZWN1dGlvblJvbGUpOyAgLy8gRm9yIGxlby1zYWFzLWFwcCdzIENMQVVERV9DT0RFX09BVVRIX1RPS0VOXG4gICAgb3BlbmFpQXBpS2V5U2VjcmV0LmdyYW50UmVhZChleGVjdXRpb25Sb2xlKTsgIC8vIEZvciBsZW8tc2Fhcy1hcHAncyBPUEVOQUlfQVBJX0tFWSAoc3VtbWFyaXplcilcblxuICAgIGNvbnN0IGFwcEdlblNhYXNUYXNrRGVmID0gbmV3IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgJ0xlb1NhYXNBcHBUYXNrRGVmJywge1xuICAgICAgbWVtb3J5TGltaXRNaUI6IDIwNDgsXG4gICAgICBjcHU6IDEwMjQsXG4gICAgICB0YXNrUm9sZTogYXBwR2VuU2Fhc1Rhc2tSb2xlLFxuICAgICAgZXhlY3V0aW9uUm9sZSxcbiAgICB9KTtcblxuICAgIGFwcEdlblNhYXNUYXNrRGVmLmFkZENvbnRhaW5lcignbGVvLXNhYXMtYXBwJywge1xuICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tRWNyUmVwb3NpdG9yeShhcHBHZW5TYWFzUmVwb3NpdG9yeSwgbGVvU2Fhc0FwcFRhZyksXG4gICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgc3RyZWFtUHJlZml4OiAnbGVvLXNhYXMtYXBwJyxcbiAgICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICB9KSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgICAgIFBPUlQ6ICc1MDEzJyxcbiAgICAgICAgQVVUSF9NT0RFOiAnc3VwYWJhc2UnLFxuICAgICAgICBTVE9SQUdFX01PREU6ICdkYXRhYmFzZScsXG4gICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLCAgLy8gUmVxdWlyZWQgZm9yIEFXUyBTREsgKFNlY3JldHMgTWFuYWdlcilcbiAgICAgICAgVVNFX0FXU19PUkNIRVNUUkFUT1I6ICd0cnVlJyxcbiAgICAgICAgVVNFX0dJVEhVQl9JTlRFR1JBVElPTjogJ3RydWUnLFxuICAgICAgICBFQ1NfQ0xVU1RFUjogY2x1c3Rlci5jbHVzdGVyTmFtZSxcbiAgICAgICAgRUNTX1NVQk5FVFM6IHZwYy5wdWJsaWNTdWJuZXRzLm1hcChzID0+IHMuc3VibmV0SWQpLmpvaW4oJywnKSxcbiAgICAgICAgRUNTX0NPTlRBSU5FUl9OQU1FOiAnbGVvJywgIC8vIE11c3QgbWF0Y2ggY29udGFpbmVyTmFtZSBpbiBMZW9UYXNrRGVmXG4gICAgICAgIFMzX0JVQ0tFVDogYXBwQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgIEdFTkVSQVRPUl9JTUFHRTogYCR7YXBwR2VuZXJhdG9yUmVwb3NpdG9yeS5yZXBvc2l0b3J5VXJpfToke2xlb0dlbmVyYXRvclVyaVRhZ31gLFxuICAgICAgICBOT0RFX09QVElPTlM6ICctLWRucy1yZXN1bHQtb3JkZXI9aXB2NGZpcnN0JyxcbiAgICAgICAgLy8gTm90ZTogRUNTX1NFQ1VSSVRZX0dST1VQLCBFQ1NfVEFTS19ERUZJTklUSU9OLCBhbmQgV1NJX1BVQkxJQ19VUkxcbiAgICAgICAgLy8gYXJlIGFkZGVkIGxhdGVyIHZpYSBDbG91ZEZvcm1hdGlvbiBlc2NhcGUgaGF0Y2ggYWZ0ZXIgYWxsIHJlc291cmNlcyBhcmUgY3JlYXRlZFxuICAgICAgfSxcbiAgICAgIHNlY3JldHM6IHtcbiAgICAgICAgLy8gTWFpbiBMZW8gU2FhUyBkYXRhYmFzZSAobGVvLWRldilcbiAgICAgICAgU1VQQUJBU0VfVVJMOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZVVybFNlY3JldCksXG4gICAgICAgIFNVUEFCQVNFX0FOT05fS0VZOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZUFub25LZXlTZWNyZXQpLFxuICAgICAgICBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihzdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0KSxcbiAgICAgICAgREFUQUJBU0VfVVJMOiBlY3MuU2VjcmV0LmZyb21TZWNyZXRzTWFuYWdlcihkYXRhYmFzZVVybFNlY3JldCksXG4gICAgICAgIC8vIFBvb2wgc2VjcmV0cyByZW1vdmVkIC0gdXNpbmcgcGVyLWFwcCBTdXBhYmFzZSBtb2RlXG4gICAgICAgIEdJVEhVQl9CT1RfVE9LRU46IGVjcy5TZWNyZXQuZnJvbVNlY3JldHNNYW5hZ2VyKGdpdGh1YkJvdFRva2VuU2VjcmV0KSxcbiAgICAgICAgRkxZX0FQSV9UT0tFTjogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIoZmx5QXBpVG9rZW5TZWNyZXQpLFxuICAgICAgICBDTEFVREVfQ09ERV9PQVVUSF9UT0tFTjogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIoY2xhdWRlVG9rZW5TZWNyZXQpLFxuICAgICAgICBPUEVOQUlfQVBJX0tFWTogZWNzLlNlY3JldC5mcm9tU2VjcmV0c01hbmFnZXIob3BlbmFpQXBpS2V5U2VjcmV0KSxcbiAgICAgIH0sXG4gICAgICBwb3J0TWFwcGluZ3M6IFt7XG4gICAgICAgIGNvbnRhaW5lclBvcnQ6IDUwMTMsXG4gICAgICAgIHByb3RvY29sOiBlY3MuUHJvdG9jb2wuVENQLFxuICAgICAgfV0sXG4gICAgfSk7XG5cbiAgICAvLyBHZW5lcmF0b3IgdGFzayBkZWZpbml0aW9uIC0gb3B0aW9uYWxseSBpbmNsdWRlcyBFRlMgdm9sdW1lXG4gICAgY29uc3QgYXBwR2VuZXJhdG9yVGFza0RlZiA9IG5ldyBlY3MuRmFyZ2F0ZVRhc2tEZWZpbml0aW9uKHRoaXMsICdMZW9UYXNrRGVmJywge1xuICAgICAgbWVtb3J5TGltaXRNaUI6IDgxOTIsICAvLyA4R0IgZm9yIE1WUCAtIHByZXZlbnRzIE9PTSBraWxscywgY2hlYXAgYXQgfiQwLjA1LzE1bWluXG4gICAgICBjcHU6IDQwOTYsICAvLyA0IHZDUFUgLSBGYXJnYXRlIHJlcXVpcmVzIDE6MiBDUFU6TWVtb3J5IHJhdGlvXG4gICAgICB0YXNrUm9sZTogYXBwR2VuZXJhdG9yVGFza1JvbGUsXG4gICAgICBleGVjdXRpb25Sb2xlLFxuICAgICAgLy8gQ29uZGl0aW9uYWxseSBhZGQgRUZTIHZvbHVtZSB3aGVuIGVuYWJsZWRcbiAgICAgIC4uLihlZnNFbmFibGVkID8ge1xuICAgICAgICB2b2x1bWVzOiBbe1xuICAgICAgICAgIG5hbWU6ICdsZW8tZWZzJyxcbiAgICAgICAgICBlZnNWb2x1bWVDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICBmaWxlU3lzdGVtSWQ6IGVmc0ZpbGVTeXN0ZW1JZCEsXG4gICAgICAgICAgICB0cmFuc2l0RW5jcnlwdGlvbjogJ0VOQUJMRUQnLFxuICAgICAgICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICAgICAgICBhY2Nlc3NQb2ludElkOiBlZnNBY2Nlc3NQb2ludElkISxcbiAgICAgICAgICAgICAgaWFtOiAnRU5BQkxFRCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH1dLFxuICAgICAgfSA6IHt9KSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBFRlMgSUFNIHBlcm1pc3Npb25zIHdoZW4gZW5hYmxlZFxuICAgIGlmIChlZnNFbmFibGVkKSB7XG4gICAgICBhcHBHZW5lcmF0b3JUYXNrUm9sZS5hZGRUb1BvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICdlbGFzdGljZmlsZXN5c3RlbTpDbGllbnRNb3VudCcsXG4gICAgICAgICAgJ2VsYXN0aWNmaWxlc3lzdGVtOkNsaWVudFdyaXRlJyxcbiAgICAgICAgICAnZWxhc3RpY2ZpbGVzeXN0ZW06Q2xpZW50Um9vdEFjY2VzcycsXG4gICAgICAgIF0sXG4gICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmVsYXN0aWNmaWxlc3lzdGVtOiR7dGhpcy5yZWdpb259OiR7dGhpcy5hY2NvdW50fTpmaWxlLXN5c3RlbS8ke2Vmc0ZpbGVTeXN0ZW1JZH1gXSxcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0b3IgY29udGFpbmVyIC0gb3B0aW9uYWxseSBpbmNsdWRlcyBFRlMgbW91bnQgcG9pbnRcbiAgICAvLyBOb3RlOiBTZWNyZXRzIChBTlRIUk9QSUNfQVBJX0tFWSwgU1VQQUJBU0VfQUNDRVNTX1RPS0VOLCBldGMuKSBhcmUgbG9hZGVkXG4gICAgLy8gYXQgcnVudGltZSB2aWEgYXdzX3NlY3JldHMucHksIG5vdCB2aWEgRUNTIHRhc2sgZGVmaW5pdGlvbi4gVGhpcyBpcyBzaW1wbGVyXG4gICAgLy8gYmVjYXVzZSBpdCBkb2Vzbid0IHJlcXVpcmUgQ0RLIGNoYW5nZXMgdG8gYWRkIG5ldyBzZWNyZXRzLlxuICAgIGNvbnN0IGdlbmVyYXRvckNvbnRhaW5lciA9IGFwcEdlbmVyYXRvclRhc2tEZWYuYWRkQ29udGFpbmVyKCdsZW8nLCB7XG4gICAgICBjb250YWluZXJOYW1lOiAnbGVvJyxcbiAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbUVjclJlcG9zaXRvcnkoYXBwR2VuZXJhdG9yUmVwb3NpdG9yeSwgbGVvR2VuZXJhdG9yVGFnKSxcbiAgICAgIGxvZ2dpbmc6IGVjcy5Mb2dEcml2ZXJzLmF3c0xvZ3Moe1xuICAgICAgICBzdHJlYW1QcmVmaXg6ICdsZW8nLFxuICAgICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIH0pLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQVdTX1JFR0lPTjogdGhpcy5yZWdpb24sXG4gICAgICAgIFMzX0JVQ0tFVDogYXBwQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICB9LFxuICAgICAgLy8gTm8gc2VjcmV0cyBibG9jayAtIGFsbCBzZWNyZXRzIGxvYWRlZCBhdCBydW50aW1lIHZpYSBhd3Nfc2VjcmV0cy5weVxuICAgIH0pO1xuXG4gICAgLy8gQWRkIEVGUyBtb3VudCBwb2ludCB3aGVuIGVuYWJsZWRcbiAgICBpZiAoZWZzRW5hYmxlZCkge1xuICAgICAgZ2VuZXJhdG9yQ29udGFpbmVyLmFkZE1vdW50UG9pbnRzKHtcbiAgICAgICAgY29udGFpbmVyUGF0aDogJy9lZnMnLFxuICAgICAgICBzb3VyY2VWb2x1bWU6ICdsZW8tZWZzJyxcbiAgICAgICAgcmVhZE9ubHk6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIEVDU19UQVNLX0RFRklOSVRJT04gdG8gYXBwLWdlbi1zYWFzIGNvbnRhaW5lciBub3cgdGhhdCBpdCdzIGRlZmluZWRcbiAgICBjb25zdCBhcHBHZW5TYWFzQ29udGFpbmVyID0gYXBwR2VuU2Fhc1Rhc2tEZWYuZGVmYXVsdENvbnRhaW5lciE7XG4gICAgYXBwR2VuU2Fhc0NvbnRhaW5lci5hZGRFbnZpcm9ubWVudCgnRUNTX1RBU0tfREVGSU5JVElPTicsIGFwcEdlbmVyYXRvclRhc2tEZWYudGFza0RlZmluaXRpb25Bcm4pO1xuICAgIGFwcEdlblNhYXNDb250YWluZXIuYWRkRW52aXJvbm1lbnQoJ0VDU19TRUNVUklUWV9HUk9VUCcsICcnKTsgLy8gV2lsbCBiZSBzZXQgYWZ0ZXIgc2VjdXJpdHkgZ3JvdXAgY3JlYXRpb25cblxuICAgIGNvbnN0IGFwcEdlblNhYXNTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMZW9TYWFzQXBwU0cnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5IGdyb3VwIGZvciBsZW8tc2Fhcy1hcHAgc2VydmljZScsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgICAgYWxsb3dBbGxJcHY2T3V0Ym91bmQ6IHRydWUsICAvLyBSZXF1aXJlZCBmb3IgU3VwYWJhc2UgSVB2NiBjb25uZWN0aXZpdHlcbiAgICB9KTtcblxuICAgIC8vIFNlY3VyaXR5IGdyb3VwIGZvciBMZW8gZ2VuZXJhdG9yIHRhc2tzXG4gICAgLy8gRXhwb3J0ZWQgdmlhIHRoaXMuZ2VuZXJhdG9yU2VjdXJpdHlHcm91cCBmb3IgdXNlIGJ5IExlb0Vmc1N0YWNrXG4gICAgdGhpcy5nZW5lcmF0b3JTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMZW9TRycsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIGxlbyBnZW5lcmF0b3IgdGFza3MnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgIGFsbG93QWxsSXB2Nk91dGJvdW5kOiB0cnVlLCAgLy8gUmVxdWlyZWQgZm9yIFN1cGFiYXNlIElQdjYgY29ubmVjdGl2aXR5XG4gICAgfSk7XG4gICAgY29uc3QgYXBwR2VuZXJhdG9yU2VjdXJpdHlHcm91cCA9IHRoaXMuZ2VuZXJhdG9yU2VjdXJpdHlHcm91cDsgLy8gTG9jYWwgYWxpYXNcblxuICAgIC8vIEFsbG93IGdlbmVyYXRvciB0YXNrcyB0byBjb25uZWN0IGRpcmVjdGx5IHRvIG9yY2hlc3RyYXRvciBzZXJ2aWNlIChieXBhc3MgQUxCIGZvciBXZWJTb2NrZXQpXG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBpbnRlcm5ldC1mYWNpbmcgQUxCcyBjYW4ndCBiZSByZWFjaGVkIGZyb20gd2l0aGluIFZQQyB1c2luZyBwdWJsaWMgRE5TXG4gICAgYXBwR2VuU2Fhc1NlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBhcHBHZW5lcmF0b3JTZWN1cml0eUdyb3VwLFxuICAgICAgZWMyLlBvcnQudGNwKDUwMTMpLFxuICAgICAgJ0FsbG93IGdlbmVyYXRvciB0YXNrcyB0byBjb25uZWN0IGRpcmVjdGx5IHRvIG9yY2hlc3RyYXRvciBmb3IgV2ViU29ja2V0J1xuICAgICk7XG5cbiAgICAvLyBOb3cgdXBkYXRlIHRoZSBFQ1NfU0VDVVJJVFlfR1JPVVAgd2l0aCB0aGUgYWN0dWFsIHZhbHVlXG4gICAgYXBwR2VuU2Fhc0NvbnRhaW5lci5hZGRFbnZpcm9ubWVudCgnRUNTX1NFQ1VSSVRZX0dST1VQJywgYXBwR2VuZXJhdG9yU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQpO1xuXG4gICAgY29uc3QgYWxiU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnTGVvU2Fhc0FMQlNHJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgTGVvIFNhYVMgQUxCJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgICBhbGxvd0FsbElwdjZPdXRib3VuZDogdHJ1ZSwgIC8vIFJlcXVpcmVkIGZvciBJUHY2IGR1YWwtc3RhY2tcbiAgICB9KTtcblxuICAgIC8vIE5vdGU6IFNlY3VyaXR5IGdyb3VwIGluZ3Jlc3MgcnVsZXMgYXJlIG92ZXJyaWRkZW4gYWZ0ZXIgQ2xvdWRGcm9udFxuICAgIC8vIGlzIGNvbmZpZ3VyZWQgdG8gYWxsb3cgdHJhZmZpYyBmcm9tIENsb3VkRnJvbnQgKGdlby1yZXN0cmljdGVkKS5cblxuICAgIGFwcEdlblNhYXNTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgYWxiU2VjdXJpdHlHcm91cCxcbiAgICAgIGVjMi5Qb3J0LnRjcCg1MDEzKSxcbiAgICAgICdBbGxvdyB0cmFmZmljIGZyb20gQUxCIG9uIHBvcnQgNTAxMydcbiAgICApO1xuXG4gICAgLy8gQWxsb3cgZ2VuZXJhdG9yIHRhc2tzIHRvIGNvbm5lY3QgYmFjayB0byBBTEIgZm9yIFdlYlNvY2tldCBjb21tdW5pY2F0aW9uXG4gICAgLy8gVXNpbmcgVlBDIENJRFIgaW5zdGVhZCBvZiBzZWN1cml0eSBncm91cCB0byBhdm9pZCBoYWlycGlubmluZyBpc3N1ZXNcbiAgICBhbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgZWMyLlBlZXIuaXB2NCh2cGMudnBjQ2lkckJsb2NrKSxcbiAgICAgIGVjMi5Qb3J0LnRjcCg4MCksXG4gICAgICAnQWxsb3cgVlBDIGludGVybmFsIHRyYWZmaWMgdG8gQUxCIG9uIHBvcnQgODAgZm9yIFdlYlNvY2tldCdcbiAgICApO1xuXG4gICAgY29uc3QgYWxiID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHRoaXMsICdMZW9TYWFzQUxCJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBzZWN1cml0eUdyb3VwOiBhbGJTZWN1cml0eUdyb3VwLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBwR2VuU2Fhc1NlcnZpY2UgPSBuZXcgZWNzLkZhcmdhdGVTZXJ2aWNlKHRoaXMsICdMZW9TYWFzU2VydmljZScsIHtcbiAgICAgIGNsdXN0ZXIsXG4gICAgICB0YXNrRGVmaW5pdGlvbjogYXBwR2VuU2Fhc1Rhc2tEZWYsXG4gICAgICBkZXNpcmVkQ291bnQ6IDEsXG4gICAgICBhc3NpZ25QdWJsaWNJcDogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBbYXBwR2VuU2Fhc1NlY3VyaXR5R3JvdXBdLFxuICAgICAgdnBjU3VibmV0czoge1xuICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICB9LFxuICAgICAgaGVhbHRoQ2hlY2tHcmFjZVBlcmlvZDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgLy8gU2VydmljZSBEaXNjb3Zlcnk6IFJlZ2lzdGVyIHdpdGggQ2xvdWRNYXAgZm9yIGludGVybmFsIEROU1xuICAgICAgLy8gVGhpcyBjcmVhdGVzIG9yY2hlc3RyYXRvci5sZW8tc2Fhcy5sb2NhbCBETlMgbmFtZSBmb3IgZ2VuZXJhdG9yIGNvbnRhaW5lcnMgdG8gY29ubmVjdFxuICAgICAgY2xvdWRNYXBPcHRpb25zOiB7XG4gICAgICAgIG5hbWU6ICdvcmNoZXN0cmF0b3InLFxuICAgICAgICBjbG91ZE1hcE5hbWVzcGFjZTogbmFtZXNwYWNlLFxuICAgICAgICBkbnNSZWNvcmRUeXBlOiBzZXJ2aWNlZGlzY292ZXJ5LkRuc1JlY29yZFR5cGUuQSxcbiAgICAgICAgZG5zVHRsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygxMCksXG4gICAgICAgIGNvbnRhaW5lclBvcnQ6IDUwMTMsICAvLyBXZWJTb2NrZXQgc2VydmVyIHBvcnRcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCB0YXJnZXRHcm91cCA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKHRoaXMsICdMZW9TYWFzVGFyZ2V0R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBwb3J0OiA1MDEzLFxuICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICAgIHRhcmdldFR5cGU6IGVsYnYyLlRhcmdldFR5cGUuSVAsXG4gICAgICBoZWFsdGhDaGVjazoge1xuICAgICAgICBwYXRoOiAnL2hlYWx0aCcsXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDUpLFxuICAgICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiAzLFxuICAgICAgfSxcbiAgICAgIC8vIEVuYWJsZSBzdGlja3kgc2Vzc2lvbnMgZm9yIFdlYlNvY2tldCBzdXBwb3J0XG4gICAgICAvLyBXZWJTb2NrZXQgY29ubmVjdGlvbnMgcmVxdWlyZSBzZXNzaW9uIGFmZmluaXR5IHRvIGVuc3VyZSBhbGwgZnJhbWVzXG4gICAgICAvLyBnbyB0byB0aGUgc2FtZSBiYWNrZW5kIGluc3RhbmNlIGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIGNvbm5lY3Rpb25cbiAgICAgIHN0aWNraW5lc3NDb29raWVEdXJhdGlvbjogY2RrLkR1cmF0aW9uLmRheXMoMSksXG4gICAgICBzdGlja2luZXNzQ29va2llTmFtZTogJ0xlb1NhYXNTdGlja2luZXNzJyxcbiAgICB9KTtcblxuICAgIGFwcEdlblNhYXNTZXJ2aWNlLmF0dGFjaFRvQXBwbGljYXRpb25UYXJnZXRHcm91cCh0YXJnZXRHcm91cCk7XG5cbiAgICAvLyBBZGQgQUxCIEROUyB0byBjb250YWluZXIgZW52aXJvbm1lbnQgZm9yIFdlYlNvY2tldCBVUkwgZ2VuZXJhdGlvblxuICAgIGFwcEdlblNhYXNDb250YWluZXIuYWRkRW52aXJvbm1lbnQoJ0FMQl9ETlMnLCBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSk7XG5cbiAgICAvLyBPcHRpb25hbDogSFRUUFMgc3VwcG9ydCB2aWEgQUNNIGNlcnRpZmljYXRlXG4gICAgLy8gVG8gZW5hYmxlIEhUVFBTOiBjZGsgZGVwbG95IC1jIGNlcnRpZmljYXRlQXJuPWFybjphd3M6YWNtOnJlZ2lvbjphY2NvdW50OmNlcnRpZmljYXRlL2lkXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSB0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnY2VydGlmaWNhdGVBcm4nKTtcblxuICAgIC8vIEFkZCBBUElfVVJMIGZvciBmcm9udGVuZCBjb25maWd1cmF0aW9uIGluamVjdGlvblxuICAgIC8vIEZyb250ZW5kIG5lZWRzIHRoaXMgdG8gbWFrZSBBUEkgcmVxdWVzdHMgdG8gdGhlIGNvcnJlY3QgZW5kcG9pbnRcbiAgICAvLyBVc2UgSFRUUFMgaWYgY2VydGlmaWNhdGUgaXMgY29uZmlndXJlZCwgb3RoZXJ3aXNlIEhUVFBcbiAgICBjb25zdCBhcGlVcmwgPSBjZXJ0aWZpY2F0ZUFyblxuICAgICAgPyBgaHR0cHM6Ly8ke2FsYi5sb2FkQmFsYW5jZXJEbnNOYW1lfWBcbiAgICAgIDogYGh0dHA6Ly8ke2FsYi5sb2FkQmFsYW5jZXJEbnNOYW1lfWA7XG4gICAgYXBwR2VuU2Fhc0NvbnRhaW5lci5hZGRFbnZpcm9ubWVudCgnQVBJX1VSTCcsIGFwaVVybCk7XG5cbiAgICBpZiAoY2VydGlmaWNhdGVBcm4pIHtcbiAgICAgIC8vIEhUVFBTIGxpc3RlbmVyIChwcm9kdWN0aW9uKVxuICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBhY20uQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsICdDZXJ0aWZpY2F0ZScsIGNlcnRpZmljYXRlQXJuKTtcblxuICAgICAgYWxiLmFkZExpc3RlbmVyKCdIVFRQU0xpc3RlbmVyJywge1xuICAgICAgICBwb3J0OiA0NDMsXG4gICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFBTLFxuICAgICAgICBjZXJ0aWZpY2F0ZXM6IFtjZXJ0aWZpY2F0ZV0sXG4gICAgICAgIGRlZmF1bHRBY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLmZvcndhcmQoW3RhcmdldEdyb3VwXSksXG4gICAgICB9KTtcblxuICAgICAgLy8gSFRUUCBsaXN0ZW5lciByZWRpcmVjdHMgdG8gSFRUUFNcbiAgICAgIGFsYi5hZGRMaXN0ZW5lcignSFRUUExpc3RlbmVyJywge1xuICAgICAgICBwb3J0OiA4MCxcbiAgICAgICAgZGVmYXVsdEFjdGlvbjogZWxidjIuTGlzdGVuZXJBY3Rpb24ucmVkaXJlY3Qoe1xuICAgICAgICAgIHByb3RvY29sOiAnSFRUUFMnLFxuICAgICAgICAgIHBvcnQ6ICc0NDMnLFxuICAgICAgICAgIHBlcm1hbmVudDogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICB9KTtcblxuICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VSTCcsIHtcbiAgICAgICAgdmFsdWU6IGBodHRwczovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBVUkwgKEhUVFBTKScsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSFRUUCBsaXN0ZW5lciBvbmx5ICh0ZXN0aW5nL2RldmVsb3BtZW50KVxuICAgICAgYWxiLmFkZExpc3RlbmVyKCdIVFRQTGlzdGVuZXInLCB7XG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICBkZWZhdWx0QWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5mb3J3YXJkKFt0YXJnZXRHcm91cF0pLFxuICAgICAgfSk7XG5cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVUkwnLCB7XG4gICAgICAgIHZhbHVlOiBgaHR0cDovLyR7YWxiLmxvYWRCYWxhbmNlckRuc05hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbiBVUkwgKEhUVFAgLSBhZGQgY2VydGlmaWNhdGVBcm4gY29udGV4dCBmb3IgSFRUUFMpJyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIHdpdGggZ2VvLXJlc3RyaWN0aW9uXG4gICAgLy8gUHJvdmlkZXMgSFRUUFMgdmlhICouY2xvdWRmcm9udC5uZXQgZG9tYWluIGFuZCBnZW8tZmVuY2luZ1xuICAgIGNvbnN0IGNmblNlY3VyaXR5R3JvdXAgPSBhbGJTZWN1cml0eUdyb3VwLm5vZGUuZGVmYXVsdENoaWxkIGFzIGVjMi5DZm5TZWN1cml0eUdyb3VwO1xuXG4gICAgLy8gUzMgYnVja2V0IGZvciBDbG91ZEZyb250IGFjY2VzcyBsb2dzXG4gICAgLy8gRW5hYmxlcyB0cmFmZmljIGFuYWx5c2lzLCBib3QgZGV0ZWN0aW9uLCBhbmQgZ2VvLXJlc3RyaWN0aW9uIHZlcmlmaWNhdGlvblxuICAgIGNvbnN0IGFjY2Vzc0xvZ3NCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdDbG91ZEZyb250QWNjZXNzTG9nc0J1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IGBsZW8tc2Fhcy1hY2Nlc3MtbG9ncy0ke3RoaXMuYWNjb3VudH1gLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGV4cGlyYXRpb246IGNkay5EdXJhdGlvbi5kYXlzKDkwKSwgLy8gS2VlcCBsb2dzIGZvciA5MCBkYXlzXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgb2JqZWN0T3duZXJzaGlwOiBzMy5PYmplY3RPd25lcnNoaXAuQlVDS0VUX09XTkVSX1BSRUZFUlJFRCxcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnTGVvU2Fhc0Rpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGNvbW1lbnQ6ICdMZW8gU2FhUyBDRE4gd2l0aCBnZW8tcmVzdHJpY3Rpb24nLFxuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuSHR0cE9yaWdpbihhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSwge1xuICAgICAgICAgIHByb3RvY29sUG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICBodHRwUG9ydDogODAsXG4gICAgICAgIH0pLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQWxsb3dlZE1ldGhvZHMuQUxMT1dfQUxMLFxuICAgICAgICBjYWNoZVBvbGljeTogY2xvdWRmcm9udC5DYWNoZVBvbGljeS5DQUNISU5HX0RJU0FCTEVELFxuICAgICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQUxMX1ZJRVdFUixcbiAgICAgIH0sXG4gICAgICAvLyBHZW8tcmVzdHJpY3Rpb246IEFMTE9XIG9ubHkgVVMsIE1leGljbywgUHVlcnRvIFJpY29cbiAgICAgIGdlb1Jlc3RyaWN0aW9uOiBjbG91ZGZyb250Lkdlb1Jlc3RyaWN0aW9uLmFsbG93bGlzdCgnVVMnLCAnTVgnLCAnUFInKSxcbiAgICAgIC8vIEVuYWJsZSBIVFRQLzIgYW5kIEhUVFAvMyBmb3IgYmV0dGVyIFdlYlNvY2tldCBwZXJmb3JtYW5jZVxuICAgICAgaHR0cFZlcnNpb246IGNsb3VkZnJvbnQuSHR0cFZlcnNpb24uSFRUUDJfQU5EXzMsXG4gICAgICBwcmljZUNsYXNzOiBjbG91ZGZyb250LlByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfMTAwLCAvLyBVUywgQ2FuYWRhLCBFdXJvcGUgb25seVxuICAgICAgLy8gQWNjZXNzIGxvZ2dpbmcgZm9yIHRyYWZmaWMgYW5hbHlzaXMgYW5kIGJvdCBkZXRlY3Rpb25cbiAgICAgIGxvZ0J1Y2tldDogYWNjZXNzTG9nc0J1Y2tldCxcbiAgICAgIGxvZ0ZpbGVQcmVmaXg6ICdjbG91ZGZyb250LycsXG4gICAgICBlbmFibGVMb2dnaW5nOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FjY2Vzc0xvZ3NCdWNrZXROYW1lJywge1xuICAgICAgdmFsdWU6IGFjY2Vzc0xvZ3NCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciBDbG91ZEZyb250IGFjY2VzcyBsb2dzJyxcbiAgICB9KTtcblxuICAgIC8vIExvb2sgdXAgQ2xvdWRGcm9udCBtYW5hZ2VkIHByZWZpeCBsaXN0XG4gICAgLy8gVGhpcyBjb250YWlucyBhbGwgQ2xvdWRGcm9udCBlZGdlIElQIHJhbmdlcyBhbmQgYXV0by11cGRhdGVzXG4gICAgY29uc3QgY2xvdWRGcm9udFByZWZpeExpc3QgPSBlYzIuUHJlZml4TGlzdC5mcm9tTG9va3VwKHRoaXMsICdDbG91ZEZyb250UHJlZml4TGlzdCcsIHtcbiAgICAgIHByZWZpeExpc3ROYW1lOiAnY29tLmFtYXpvbmF3cy5nbG9iYWwuY2xvdWRmcm9udC5vcmlnaW4tZmFjaW5nJyxcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBzZWN1cml0eSBncm91cCB0byBPTkxZIGFsbG93IENsb3VkRnJvbnQgdHJhZmZpYyAoZW5mb3JjZXMgZ2VvLXJlc3RyaWN0aW9uKVxuICAgIGNmblNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cEluZ3Jlc3MgPSBbXG4gICAgICAvLyBDbG91ZEZyb250IElQIHJhbmdlcyB2aWEgbWFuYWdlZCBwcmVmaXggbGlzdCAtIGJsb2NrcyBkaXJlY3QgQUxCIGFjY2Vzc1xuICAgICAge1xuICAgICAgICBpcFByb3RvY29sOiAndGNwJyxcbiAgICAgICAgZnJvbVBvcnQ6IDgwLFxuICAgICAgICB0b1BvcnQ6IDgwLFxuICAgICAgICBzb3VyY2VQcmVmaXhMaXN0SWQ6IGNsb3VkRnJvbnRQcmVmaXhMaXN0LnByZWZpeExpc3RJZCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBIVFRQIG9ubHkgZnJvbSBDbG91ZEZyb250IChnZW8tcmVzdHJpY3Rpb24gZW5mb3JjZWQpJyxcbiAgICAgIH0sXG4gICAgICAvLyBWUEMgaW50ZXJuYWwgLSByZXF1aXJlZCBmb3IgZ2VuZXJhdG9yIFdlYlNvY2tldCBjb25uZWN0aW9uc1xuICAgICAge1xuICAgICAgICBpcFByb3RvY29sOiAndGNwJyxcbiAgICAgICAgZnJvbVBvcnQ6IDgwLFxuICAgICAgICB0b1BvcnQ6IDgwLFxuICAgICAgICBjaWRySXA6ICcxMC4wLjAuMC8xNicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQWxsb3cgSFRUUCBmcm9tIFZQQyBpbnRlcm5hbCAoZm9yIGdlbmVyYXRvciBXZWJTb2NrZXQgY29ubmVjdGlvbnMpJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlwUHJvdG9jb2w6ICd0Y3AnLFxuICAgICAgICBmcm9tUG9ydDogODAsXG4gICAgICAgIHRvUG9ydDogODAsXG4gICAgICAgIHNvdXJjZVNlY3VyaXR5R3JvdXBJZDogYXBwR2VuZXJhdG9yU2VjdXJpdHlHcm91cC5zZWN1cml0eUdyb3VwSWQsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQWxsb3cgSFRUUCBmcm9tIGdlbmVyYXRvciB0YXNrcyBzZWN1cml0eSBncm91cCcsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICAvLyBPdXRwdXQgQ2xvdWRGcm9udCBVUkwgKHRoaXMgaXMgbm93IHRoZSBwcmltYXJ5IGFjY2VzcyBwb2ludClcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2xvdWRGcm9udFVSTCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkRnJvbnQgVVJMIChnZW8tcmVzdHJpY3RlZCB0byBVUywgTVgsIFBSKScsXG4gICAgICBleHBvcnROYW1lOiAnTGVvU2Fhc0Nsb3VkRnJvbnRVUkwnLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIEVDUyBvcmNoZXN0cmF0b3IgZW52aXJvbm1lbnQgdmFyaWFibGVzIHZpYSBDbG91ZEZvcm1hdGlvbiBwcm9wZXJ0eSBvdmVycmlkZVxuICAgIC8vIFRoZXNlIHZhcmlhYmxlcyByZWZlcmVuY2UgcmVzb3VyY2VzIGNyZWF0ZWQgbGF0ZXIgaW4gdGhlIHN0YWNrLCBzbyB3ZSBjYW4ndFxuICAgIC8vIGFkZCB0aGVtIGluIHRoZSBub3JtYWwgZW52aXJvbm1lbnQgYmxvY2suIFdlIHVzZSBhZGRQcm9wZXJ0eU92ZXJyaWRlIHRvIGFkZFxuICAgIC8vIHRoZW0gdG8gdGhlIGZpcnN0IGNvbnRhaW5lcidzIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbiAgICBjb25zdCBjZm5UYXNrRGVmID0gYXBwR2VuU2Fhc1Rhc2tEZWYubm9kZS5kZWZhdWx0Q2hpbGQgYXMgZWNzLkNmblRhc2tEZWZpbml0aW9uO1xuXG4gICAgLy8gR2V0IHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFycmF5IGxlbmd0aCB0byBhcHBlbmQgbmV3IHZhcnNcbiAgICAvLyBUaGVzZSBuYW1lcyBtdXN0IG1hdGNoIHdoYXQgRmFyZ2F0ZUNvbnRhaW5lck1hbmFnZXIgZXhwZWN0c1xuICAgIGNmblRhc2tEZWYuYWRkUHJvcGVydHlPdmVycmlkZSgnQ29udGFpbmVyRGVmaW5pdGlvbnMuMC5FbnZpcm9ubWVudC4xMicsIHtcbiAgICAgIE5hbWU6ICdFQ1NfU0VDVVJJVFlfR1JPVVAnLFxuICAgICAgVmFsdWU6IGFwcEdlbmVyYXRvclNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgIH0pO1xuICAgIGNmblRhc2tEZWYuYWRkUHJvcGVydHlPdmVycmlkZSgnQ29udGFpbmVyRGVmaW5pdGlvbnMuMC5FbnZpcm9ubWVudC4xMycsIHtcbiAgICAgIE5hbWU6ICdFQ1NfVEFTS19ERUZJTklUSU9OJyxcbiAgICAgIFZhbHVlOiBhcHBHZW5lcmF0b3JUYXNrRGVmLnRhc2tEZWZpbml0aW9uQXJuLFxuICAgIH0pO1xuICAgIC8vIFVzZSBDbG91ZE1hcCBpbnRlcm5hbCBETlMgZm9yIFdlYlNvY2tldCBjb25uZWN0aW9uIGZyb20gZ2VuZXJhdG9yIHRhc2tzXG4gICAgLy8gQUxCIHB1YmxpYyBETlMgZG9lc24ndCB3b3JrIGZyb20gaW5zaWRlIFZQQyAoaGFpcnBpbiBOQVQgaXNzdWUpXG4gICAgY2ZuVGFza0RlZi5hZGRQcm9wZXJ0eU92ZXJyaWRlKCdDb250YWluZXJEZWZpbml0aW9ucy4wLkVudmlyb25tZW50LjE0Jywge1xuICAgICAgTmFtZTogJ1dTSV9QVUJMSUNfVVJMJyxcbiAgICAgIFZhbHVlOiBgd3M6Ly9vcmNoZXN0cmF0b3IubGVvLXNhYXMubG9jYWw6NTAxMy93c2lgLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1N1cGFiYXNlVXJsU2VjcmV0QXJuJywge1xuICAgICAgdmFsdWU6IHN1cGFiYXNlVXJsU2VjcmV0LnNlY3JldEFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3VwYWJhc2UgVVJMIHNlY3JldCBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1NhYXMtU3VwYWJhc2VVcmxTZWNyZXRBcm4nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1N1cGFiYXNlQW5vbktleVNlY3JldEFybicsIHtcbiAgICAgIHZhbHVlOiBzdXBhYmFzZUFub25LZXlTZWNyZXQuc2VjcmV0QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdTdXBhYmFzZSBhbm9uIGtleSBzZWNyZXQgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TYWFzLVN1cGFiYXNlQW5vbktleVNlY3JldEFybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnU3VwYWJhc2VTZXJ2aWNlUm9sZUtleVNlY3JldEFybicsIHtcbiAgICAgIHZhbHVlOiBzdXBhYmFzZVNlcnZpY2VSb2xlS2V5U2VjcmV0LnNlY3JldEFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3VwYWJhc2Ugc2VydmljZSByb2xlIGtleSBzZWNyZXQgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TYWFzLVN1cGFiYXNlU2VydmljZVJvbGVLZXlTZWNyZXRBcm4nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FMQkRuc05hbWUnLCB7XG4gICAgICB2YWx1ZTogYWxiLmxvYWRCYWxhbmNlckRuc05hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXIgRE5TIE5hbWUnLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb1NhYXNBTEJEbnNOYW1lJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZW9UYXNrRGVmQXJuJywge1xuICAgICAgdmFsdWU6IGFwcEdlbmVyYXRvclRhc2tEZWYudGFza0RlZmluaXRpb25Bcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0xlbyBHZW5lcmF0b3IgVGFzayBEZWZpbml0aW9uIEFSTicsXG4gICAgICBleHBvcnROYW1lOiAnTGVvVGFza0RlZkFybicsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGVvU2VjdXJpdHlHcm91cElkJywge1xuICAgICAgdmFsdWU6IGFwcEdlbmVyYXRvclNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBHcm91cCBJRCBmb3IgbGVvIGdlbmVyYXRvciB0YXNrcycsXG4gICAgICBleHBvcnROYW1lOiAnTGVvU2VjdXJpdHlHcm91cElkJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZW9TdWJuZXRJZHMnLCB7XG4gICAgICB2YWx1ZTogdnBjLnB1YmxpY1N1Ym5ldHMubWFwKHMgPT4gcy5zdWJuZXRJZCkuam9pbignLCcpLFxuICAgICAgZGVzY3JpcHRpb246ICdTdWJuZXQgSURzIGZvciBsZW8gZ2VuZXJhdG9yIHRhc2tzJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TdWJuZXRJZHMnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xlb1NhYXNHZW5lcmF0ZWRBcHBzQnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiBhcHBCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciBnZW5lcmF0ZWQgYXBwcycsXG4gICAgICBleHBvcnROYW1lOiAnTGVvU2Fhc0dlbmVyYXRlZEFwcHNCdWNrZXROYW1lJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDbGF1ZGVUb2tlblNlY3JldEFybicsIHtcbiAgICAgIHZhbHVlOiBjbGF1ZGVUb2tlblNlY3JldC5zZWNyZXRBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0NsYXVkZSBPQXV0aCB0b2tlbiBzZWNyZXQgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdMZW9TYWFzLUNsYXVkZVRva2VuU2VjcmV0QXJuJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZW9TYWFzQXBwUmVwb3NpdG9yeVVyaScsIHtcbiAgICAgIHZhbHVlOiBhcHBHZW5TYWFzUmVwb3NpdG9yeS5yZXBvc2l0b3J5VXJpLFxuICAgICAgZGVzY3JpcHRpb246ICdFQ1IgVVJJIGZvciBMZW8gU2FhUyBBcHAgcmVwb3NpdG9yeScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGVvUmVwb3NpdG9yeVVyaScsIHtcbiAgICAgIHZhbHVlOiBhcHBHZW5lcmF0b3JSZXBvc2l0b3J5LnJlcG9zaXRvcnlVcmksXG4gICAgICBkZXNjcmlwdGlvbjogJ0VDUiBVUkkgZm9yIExlbyBHZW5lcmF0b3IgcmVwb3NpdG9yeScsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==