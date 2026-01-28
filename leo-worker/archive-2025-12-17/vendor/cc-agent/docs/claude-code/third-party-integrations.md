# Enterprise deployment overview

**Source:** https://docs.anthropic.com/en/docs/claude-code/third-party-integrations
**Retrieved:** 2025-07-04

---

This page provides an overview of available deployment options and helps you choose the right configuration for your organization.

## ​Provider comparison

| Feature | Anthropic | Amazon Bedrock | Google Vertex AI |
| --- | --- | --- | --- |
| Regions | Supportedcountries | Multiple AWSregions | Multiple GCPregions |
| Prompt caching | Enabled by default | Enabled by default | Contact Google for enablement |
| Authentication | API key | AWS credentials (IAM) | GCP credentials (OAuth/Service Account) |
| Cost tracking | Dashboard | AWS Cost Explorer | GCP Billing |
| Enterprise features | Teams, usage monitoring | IAM policies, CloudTrail | IAM roles, Cloud Audit Logs |

## ​Cloud providers

[Amazon BedrockUse Claude models through AWS infrastructure with IAM-based authentication and AWS-native monitoring](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock)[Google Vertex AIAccess Claude models via Google Cloud Platform with enterprise-grade security and compliance](https://docs.anthropic.com/en/docs/claude-code/google-vertex-ai)

## ​Corporate infrastructure

[Corporate ProxyConfigure Claude Code to work with your organization’s proxy servers and SSL/TLS requirements](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy)[LLM GatewayDeploy centralized model access with usage tracking, budgeting, and audit logging](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)

## ​Configuration overview

Claude Code supports flexible configuration options that allow you to combine different providers and infrastructure:

Understand the difference between:

- **Corporate proxy**: An HTTP/HTTPS proxy for routing traffic (set via`HTTPS_PROXY`or`HTTP_PROXY`)
- **LLM Gateway**: A service that handles authentication and provides provider-compatible endpoints (set via`ANTHROPIC_BASE_URL`,`ANTHROPIC_BEDROCK_BASE_URL`, or`ANTHROPIC_VERTEX_BASE_URL`)

Both configurations can be used in tandem.

### ​Using Bedrock with corporate proxy

Route Bedrock traffic through a corporate HTTP/HTTPS proxy:

```bash

# Enable Bedrock

export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Configure corporate proxy

export HTTPS_PROXY='https://proxy.example.com:8080'

```

### ​Using Bedrock with LLM Gateway

Use a gateway service that provides Bedrock-compatible endpoints:

```bash

# Enable Bedrock

export CLAUDE_CODE_USE_BEDROCK=1

# Configure LLM gateway

export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # If gateway handles AWS auth

```

### ​Using Vertex AI with corporate proxy

Route Vertex AI traffic through a corporate HTTP/HTTPS proxy:

```bash

# Enable Vertex

export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Configure corporate proxy

export HTTPS_PROXY='https://proxy.example.com:8080'

```

### ​Using Vertex AI with LLM Gateway

Combine Google Vertex AI models with an LLM gateway for centralized management:

```bash

# Enable Vertex

export CLAUDE_CODE_USE_VERTEX=1

# Configure LLM gateway

export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1  # If gateway handles GCP auth

```

### ​Authentication configuration

Claude Code uses the`ANTHROPIC_AUTH_TOKEN`for both`Authorization`and`Proxy-Authorization`headers when needed. The`SKIP_AUTH`flags (`CLAUDE_CODE_SKIP_BEDROCK_AUTH`,`CLAUDE_CODE_SKIP_VERTEX_AUTH`) are used in LLM gateway scenarios where the gateway handles provider authentication.

## ​Choosing the right deployment configuration

Consider these factors when selecting your deployment approach:

### ​Direct provider access

Best for organizations that:

- Want the simplest setup
- Have existing AWS or GCP infrastructure
- Need provider-native monitoring and compliance

### ​Corporate proxy

Best for organizations that:

- Have existing corporate proxy requirements
- Need traffic monitoring and compliance
- Must route all traffic through specific network paths

### ​LLM Gateway

Best for organizations that:

- Need usage tracking across teams
- Want to dynamically switch between models
- Require custom rate limiting or budgets
- Need centralized authentication management

## ​Debugging

When debugging your deployment:

- Use the`claude /status`[slash command](https://docs.anthropic.com/en/docs/claude-code/slash-commands). This command provides observability into any applied authentication, proxy, and URL settings.
- Set environment variable`export ANTHROPIC_LOG=debug`to log requests.

## ​Best practices for organizations

1. We strongly recommend investing in documentation so that Claude Code understands your codebase. Many organizations make a`CLAUDE.md`file (which we also refer to as memory) in the root of the repository that contains the system architecture, how to run tests and other common commands, and best practices for contributing to the codebase. This file is typically checked into source control so that all users can benefit from it.[Learn more](https://docs.anthropic.com/en/docs/claude-code/memory).
2. If you have a custom development environment, we find that creating a “one click” way to install Claude Code is key to growing adoption across an organization.
3. Encourage new users to try Claude Code for codebase Q&A, or on smaller bug fixes or feature requests. Ask Claude Code to make a plan. Check Claude’s suggestions and give feedback if it’s off-track. Over time, as users understand this new paradigm better, then they’ll be more effective at letting Claude Code run more agentically.
4. Security teams can configure managed permissions for what Claude Code is and is not allowed to do, which cannot be overwritten by local configuration.[Learn more](https://docs.anthropic.com/en/docs/claude-code/security).
5. MCP is a great way to give Claude Code more information, such as connecting to ticket management systems or error logs. We recommend that one central team configures MCP servers and checks a`.mcp.json`configuration into the codebase so that all users benefit.[Learn more](https://docs.anthropic.com/en/docs/claude-code/mcp).

At Anthropic, we trust Claude Code to power development across every Anthropic codebase. We hope you enjoy using Claude Code as much as we do!

## ​Next steps

- [Set up Amazon Bedrock](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock)for AWS-native deployment
- [Configure Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/google-vertex-ai)for GCP deployment
- [Implement Corporate Proxy](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy)for network requirements
- [Deploy LLM Gateway](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)for enterprise management
- [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)for configuration options and environment variables
[Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)[Amazon Bedrock](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock)On this page
- [Provider comparison](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#provider-comparison)
- [Cloud providers](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#cloud-providers)
- [Corporate infrastructure](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#corporate-infrastructure)
- [Configuration overview](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#configuration-overview)
- [Using Bedrock with corporate proxy](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#using-bedrock-with-corporate-proxy)
- [Using Bedrock with LLM Gateway](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#using-bedrock-with-llm-gateway)
- [Using Vertex AI with corporate proxy](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#using-vertex-ai-with-corporate-proxy)
- [Using Vertex AI with LLM Gateway](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#using-vertex-ai-with-llm-gateway)
- [Authentication configuration](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#authentication-configuration)
- [Choosing the right deployment configuration](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#choosing-the-right-deployment-configuration)
- [Direct provider access](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#direct-provider-access)
- [Corporate proxy](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#corporate-proxy)
- [LLM Gateway](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#llm-gateway)
- [Debugging](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#debugging)
- [Best practices for organizations](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#best-practices-for-organizations)
- [Next steps](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations#next-steps)