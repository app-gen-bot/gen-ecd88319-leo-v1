# AWS MCP SERVERS: DEPLOYMENT GUIDE

**Date**: October 20, 2025

## Overview

AWS has released Model Context Protocol (MCP) servers that enable natural language infrastructure management and deployment on AWS. These tools can significantly streamline deployment workflows, automate infrastructure provisioning, and apply security best practices automatically.

MCP is an open standard developed by Anthropic that creates a universal language for AI systems to communicate with external data sources, tools, and services. AWS MCP Servers use this protocol to provide AI applications with access to AWS documentation, contextual guidance, and best practices.

---

## Available AWS MCP Servers

### 1. AWS Cloud Control API MCP Server ⭐ MOST RELEVANT

**Purpose**: Natural language infrastructure management for AWS resources

**Key Capabilities**:
- Create, read, update, delete, and list (CRUDL) operations via natural language
- Supports **1,200+ AWS and third-party resources** through a single standardized API
- Generates Infrastructure as Code (IaC) templates (CloudFormation/CDK) for CI/CD pipelines
- Automated security scanning using Checkov to detect misconfigurations
- Direct translation of developer intent into cloud infrastructure

**Use Cases for This Project**:
- Deploy ECS Fargate services via natural language commands
- Create ALB, ACM certificates, and networking resources
- Troubleshoot existing deployments
- Generate CDK templates from descriptions
- Reduce configuration overhead and learning curve

**Benefits**:
- Significantly reduces time from concept to deployment
- Applies AWS security best practices automatically
- Enables infrastructure management without deep AWS expertise
- Integrates with existing CI/CD pipelines via IaC output

**Resources**:
- GitHub: https://github.com/awslabs/mcp
- Blog: https://aws.amazon.com/blogs/devops/introducing-aws-cloud-control-api-mcp-server-natural-language-infrastructure-management-on-aws/

---

### 2. Amazon ECS MCP Server

**Purpose**: Specialized server for container deployments

**Key Capabilities**:
- Containerize applications
- Deploy to Amazon ECS
- Troubleshoot ECS deployments
- Manage ECS resources

**Documentation**: https://awslabs.github.io/mcp/servers/ecs-mcp-server

---

### 3. Other AWS MCP Servers

**Available Servers**:
- **AWS Lambda**: Serverless function management
- **Amazon MSK**: Kafka cluster management via natural language
- **AWS Price List**: Real-time access to AWS pricing data
- **AWS API**: Interact with any AWS API through natural language

---

## Deployment Architecture Options

AWS MCP servers can be deployed using three main patterns:

### 1. AWS Lambda (Serverless)
- **Best for**: Intermittent use, cost optimization
- **Cost**: Pay per invocation
- **Setup**: Package MCP server as Lambda function using FastMCP with HTTP transport
- **Limitations**: Cold starts, 15-minute timeout

### 2. Lambda with Web Adapter
- **Best for**: Bridging HTTP and MCP protocols
- **Cost**: Similar to Lambda
- **Setup**: Use AWS Lambda Web Adapter
- **Limitations**: Same as Lambda

### 3. AWS Fargate/ECS (Containerized)
- **Best for**: Persistent sessions, streaming, production workloads
- **Cost**: ~$194.18/month (US East, moderate traffic)
- **Setup**: Fully containerized deployment on ECS
- **Benefits**: Health checks, auto-scaling, multi-AZ deployment

**Recommended for This Project**: Fargate/ECS for production deployments

---

## Official AWS Deployment Guidance

AWS provides official guidance for deploying MCP servers securely on AWS Cloud:

**Architecture Components**:
- **Amazon ECS**: Services across multiple Availability Zones with health checks
- **Application Load Balancer (ALB)**: Routes traffic only to healthy targets
- **Amazon Cognito**: OAuth 2.0 authentication with authorization code grant flow
- **AWS WAF**: Protection against common exploits and DDoS attacks
- **AWS CDK**: Infrastructure as Code for consistent, repeatable deployments

**Specifications**:
- Implements MCP specification version: 2025-06-18
- Uses OAuth 2.0 Protected Resource Metadata (RFC9728)
- Service-Linked Role for workload identity (since October 7, 2025)

**Official Guidance**: https://aws.amazon.com/solutions/guidance/deploying-model-context-protocol-servers-on-aws/

---

## Integration with Amazon Bedrock

**Amazon Bedrock AgentCore Runtime** allows deployment and execution of MCP servers directly in the AgentCore Runtime:

- Create, test, and deploy MCP servers
- OAuth authentication for secure machine-to-machine communication
- Service-Linked Role for workload identity permissions

**Use Case**: Scale MCP servers for enterprise AI workloads

---

## Installation & Setup

### Prerequisites

```bash
# Install AWS CDK
npm install -g aws-cdk@latest

# Ensure AWS CLI is configured
aws configure
```

### Install AWS MCP Servers

```bash
# Clone the official AWS MCP repository
git clone https://github.com/awslabs/mcp.git
cd mcp

# Install dependencies
npm install

# Bootstrap your AWS environment (first time only)
cdk bootstrap

# Deploy the CDK stack
cdk deploy
```

### For ECS Fargate Deployments

```bash
# Install dependencies
npm install

# Login to public ECR registry
aws ecr-public get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin public.ecr.aws

# Deploy the CDK Stack
cdk deploy
```

---

## Integration with Claude Code

MCP servers integrate natively with Claude Code and other MCP clients:

**Supported Clients**:
- Claude Code CLI
- Claude Desktop
- Q Developer
- Cline
- Cursor
- Windsurf

**How It Works**:
1. Host applications (Claude Code) maintain 1:1 connections with MCP servers
2. MCP clients communicate using the Model Context Protocol standard
3. Natural language commands are translated to AWS API calls
4. Results are returned in human-readable format

**Setup**: MCP servers auto-connect to Claude Code when available and properly configured.

---

## How This Helps Your Deployment Issues

### Current Project Architecture
Per `docs/ai/aws/IMPLEMENTATION.md`, this project uses:
- **ECS Fargate** (compute)
- **Application Load Balancer** (ALB)
- **AWS Certificate Manager** (ACM)
- **AWS CDK** (infrastructure as code)

### Benefits of AWS MCP Servers

1. **Automated Deployment Steps**
   - Replace manual CDK/CLI commands with natural language
   - "Deploy the app to ECS Fargate with ALB and SSL certificate"
   - MCP server generates and executes the CDK code

2. **Troubleshooting Assistance**
   - "Why is my ECS service failing health checks?"
   - "Show me the logs for my failed container"
   - Real-time diagnostics via natural language

3. **Security Best Practices**
   - Automatically applies AWS security configurations
   - Scans infrastructure for misconfigurations (Checkov)
   - Implements OAuth 2.0 authentication

4. **IaC Generation**
   - Generate CDK templates from natural language descriptions
   - Integrate with existing CI/CD pipelines
   - Version control infrastructure definitions

5. **Reduced Learning Curve**
   - Team members don't need deep AWS expertise
   - Natural language replaces complex AWS documentation
   - Faster onboarding and productivity

---

## Sample Repositories & Examples

### Official AWS Samples
- **AWS Samples - ECS MCP Server**: https://github.com/aws-samples/sample-ecs-mcp-server
  - Demonstrates Agentic AI architecture using AWS Fargate for Amazon ECS
  - Features AI Service connecting to multiple MCP servers

- **Fargate Deployment Implementation**: https://github.com/dgallitelli/mcp-server-with-fargate
  - Complete guide for running MCP Server on AWS Fargate

- **Nova Act MCP Server**: https://github.com/awsdataarchitect/nova-act-mcp
  - Production-ready MCP server on ECS Fargate

### Community Examples
- **TypeScript Fargate ECS Starter**: Available on Glama MCP marketplace
- **Strands SDK with MCP**: Scaling AI agents using Lambda and Fargate

---

## Cost Considerations

### MCP Server Deployment Costs (US East Region)

**AWS Fargate/ECS Deployment**:
- **Monthly Cost**: ~$194.18 (moderate traffic)
- **Includes**: Multi-AZ deployment, ALB, health checks, auto-scaling

**AWS Lambda Deployment**:
- **Monthly Cost**: Pay per invocation (typically lower for intermittent use)
- **Free Tier**: 1M requests/month free

**Cost Optimization Tips**:
- Use Lambda for development/testing environments
- Use Fargate for production workloads requiring high availability
- Implement auto-scaling policies to match demand

---

## Recent Announcements (2025)

### Q4 2025 Updates

**October 1, 2025**: AWS API MCP Server v1.0.0 release
- Enables foundation models to interact with ANY AWS API via natural language
- Supports all AWS services through unified interface

**October 7, 2025**: Service-Linked Role for workload identity
- Amazon Bedrock AgentCore uses SLR for OAuth authentication
- Improved security posture for MCP server deployments

**August 2025**: AWS Cloud Control API MCP Server announcement
- Natural language infrastructure management
- Support for 1,200+ AWS resources

**May 2025**: New MCP Servers for Serverless and Containers
- Lambda, ECS, EKS, and Finch support
- Enhanced container deployment capabilities

**July 2025**: Amazon MSK and Price List MCP Servers
- Kafka cluster management via MCP
- Real-time AWS pricing data access

---

## Next Steps

### Recommended Actions

1. **Install AWS Cloud Control API MCP Server**
   ```bash
   git clone https://github.com/awslabs/mcp.git
   cd mcp
   npm install
   ```

2. **Review Current Deployment Setup**
   - Analyze existing ECS Fargate configuration
   - Identify pain points in current deployment process
   - Determine which resources can be managed via MCP

3. **Generate CDK Infrastructure Code**
   - Use MCP server to generate CDK templates from natural language
   - Validate generated code against project requirements
   - Integrate with CI/CD pipeline

4. **Test Natural Language Deployment**
   - Deploy test application using MCP server commands
   - Compare deployment time vs manual process
   - Document successful patterns for team use

5. **Configure Claude Code Integration**
   - Ensure MCP servers are accessible to Claude Code
   - Test natural language infrastructure commands
   - Create documentation for team usage

---

## Additional Resources

### Official Documentation
- **AWS MCP Servers Homepage**: https://awslabs.github.io/mcp/
- **Model Context Protocol Specification**: https://modelcontextprotocol.io/
- **AWS DevOps Blog - MCP Server**: https://aws.amazon.com/blogs/devops/introducing-aws-cloud-control-api-mcp-server-natural-language-infrastructure-management-on-aws/

### GitHub Repositories
- **AWS MCP Servers**: https://github.com/awslabs/mcp
- **Deployment Guidance**: https://github.com/aws-solutions-library-samples/guidance-for-deploying-model-context-protocol-servers-on-aws

### Community Resources
- **MCP Market**: https://mcpmarket.com/ (discover MCP servers)
- **Glama AI**: https://glama.ai/mcp/servers (MCP server directory)

---

## Support & Feedback

For issues or questions:
- **AWS MCP Servers**: Open issues on https://github.com/awslabs/mcp
- **AWS Support**: Contact through AWS Support Center
- **Community**: AWS re:Post forums

---

**Document Status**: Active
**Last Updated**: October 20, 2025
**Maintained By**: AI App Factory Team
