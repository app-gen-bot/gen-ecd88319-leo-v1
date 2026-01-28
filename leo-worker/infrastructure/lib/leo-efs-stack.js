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
exports.LeoEfsStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const efs = __importStar(require("aws-cdk-lib/aws-efs"));
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
class LeoEfsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Security group for EFS mount targets
        // Only allows NFS traffic (port 2049) from generator tasks
        this.securityGroup = new ec2.SecurityGroup(this, 'LeoEfsSG', {
            vpc: props.vpc,
            description: 'Security group for Leo EFS mount targets',
            allowAllOutbound: true,
        });
        // Allow NFS traffic from generator tasks
        this.securityGroup.addIngressRule(props.generatorSecurityGroup, ec2.Port.tcp(2049), 'Allow NFS from Leo generator tasks');
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
exports.LeoEfsStack = LeoEfsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVvLWVmcy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxlby1lZnMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBQ25DLHlEQUEyQztBQUMzQyx5REFBMkM7QUFzQjNDOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFrQnhDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBdUI7UUFDL0QsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsdUNBQXVDO1FBQ3ZDLDJEQUEyRDtRQUMzRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzNELEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSwwQ0FBMEM7WUFDdkQsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFFSCx5Q0FBeUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQy9CLEtBQUssQ0FBQyxzQkFBc0IsRUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ2xCLG9DQUFvQyxDQUNyQyxDQUFDO1FBRUYsd0NBQXdDO1FBQ3hDLDhDQUE4QztRQUM5QywrREFBK0Q7UUFDL0QsMkNBQTJDO1FBQzNDLHFFQUFxRTtRQUNyRSxzQkFBc0I7UUFDdEIsOEJBQThCO1FBQzlCLDBEQUEwRDtRQUMxRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDNUQsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO1lBQ2QsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlLENBQUMsYUFBYTtZQUNsRCxlQUFlLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlO1lBQ3BELGNBQWMsRUFBRSxHQUFHLENBQUMsY0FBYyxDQUFDLE9BQU87WUFDMUMsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCO1lBQ3pELHNCQUFzQixFQUFFLElBQUk7WUFDNUIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGNBQWMsRUFBRSxtQkFBbUI7U0FDcEMsQ0FBQyxDQUFDO1FBRUgsbUNBQW1DO1FBQ25DLHFFQUFxRTtRQUNyRSwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRTtZQUN0RSxJQUFJLEVBQUUsT0FBTztZQUNiLFNBQVMsRUFBRTtnQkFDVCxRQUFRLEVBQUUsTUFBTTtnQkFDaEIsUUFBUSxFQUFFLE1BQU07Z0JBQ2hCLFdBQVcsRUFBRSxLQUFLO2FBQ25CO1lBQ0QsU0FBUyxFQUFFO2dCQUNULEdBQUcsRUFBRSxNQUFNO2dCQUNYLEdBQUcsRUFBRSxNQUFNO2FBQ1o7U0FDRixDQUFDLENBQUM7UUFFSCw0RUFBNEU7UUFDNUUsVUFBVTtRQUNWLDRFQUE0RTtRQUM1RSwrREFBK0Q7UUFFL0QsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUN6QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZO1lBQ25DLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsVUFBVSxFQUFFLG9CQUFvQjtTQUNqQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQzFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWE7WUFDckMsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxVQUFVLEVBQUUscUJBQXFCO1NBQ2xDLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUMsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZTtZQUN6QyxXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLFVBQVUsRUFBRSx1QkFBdUI7U0FDcEMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL0ZELGtDQStGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBlZnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVmcyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuLyoqXG4gKiBQcm9wcyBmb3IgdGhlIExlbyBFRlMgU3RhY2suXG4gKlxuICogUmVxdWlyZXMgVlBDIGFuZCBzZWN1cml0eSBncm91cCBmcm9tIHRoZSBtYWluIExlb1NhYXNTdGFjayB0byBlbmFibGVcbiAqIGdlbmVyYXRvciB0YXNrcyB0byBtb3VudCB0aGUgRUZTIHZvbHVtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMZW9FZnNTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAvKipcbiAgICogVlBDIHdoZXJlIEVGUyBtb3VudCB0YXJnZXRzIHdpbGwgYmUgY3JlYXRlZC5cbiAgICovXG4gIHZwYzogZWMyLklWcGM7XG5cbiAgLyoqXG4gICAqIFNlY3VyaXR5IGdyb3VwIG9mIHRoZSBnZW5lcmF0b3IgdGFza3MgdGhhdCB3aWxsIG1vdW50IEVGUy5cbiAgICogVGhlIEVGUyBzZWN1cml0eSBncm91cCB3aWxsIGFsbG93IE5GUyB0cmFmZmljIChwb3J0IDIwNDkpIGZyb20gdGhpcyBncm91cC5cbiAgICovXG4gIGdlbmVyYXRvclNlY3VyaXR5R3JvdXA6IGVjMi5JU2VjdXJpdHlHcm91cDtcbn1cblxuLyoqXG4gKiBMZW8gRUZTIFN0YWNrIC0gUGVyc2lzdGVudCBzdG9yYWdlIGZvciBMZW8gR2VuZXJhdG9yIGNvbnRhaW5lcnMuXG4gKlxuICogQ3JlYXRlcyBhbiBFRlMgZmlsZSBzeXN0ZW0gdGhhdCBnZW5lcmF0b3IgY29udGFpbmVycyBjYW4gbW91bnQgdG8gcGVyc2lzdDpcbiAqIC0gQXBwIHNvdXJjZSBjb2RlIGFuZCBub2RlX21vZHVsZXMgKGluc3RhbnQgcmVzdW1lKVxuICogLSBDbGF1ZGUgc2Vzc2lvbiBmaWxlcyAoY29udmVyc2F0aW9uIGNvbnRleHQpXG4gKlxuICogVGhpcyBzdGFjayBpcyBzZXBhcmF0ZSBmcm9tIExlb1NhYXNTdGFjayB0byBhbGxvdzpcbiAqIC0gSW5kZXBlbmRlbnQgZGVwbG95bWVudCAoRUZTIHBlcnNpc3RzIGFjcm9zcyBtYWluIHN0YWNrIHVwZGF0ZXMpXG4gKiAtIFNhZmUgcm9sbGJhY2sgKGNhbiBkZWxldGUgRUZTIHN0YWNrIHdpdGhvdXQgYWZmZWN0aW5nIG1haW4gc3RhY2spXG4gKiAtIFJFVEFJTiBwb2xpY3kgcHJvdGVjdHMgZGF0YSBldmVuIGlmIHN0YWNrIGlzIGRlbGV0ZWRcbiAqXG4gKiBEaXJlY3Rvcnkgc3RydWN0dXJlIG9uIEVGUzpcbiAqIC9hcHBzL3thcHBfaWR9L1xuICog4pSc4pSA4pSAIHdvcmtzcGFjZS9hcHAvICAgIOKGkiBzb3VyY2UgY29kZSArIG5vZGVfbW9kdWxlcyArIC5naXRcbiAqIOKUlOKUgOKUgCAuY2xhdWRlLyAgICAgICAgICDihpIgQ2xhdWRlIHNlc3Npb24gZmlsZXNcbiAqL1xuZXhwb3J0IGNsYXNzIExlb0Vmc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgLyoqXG4gICAqIFRoZSBFRlMgRmlsZVN5c3RlbSByZXNvdXJjZS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBmaWxlU3lzdGVtOiBlZnMuRmlsZVN5c3RlbTtcblxuICAvKipcbiAgICogQWNjZXNzIHBvaW50IGZvciB0aGUgL2FwcHMgZGlyZWN0b3J5LlxuICAgKiBQcm92aWRlcyBQT1NJWCB1c2VyIG1hcHBpbmcgKHVpZC9naWQgMTAwMCkgZm9yIGNvbnRhaW5lciBhY2Nlc3MuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgYWNjZXNzUG9pbnQ6IGVmcy5BY2Nlc3NQb2ludDtcblxuICAvKipcbiAgICogU2VjdXJpdHkgZ3JvdXAgZm9yIEVGUyBtb3VudCB0YXJnZXRzLlxuICAgKiBBbGxvd3MgTkZTIHRyYWZmaWMgZnJvbSBnZW5lcmF0b3IgdGFza3MuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgc2VjdXJpdHlHcm91cDogZWMyLlNlY3VyaXR5R3JvdXA7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IExlb0Vmc1N0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIFNlY3VyaXR5IGdyb3VwIGZvciBFRlMgbW91bnQgdGFyZ2V0c1xuICAgIC8vIE9ubHkgYWxsb3dzIE5GUyB0cmFmZmljIChwb3J0IDIwNDkpIGZyb20gZ2VuZXJhdG9yIHRhc2tzXG4gICAgdGhpcy5zZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMZW9FZnNTRycsIHtcbiAgICAgIHZwYzogcHJvcHMudnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBncm91cCBmb3IgTGVvIEVGUyBtb3VudCB0YXJnZXRzJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBBbGxvdyBORlMgdHJhZmZpYyBmcm9tIGdlbmVyYXRvciB0YXNrc1xuICAgIHRoaXMuc2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShcbiAgICAgIHByb3BzLmdlbmVyYXRvclNlY3VyaXR5R3JvdXAsXG4gICAgICBlYzIuUG9ydC50Y3AoMjA0OSksXG4gICAgICAnQWxsb3cgTkZTIGZyb20gTGVvIGdlbmVyYXRvciB0YXNrcydcbiAgICApO1xuXG4gICAgLy8gRUZTIEZpbGVTeXN0ZW0gZm9yIHBlcnNpc3RlbnQgc3RvcmFnZVxuICAgIC8vIENvbmZpZ3VyYXRpb24gb3B0aW1pemVkIGZvciBMZW8ncyB1c2UgY2FzZTpcbiAgICAvLyAtIEdlbmVyYWwgcHVycG9zZSBtb2RlIChsb3cgbGF0ZW5jeSBmb3IgbnBtL25vZGUgb3BlcmF0aW9ucylcbiAgICAvLyAtIEVsYXN0aWMgdGhyb3VnaHB1dCAoc2NhbGVzIHdpdGggdXNhZ2UpXG4gICAgLy8gLSAzMC1kYXkgbGlmZWN5Y2xlIHBvbGljeSAobW92ZSBpbmZyZXF1ZW50bHkgYWNjZXNzZWQgZmlsZXMgdG8gSUEpXG4gICAgLy8gLSBFbmNyeXB0ZWQgYXQgcmVzdFxuICAgIC8vIC0gQXV0b21hdGljIGJhY2t1cHMgZW5hYmxlZFxuICAgIC8vIC0gUkVUQUlOIHBvbGljeSAocHJvdGVjdCBkYXRhIGV2ZW4gaWYgc3RhY2sgaXMgZGVsZXRlZClcbiAgICB0aGlzLmZpbGVTeXN0ZW0gPSBuZXcgZWZzLkZpbGVTeXN0ZW0odGhpcywgJ0xlb0dlbmVyYXRvckVmcycsIHtcbiAgICAgIHZwYzogcHJvcHMudnBjLFxuICAgICAgbGlmZWN5Y2xlUG9saWN5OiBlZnMuTGlmZWN5Y2xlUG9saWN5LkFGVEVSXzMwX0RBWVMsXG4gICAgICBwZXJmb3JtYW5jZU1vZGU6IGVmcy5QZXJmb3JtYW5jZU1vZGUuR0VORVJBTF9QVVJQT1NFLFxuICAgICAgdGhyb3VnaHB1dE1vZGU6IGVmcy5UaHJvdWdocHV0TW9kZS5FTEFTVElDLFxuICAgICAgZW5jcnlwdGVkOiB0cnVlLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLCAvLyBQcm90ZWN0IGRhdGEhXG4gICAgICBlbmFibGVBdXRvbWF0aWNCYWNrdXBzOiB0cnVlLFxuICAgICAgc2VjdXJpdHlHcm91cDogdGhpcy5zZWN1cml0eUdyb3VwLFxuICAgICAgZmlsZVN5c3RlbU5hbWU6ICdsZW8tZ2VuZXJhdG9yLWVmcycsXG4gICAgfSk7XG5cbiAgICAvLyBBY2Nlc3MgcG9pbnQgZm9yIC9hcHBzIGRpcmVjdG9yeVxuICAgIC8vIENyZWF0ZXMgdGhlIC9hcHBzIGRpcmVjdG9yeSB3aXRoIHByb3BlciBwZXJtaXNzaW9ucyBmb3IgY29udGFpbmVyc1xuICAgIC8vIFBPU0lYIHVzZXIgKHVpZC9naWQgMTAwMCkgbWF0Y2hlcyB0eXBpY2FsIGNvbnRhaW5lciB1c2VyXG4gICAgdGhpcy5hY2Nlc3NQb2ludCA9IHRoaXMuZmlsZVN5c3RlbS5hZGRBY2Nlc3NQb2ludCgnTGVvQXBwc0FjY2Vzc1BvaW50Jywge1xuICAgICAgcGF0aDogJy9hcHBzJyxcbiAgICAgIGNyZWF0ZUFjbDoge1xuICAgICAgICBvd25lckdpZDogJzEwMDAnLFxuICAgICAgICBvd25lclVpZDogJzEwMDAnLFxuICAgICAgICBwZXJtaXNzaW9uczogJzc1NScsXG4gICAgICB9LFxuICAgICAgcG9zaXhVc2VyOiB7XG4gICAgICAgIGdpZDogJzEwMDAnLFxuICAgICAgICB1aWQ6ICcxMDAwJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gT3V0cHV0c1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUaGVzZSBhcmUgZXhwb3J0ZWQgZm9yIHVzZSBieSBMZW9TYWFzU3RhY2sgd2hlbiBlbmFibGluZyBFRlNcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdFZnNGaWxlU3lzdGVtSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5maWxlU3lzdGVtLmZpbGVTeXN0ZW1JZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRUZTIEZpbGVTeXN0ZW0gSUQgZm9yIExlbyBHZW5lcmF0b3InLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb0Vmc0ZpbGVTeXN0ZW1JZCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnRWZzQWNjZXNzUG9pbnRJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFjY2Vzc1BvaW50LmFjY2Vzc1BvaW50SWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VGUyBBY2Nlc3MgUG9pbnQgSUQgZm9yIExlbyBHZW5lcmF0b3InLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb0Vmc0FjY2Vzc1BvaW50SWQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0Vmc1NlY3VyaXR5R3JvdXBJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnNlY3VyaXR5R3JvdXAuc2VjdXJpdHlHcm91cElkLFxuICAgICAgZGVzY3JpcHRpb246ICdFRlMgU2VjdXJpdHkgR3JvdXAgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogJ0xlb0Vmc1NlY3VyaXR5R3JvdXBJZCcsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==