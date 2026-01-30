import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export declare class LeoSaasStack extends cdk.Stack {
    /**
     * The VPC where all Leo resources are deployed.
     * Exported for use by LeoEfsStack.
     */
    readonly vpc: ec2.Vpc;
    /**
     * Security group for Leo generator tasks.
     * Exported for use by LeoEfsStack (to allow NFS traffic).
     */
    readonly generatorSecurityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
}
