#!/usr/bin/env node
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
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const leo_saas_stack_1 = require("../lib/leo-saas-stack");
const leo_efs_stack_1 = require("../lib/leo-efs-stack");
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
const saasStack = new leo_saas_stack_1.LeoSaasStack(app, 'LeoSaasStack', {
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
const efsStack = new leo_efs_stack_1.LeoEfsStack(app, 'LeoEfsStack', {
    env,
    description: 'EFS persistent storage for Leo Generator containers - enables instant resume',
    vpc: saasStack.vpc,
    generatorSecurityGroup: saasStack.generatorSecurityGroup,
    tags,
});
// EFS stack depends on main stack (needs VPC and security group)
efsStack.addDependency(saasStack);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVvLXNhYXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsZW8tc2Fhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLDBEQUFxRDtBQUNyRCx3REFBbUQ7QUFFbkQsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsbUNBQW1DO0FBQ25DLE1BQU0sR0FBRyxHQUFHO0lBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO0lBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLFdBQVc7Q0FDdEQsQ0FBQztBQUVGLGNBQWM7QUFDZCxNQUFNLElBQUksR0FBRztJQUNYLFdBQVcsRUFBRSxZQUFZO0lBQ3pCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFNBQVMsRUFBRSxLQUFLO0NBQ2pCLENBQUM7QUFFRixnRkFBZ0Y7QUFDaEYsaUNBQWlDO0FBQ2pDLGdGQUFnRjtBQUNoRiw0REFBNEQ7QUFDNUQsK0RBQStEO0FBQy9ELE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQVksQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO0lBQ3RELEdBQUc7SUFDSCxXQUFXLEVBQUUsMEVBQTBFO0lBQ3ZGLElBQUk7Q0FDTCxDQUFDLENBQUM7QUFFSCxnRkFBZ0Y7QUFDaEYsNENBQTRDO0FBQzVDLGdGQUFnRjtBQUNoRixzRUFBc0U7QUFDdEUsc0RBQXNEO0FBQ3RELEVBQUU7QUFDRix1QkFBdUI7QUFDdkIsOERBQThEO0FBQzlELGlEQUFpRDtBQUNqRCw4REFBOEQ7QUFDOUQsaUNBQWlDO0FBQ2pDLDRGQUE0RjtBQUM1Rix3R0FBd0c7QUFDeEcsNkZBQTZGO0FBQzdGLHVHQUF1RztBQUN2RyxNQUFNLFFBQVEsR0FBRyxJQUFJLDJCQUFXLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRTtJQUNuRCxHQUFHO0lBQ0gsV0FBVyxFQUFFLDhFQUE4RTtJQUMzRixHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUc7SUFDbEIsc0JBQXNCLEVBQUUsU0FBUyxDQUFDLHNCQUFzQjtJQUN4RCxJQUFJO0NBQ0wsQ0FBQyxDQUFDO0FBRUgsaUVBQWlFO0FBQ2pFLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IExlb1NhYXNTdGFjayB9IGZyb20gJy4uL2xpYi9sZW8tc2Fhcy1zdGFjayc7XG5pbXBvcnQgeyBMZW9FZnNTdGFjayB9IGZyb20gJy4uL2xpYi9sZW8tZWZzLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuLy8gQ29tbW9uIGVudmlyb25tZW50IGNvbmZpZ3VyYXRpb25cbmNvbnN0IGVudiA9IHtcbiAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgcmVnaW9uOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9SRUdJT04gfHwgJ3VzLWVhc3QtMScsXG59O1xuXG4vLyBDb21tb24gdGFnc1xuY29uc3QgdGFncyA9IHtcbiAgRW52aXJvbm1lbnQ6ICdQcm9kdWN0aW9uJyxcbiAgUHJvamVjdDogJ0xlb1NhYXMnLFxuICBNYW5hZ2VkQnk6ICdDREsnLFxufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIE1haW4gU3RhY2sgLSBMZW8gU2FhUyBQbGF0Zm9ybVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIENyZWF0ZXMgVlBDLCBFQ1MgY2x1c3Rlciwgc2VydmljZXMsIEFMQiwgQ2xvdWRGcm9udCwgZXRjLlxuLy8gRXhwb3J0cyBWUEMgYW5kIGdlbmVyYXRvclNlY3VyaXR5R3JvdXAgZm9yIHVzZSBieSBFRlMgc3RhY2suXG5jb25zdCBzYWFzU3RhY2sgPSBuZXcgTGVvU2Fhc1N0YWNrKGFwcCwgJ0xlb1NhYXNTdGFjaycsIHtcbiAgZW52LFxuICBkZXNjcmlwdGlvbjogJ0xlbyBTYWFTIHBsYXRmb3JtIGRlcGxveW1lbnQgb24gQVdTIEZhcmdhdGUgd2l0aCBTdXBhYmFzZSBhdXRoZW50aWNhdGlvbicsXG4gIHRhZ3MsXG59KTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEVGUyBTdGFjayAtIFBlcnNpc3RlbnQgU3RvcmFnZSAoT3B0aW9uYWwpXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ3JlYXRlcyBFRlMgZmlsZSBzeXN0ZW0gZm9yIGdlbmVyYXRvciBjb250YWluZXIgcGVyc2lzdGVudCBzdG9yYWdlLlxuLy8gRGVwZW5kcyBvbiBMZW9TYWFzU3RhY2sgZm9yIFZQQyBhbmQgc2VjdXJpdHkgZ3JvdXAuXG4vL1xuLy8gRGVwbG95bWVudCB3b3JrZmxvdzpcbi8vIDEuIERlcGxveSBMZW9TYWFzU3RhY2sgZmlyc3QgKGNyZWF0ZXMgVlBDLCBzZWN1cml0eSBncm91cHMpXG4vLyAyLiBEZXBsb3kgTGVvRWZzU3RhY2sgKGNyZWF0ZXMgRUZTIGluIHRoZSBWUEMpXG4vLyAzLiBSZS1kZXBsb3kgTGVvU2Fhc1N0YWNrIHdpdGggRUZTIGNvbnRleHQgdG8gZW5hYmxlIG1vdW50OlxuLy8gICAgICBjZGsgZGVwbG95IExlb1NhYXNTdGFjayBcXFxuLy8gICAgICAgIC1jIGVmc0ZpbGVTeXN0ZW1JZD0kKGF3cyBjbG91ZGZvcm1hdGlvbiBkZXNjcmliZS1zdGFja3MgLS1zdGFjay1uYW1lIExlb0Vmc1N0YWNrIFxcXG4vLyAgICAgICAgICAgLS1xdWVyeSAnU3RhY2tzWzBdLk91dHB1dHNbP0V4cG9ydE5hbWU9PWBMZW9FZnNGaWxlU3lzdGVtSWRgXS5PdXRwdXRWYWx1ZScgLS1vdXRwdXQgdGV4dCkgXFxcbi8vICAgICAgICAtYyBlZnNBY2Nlc3NQb2ludElkPSQoYXdzIGNsb3VkZm9ybWF0aW9uIGRlc2NyaWJlLXN0YWNrcyAtLXN0YWNrLW5hbWUgTGVvRWZzU3RhY2sgXFxcbi8vICAgICAgICAgICAtLXF1ZXJ5ICdTdGFja3NbMF0uT3V0cHV0c1s/RXhwb3J0TmFtZT09YExlb0Vmc0FjY2Vzc1BvaW50SWRgXS5PdXRwdXRWYWx1ZScgLS1vdXRwdXQgdGV4dClcbmNvbnN0IGVmc1N0YWNrID0gbmV3IExlb0Vmc1N0YWNrKGFwcCwgJ0xlb0Vmc1N0YWNrJywge1xuICBlbnYsXG4gIGRlc2NyaXB0aW9uOiAnRUZTIHBlcnNpc3RlbnQgc3RvcmFnZSBmb3IgTGVvIEdlbmVyYXRvciBjb250YWluZXJzIC0gZW5hYmxlcyBpbnN0YW50IHJlc3VtZScsXG4gIHZwYzogc2Fhc1N0YWNrLnZwYyxcbiAgZ2VuZXJhdG9yU2VjdXJpdHlHcm91cDogc2Fhc1N0YWNrLmdlbmVyYXRvclNlY3VyaXR5R3JvdXAsXG4gIHRhZ3MsXG59KTtcblxuLy8gRUZTIHN0YWNrIGRlcGVuZHMgb24gbWFpbiBzdGFjayAobmVlZHMgVlBDIGFuZCBzZWN1cml0eSBncm91cClcbmVmc1N0YWNrLmFkZERlcGVuZGVuY3koc2Fhc1N0YWNrKTtcblxuYXBwLnN5bnRoKCk7XG4iXX0=