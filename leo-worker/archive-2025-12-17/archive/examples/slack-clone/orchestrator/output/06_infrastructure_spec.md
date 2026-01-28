# Infrastructure Specification - Slack Clone v1.0

**Version**: 1.0  
**Generated**: 2025-06-30  
**Purpose**: Define AWS infrastructure requirements for CDK deployment

## Core Principle

### Infrastructure as Code (IaC) Only
- **No application code should create infrastructure**
- All AWS resources created via CDK
- Applications fail fast if infrastructure missing
- Clear separation between infrastructure and application layers

## Deployment Sequence

1. **CDK Deploy** - Creates all AWS resources
2. **Seed Data** - Populates initial data
3. **Application Deploy** - Starts backend services
4. **Health Check** - Verifies all components ready

## DynamoDB Tables

### Table Naming Convention
`slack-clone-{table-name}-{environment}`

Example: `slack-clone-users-development`

### 1. Users Table
```typescript
new Table(this, 'UsersTable', {
  tableName: `slack-clone-users-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// Global Secondary Index for email lookup
usersTable.addGlobalSecondaryIndex({
  indexName: 'EmailIndex',
  partitionKey: { name: 'email', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 2. Workspaces Table
```typescript
new Table(this, 'WorkspacesTable', {
  tableName: `slack-clone-workspaces-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for owner lookup
workspacesTable.addGlobalSecondaryIndex({
  indexName: 'OwnerIndex',
  partitionKey: { name: 'owner_id', type: AttributeType.STRING },
  sortKey: { name: 'PK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 3. Workspace Memberships Table
```typescript
new Table(this, 'WorkspaceMembershipsTable', {
  tableName: `slack-clone-workspace-memberships-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for user's workspaces
workspaceMembershipsTable.addGlobalSecondaryIndex({
  indexName: 'UserWorkspacesIndex',
  partitionKey: { name: 'user_id', type: AttributeType.STRING },
  sortKey: { name: 'workspace_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 4. Channels Table
```typescript
new Table(this, 'ChannelsTable', {
  tableName: `slack-clone-channels-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for channel ID lookup
channelsTable.addGlobalSecondaryIndex({
  indexName: 'ChannelIdIndex',
  partitionKey: { name: 'channel_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 5. Channel Memberships Table
```typescript
new Table(this, 'ChannelMembershipsTable', {
  tableName: `slack-clone-channel-memberships-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for user's channels
channelMembershipsTable.addGlobalSecondaryIndex({
  indexName: 'UserChannelsIndex',
  partitionKey: { name: 'user_id', type: AttributeType.STRING },
  sortKey: { name: 'channel_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 6. Messages Table
```typescript
new Table(this, 'MessagesTable', {
  tableName: `slack-clone-messages-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  stream: StreamViewType.NEW_AND_OLD_IMAGES, // For real-time updates
});

// GSI for user's messages
messagesTable.addGlobalSecondaryIndex({
  indexName: 'UserMessagesIndex',
  partitionKey: { name: 'user_id', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});

// GSI for thread replies
messagesTable.addGlobalSecondaryIndex({
  indexName: 'ThreadIndex',
  partitionKey: { name: 'parent_message_id', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 7. Conversations Table
```typescript
new Table(this, 'ConversationsTable', {
  tableName: `slack-clone-conversations-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for workspace conversations
conversationsTable.addGlobalSecondaryIndex({
  indexName: 'WorkspaceConversationsIndex',
  partitionKey: { name: 'workspace_id', type: AttributeType.STRING },
  sortKey: { name: 'conversation_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 8. Conversation Participants Table
```typescript
new Table(this, 'ConversationParticipantsTable', {
  tableName: `slack-clone-conversation-participants-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for user's conversations
conversationParticipantsTable.addGlobalSecondaryIndex({
  indexName: 'UserConversationsIndex',
  partitionKey: { name: 'user_id', type: AttributeType.STRING },
  sortKey: { name: 'conversation_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 9. Notifications Table
```typescript
new Table(this, 'NotificationsTable', {
  tableName: `slack-clone-notifications-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'expires_at', // Auto-delete after 30 days
});

// GSI for unread notifications
notificationsTable.addGlobalSecondaryIndex({
  indexName: 'UnreadIndex',
  partitionKey: { name: 'user_id_unread', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 10. Files Table
```typescript
new Table(this, 'FilesTable', {
  tableName: `slack-clone-files-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

// GSI for user's files
filesTable.addGlobalSecondaryIndex({
  indexName: 'UserFilesIndex',
  partitionKey: { name: 'user_id', type: AttributeType.STRING },
  sortKey: { name: 'timestamp', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 11. Presence Table
```typescript
new Table(this, 'PresenceTable', {
  tableName: `slack-clone-presence-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'expires_at', // Auto-expire after 30 minutes
});

// GSI for online users
presenceTable.addGlobalSecondaryIndex({
  indexName: 'OnlineUsersIndex',
  partitionKey: { name: 'status', type: AttributeType.STRING },
  sortKey: { name: 'user_id', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});
```

### 12. Reactions Table
```typescript
new Table(this, 'ReactionsTable', {
  tableName: `slack-clone-reactions-${props.environment}`,
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});
```

## S3 Buckets

### File Storage Bucket
```typescript
new Bucket(this, 'FilesBucket', {
  bucketName: `slack-clone-files-${props.environment}-${props.accountId}`,
  versioned: true,
  lifecycleRules: [{
    expiration: Duration.days(365),
    noncurrentVersionExpiration: Duration.days(30),
  }],
  cors: [{
    allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
    allowedOrigins: [props.frontendUrl],
    allowedHeaders: ['*'],
    maxAge: 3000,
  }],
});
```

### Thumbnails Bucket
```typescript
new Bucket(this, 'ThumbnailsBucket', {
  bucketName: `slack-clone-thumbnails-${props.environment}-${props.accountId}`,
  lifecycleRules: [{
    expiration: Duration.days(90),
  }],
});
```

## Redis Cluster

```typescript
new CfnCacheCluster(this, 'RedisCluster', {
  cacheNodeType: 'cache.t3.micro',
  engine: 'redis',
  numCacheNodes: 1,
  clusterName: `slack-clone-redis-${props.environment}`,
  vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
  cacheSubnetGroupName: cacheSubnetGroup.ref,
});
```

## Lambda Functions

### Thumbnail Generator
```typescript
new Function(this, 'ThumbnailGenerator', {
  functionName: `slack-clone-thumbnail-${props.environment}`,
  runtime: Runtime.PYTHON_3_12,
  handler: 'thumbnail.handler',
  code: Code.fromAsset('lambda/thumbnail'),
  environment: {
    THUMBNAILS_BUCKET: thumbnailsBucket.bucketName,
  },
  timeout: Duration.seconds(30),
  memorySize: 512,
});

// Trigger on S3 uploads
filesBucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new LambdaDestination(thumbnailGenerator),
  { prefix: 'uploads/', suffix: '.jpg' }
);
```

## API Gateway

```typescript
new RestApi(this, 'SlackCloneApi', {
  restApiName: `slack-clone-api-${props.environment}`,
  deployOptions: {
    stageName: props.environment,
    tracingEnabled: true,
    dataTraceEnabled: true,
    loggingLevel: MethodLoggingLevel.INFO,
    metricsEnabled: true,
  },
  defaultCorsPreflightOptions: {
    allowOrigins: [props.frontendUrl],
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: ['Content-Type', 'Authorization'],
  },
});
```

## CloudFront Distribution

```typescript
new Distribution(this, 'CDN', {
  defaultBehavior: {
    origin: new S3Origin(filesBucket),
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
    allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
  },
  domainNames: props.customDomain ? [props.customDomain] : undefined,
  certificate: props.certificate,
});
```

## Security Groups

### Backend Security Group
```typescript
new SecurityGroup(this, 'BackendSecurityGroup', {
  vpc,
  description: 'Security group for Slack Clone backend',
  allowAllOutbound: true,
});

backendSecurityGroup.addIngressRule(
  Peer.ipv4(props.vpcCidr),
  Port.tcp(8000),
  'Allow HTTP from VPC'
);
```

### Redis Security Group
```typescript
new SecurityGroup(this, 'RedisSecurityGroup', {
  vpc,
  description: 'Security group for Redis cluster',
  allowAllOutbound: false,
});

redisSecurityGroup.addIngressRule(
  backendSecurityGroup,
  Port.tcp(6379),
  'Allow Redis from backend'
);
```

## Environment Configuration

### Development
- Minimal capacity settings
- Local DynamoDB endpoint support
- Relaxed security for testing

### Staging
- Production-like configuration
- Full monitoring enabled
- Automated backups

### Production
- Multi-AZ deployment
- Auto-scaling enabled
- Enhanced monitoring
- Daily backups
- CloudWatch alarms

## Deployment Commands

```bash
# Install CDK
npm install -g aws-cdk

# Bootstrap environment (first time only)
cdk bootstrap aws://ACCOUNT_ID/REGION

# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy SlackCloneDynamoDBStack

# Destroy infrastructure (WARNING: deletes all data)
cdk destroy --all
```

## Cost Optimization

1. **DynamoDB**: Use on-demand billing for variable workloads
2. **S3**: Lifecycle policies to archive/delete old files
3. **Lambda**: Right-size memory allocation
4. **CloudFront**: Cache static assets aggressively
5. **Redis**: Use smallest instance type for development

## Monitoring & Alarms

### CloudWatch Dashboards
- API request rates and errors
- DynamoDB consumed capacity
- Lambda invocation metrics
- S3 storage usage
- Redis memory utilization

### Alarms
- API 5xx errors > 1% 
- DynamoDB throttling
- Lambda errors > 1%
- Redis memory > 80%

## Backup Strategy

### DynamoDB
- Point-in-time recovery enabled
- Daily automated backups
- 35-day retention

### S3
- Versioning enabled
- Cross-region replication for production
- MFA delete protection

## Compliance & Security

1. **Encryption**
   - DynamoDB: Encryption at rest (AWS managed keys)
   - S3: SSE-S3 encryption
   - Redis: Encryption in transit

2. **Access Control**
   - IAM roles with least privilege
   - S3 bucket policies restrict access
   - VPC endpoints for AWS services

3. **Audit**
   - CloudTrail logging enabled
   - S3 access logging
   - API Gateway access logs

## Disaster Recovery

### RTO: 4 hours
### RPO: 1 hour

1. **Multi-region setup** (production only)
2. **Automated backups** to separate region
3. **Infrastructure as Code** enables quick rebuilds
4. **Runbook** for disaster scenarios

## Notes for AI Code Generation

1. **Never create infrastructure from application code**
2. **Always check infrastructure exists before using**
3. **Use environment variables for all AWS resource names**
4. **Fail fast with clear errors if resources missing**
5. **No hardcoded ARNs or resource IDs**
6. **Assume CDK manages all infrastructure lifecycle**