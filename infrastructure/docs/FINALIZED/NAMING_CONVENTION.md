# Leo V2 Infrastructure Naming Convention

This document defines the naming convention for all AWS infrastructure resources to avoid collisions with the V1 deployment.

## Two-Root Naming Pattern

### `leo` - Generator/Agent (shortest possible)
The AI agent that generates applications. All resources use the shortest possible names.

### `leo-saas` - SaaS Platform
The web application that orchestrates generation jobs. Uses `-saas` suffix, `-app` when disambiguation needed.

## Complete Resource Mapping

### Stack & CDK Files
| Component | V1 Name | V2 Name |
|-----------|---------|---------|
| Stack ID (CloudFormation) | `AppGenSaasStack` | `LeoSaasStack` |
| Stack Class (TypeScript) | `FargatePocStack` | `LeoSaasStack` |
| CDK App File | `bin/fargate-poc.ts` | `bin/leo-saas.ts` |
| Stack File | `lib/fargate-poc-stack.ts` | `lib/leo-saas-stack.ts` |

### AWS Secrets Manager
**Prefix:** `leo-saas/*` ✅ (Already correct! No changes needed)

All secrets:
- `leo-saas/supabase-url` ✅
- `leo-saas/supabase-anon-key` ✅
- `leo-saas/supabase-service-role-key` ✅
- `leo-saas/database-url` ✅
- `leo-saas/claude-oauth-token` ✅
- `leo-saas/github-bot-token` ✅
- `leo-saas/fly-api-token` ✅

### ECR Repositories
| V1 Name | V2 Name | Purpose |
|---------|---------|---------|
| `app-gen-saas-app` | `leo-saas-app` | SaaS platform (orchestrator) |
| `app-gen-saas-generator` | `leo` | Generator agent |

### ECS Resources
| Component | V1 Name | V2 Name |
|-----------|---------|---------|
| Cluster | `app-gen-saas-cluster` | `leo-saas-cluster` |
| Service | `AppGenSaasService` | `LeoSaasService` |
| App Container | `app-gen-saas-app` | `leo-saas-app` |
| Generator Container | `app-generator` | `leo` |

### S3 Buckets
| V1 Name | V2 Name |
|---------|---------|
| `app-gen-saas-generated-apps-{account}` | `leo-saas-generated-apps-{account}` |

### CloudWatch Log Groups
| V1 Name | V2 Name |
|---------|---------|
| `/aws/ecs/app-gen-saas-app` | `/aws/ecs/leo-saas-app` |
| `/aws/ecs/app-generator` | `/aws/ecs/leo` |

### CDK Construct IDs (TypeScript)
| V1 Name | V2 Name |
|---------|---------|
| `AppGenSaasVPC` | `LeoSaasVPC` |
| `AppGenSaasCluster` | `LeoSaasCluster` |
| `AppGenSaasRepository` | `LeoSaasAppRepository` |
| `AppGeneratorRepository` | `LeoRepository` |
| `GeneratedAppsBucket` | `LeoSaasGeneratedAppsBucket` |
| `AppGenSaasTaskRole` | `LeoSaasAppTaskRole` |
| `AppGeneratorTaskRole` | `LeoTaskRole` |
| `AppGenSaasTaskDef` | `LeoSaasAppTaskDef` |
| `AppGeneratorTaskDef` | `LeoTaskDef` |
| `AppGenSaasService` | `LeoSaasService` |
| `AppGenSaasSG` | `LeoSaasAppSG` |
| `AppGeneratorSG` | `LeoSG` |
| `AppGenSaasALB` | `LeoSaasALB` |
| `ALBSG` | `LeoSaasALBSG` |
| `OrchestratorTargetGroup` | `LeoSaasTargetGroup` |
| `HTTPSListener` | `HTTPSListener` (keep) |
| `HTTPListener` | `HTTPListener` (keep) |
| `SupabaseUrl` | `SupabaseUrl` (keep) |
| `SupabaseAnonKey` | `SupabaseAnonKey` (keep) |
| `SupabaseServiceRoleKey` | `SupabaseServiceRoleKey` (keep) |
| `DatabaseUrl` | `DatabaseUrl` (keep) |
| `GithubBotToken` | `GithubBotToken` (keep) |
| `FlyApiToken` | `FlyApiToken` (keep) |
| `ClaudeOAuthToken` | `ClaudeOAuthToken` (keep) |
| `TaskExecutionRole` | `TaskExecutionRole` (keep) |

### CloudFormation Output Names
| V1 Name | V2 Name |
|---------|---------|
| `URL` | `URL` (keep) |
| `ALBDnsName` | `ALBDnsName` (keep) |
| `AppGeneratorTaskDefArn` | `LeoTaskDefArn` |
| `TaskSecurityGroupId` | `LeoSecurityGroupId` |
| `TaskSubnetIds` | `LeoSubnetIds` |
| `S3BucketName` | `LeoSaasGeneratedAppsBucketName` |
| `ClaudeTokenSecretArn` | `ClaudeTokenSecretArn` (keep) |
| `AppGenSaasRepositoryUri` | `LeoSaasAppRepositoryUri` |
| `AppGeneratorRepositoryUri` | `LeoRepositoryUri` |
| `SupabaseUrlSecretArn` | `SupabaseUrlSecretArn` (keep) |
| `SupabaseAnonKeySecretArn` | `SupabaseAnonKeySecretArn` (keep) |
| `SupabaseServiceRoleKeySecretArn` | `SupabaseServiceRoleKeySecretArn` (keep) |

### CloudFormation Export Names
| V1 Name | V2 Name |
|---------|---------|
| `AppGenSaasALBDnsName` | `LeoSaasALBDnsName` |
| `AppGeneratorTaskDefArn` | `LeoTaskDefArn` |
| `AppGeneratorSecurityGroupId` | `LeoSecurityGroupId` |
| `AppGeneratorSubnetIds` | `LeoSubnetIds` |
| `GeneratedAppsBucketName` | `LeoSaasGeneratedAppsBucketName` |
| `SupabaseUrlSecretArn` | `SupabaseUrlSecretArn` (keep) |
| `SupabaseAnonKeySecretArn` | `SupabaseAnonKeySecretArn` (keep) |
| `SupabaseServiceRoleKeySecretArn` | `SupabaseServiceRoleKeySecretArn` (keep) |

### Tags
| V1 Value | V2 Value |
|----------|----------|
| `Project: AppGenSaaS` | `Project: LeoSaas` |
| `Environment: Production` | `Environment: Production` (keep) |
| `ManagedBy: CDK` | `ManagedBy: CDK` (keep) |

## Naming Rules

1. **Generator resources**: Use `Leo` prefix (shortest possible)
   - Examples: `LeoTaskRole`, `LeoTaskDef`, `LeoSG`
   - Physical resources: `leo` (ECR, container, logs)

2. **SaaS platform resources**: Use `LeoSaas` prefix with `-app` disambiguator when needed
   - Examples: `LeoSaasAppTaskRole`, `LeoSaasCluster`, `LeoSaasVPC`
   - Physical resources: `leo-saas-app`, `leo-saas-cluster`

3. **Shared/generic resources**: Keep original names or use minimal prefixes
   - Examples: `TaskExecutionRole`, `HTTPListener`

4. **Case conventions**:
   - CDK Construct IDs: PascalCase (`LeoSaasStack`)
   - Physical AWS resources: kebab-case (`leo-saas-app`)
   - CloudFormation exports: PascalCase (`LeoTaskDefArn`)

## Benefits

✅ **No collisions** with V1 infrastructure
✅ **Secrets already aligned** - using `leo-saas/*` prefix
✅ **Clean two-root pattern** - `leo` vs `leo-saas`
✅ **Simple and memorable** - shortest possible names
✅ **Future-proof** - matches planned code rename
✅ **V1 and V2 can coexist** - for testing and migration

## Migration Notes

- AWS Secrets Manager already uses correct `leo-saas/*` prefix (no changes needed)
- All other resources will be renamed during CDK infrastructure update
- V1 stack (`AppGenSaasStack`) and V2 stack (`LeoSaasStack`) can run side-by-side
- No impact on existing V1 deployment
