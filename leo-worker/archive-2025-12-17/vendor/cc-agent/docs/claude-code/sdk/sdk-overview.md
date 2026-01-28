# Overview

**Source:** https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview
**Retrieved:** 2025-08-30

---

## ​Why use the Claude Code SDK?

Built on top of the agent harness that powers Claude Code, the Claude Code SDK provides all the building blocks you need to build production-ready agents:

- **Optimized Claude integration**: Automatic prompt caching and performance optimizations
- **Rich tool ecosystem**: File operations, code execution, web search, and MCP extensibility
- **Advanced permissions**: Fine-grained control over agent capabilities
- **Production essentials**: Built-in error handling, session management, and monitoring

## ​What can you build with the SDK?

Here are some example agent types you can create:

**Coding agents:**

- SRE agents that diagnose and fix production issues
- Security review bots that audit code for vulnerabilities
- Oncall engineering assistants that triage incidents
- Code review agents that enforce style and best practices

**Business agents:**

- Legal assistants that review contracts and compliance
- Finance advisors that analyze reports and forecasts
- Customer support agents that resolve technical issues
- Content creation assistants for marketing teams

## ​SDK Options

The Claude Code SDK is available in multiple forms to suit different use cases:

- **Headless Mode**- For CLI scripts and automation
- **TypeScript SDK**- For Node.js and web applications
- **Python SDK**- For Python applications and data science

## ​Core Concepts

### ​Authentication

For basic authentication, retrieve an Anthropic API key from the[Anthropic Console](https://console.anthropic.com/)and set the`ANTHROPIC_API_KEY`environment variable.

The SDK also supports authentication via third-party API providers:

- **Amazon Bedrock**: Set`CLAUDE_CODE_USE_BEDROCK=1`environment variable and configure AWS credentials
- **Google Vertex AI**: Set`CLAUDE_CODE_USE_VERTEX=1`environment variable and configure Google Cloud credentials

For detailed configuration instructions for third-party providers, see the[Amazon Bedrock](https://docs.anthropic.com/en/docs/claude-code/amazon-bedrock)and[Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/google-vertex-ai)documentation.

### ​System Prompts

System prompts define your agent’s role, expertise, and behavior. This is where you specify what kind of agent you’re building.

### ​Tool Permissions

Control which tools your agent can use with fine-grained permissions:

- `allowedTools`- Explicitly allow specific tools
- `disallowedTools`- Block specific tools
- `permissionMode`- Set overall permission strategy

### ​Model Context Protocol (MCP)

Extend your agents with custom tools and integrations through MCP servers. This allows you to connect to databases, APIs, and other external services.

## ​Common Use Cases

### ​Automated Testing and CI/CD

Create agents that run tests, analyze results, and fix issues automatically in your CI/CD pipeline.

### ​Code Review and Security Audits

Build agents that review pull requests for security vulnerabilities, code quality, and compliance.

### ​Incident Response

Deploy SRE agents that diagnose production issues, analyze logs, and suggest fixes.

### ​Documentation Generation

Create agents that generate and maintain documentation based on your codebase.

### ​Data Analysis

Build agents that analyze data, generate reports, and create visualizations.

## ​Best Practices

- **Use JSON output format**for programmatic parsing of responses
- **Handle errors gracefully**- check exit codes and implement retry logic
- **Use session management**for maintaining context in multi-turn conversations
- **Implement timeouts**for long-running operations
- **Respect rate limits**when making multiple requests
- **Test thoroughly**before deploying to production

## ​Related Resources

- [CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)- Complete CLI documentation
- [GitHub Actions Integration](https://docs.anthropic.com/en/docs/claude-code/github-actions)- Automate your GitHub workflow
- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)- Extend Claude with custom tools
- [Common Workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)- Step-by-step guides
- [Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)- Common issues and solutions
[Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)[Headless mode](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-headless)On this page
- [Why use the Claude Code SDK?](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#why-use-the-claude-code-sdk%3F)
- [What can you build with the SDK?](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#what-can-you-build-with-the-sdk%3F)
- [SDK Options](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#sdk-options)
- [Core Concepts](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#core-concepts)
- [Authentication](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#authentication)
- [System Prompts](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#system-prompts)
- [Tool Permissions](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#tool-permissions)
- [Model Context Protocol (MCP)](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#model-context-protocol-mcp)
- [Common Use Cases](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#common-use-cases)
- [Automated Testing and CI/CD](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#automated-testing-and-ci%2Fcd)
- [Code Review and Security Audits](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#code-review-and-security-audits)
- [Incident Response](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#incident-response)
- [Documentation Generation](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#documentation-generation)
- [Data Analysis](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#data-analysis)
- [Best Practices](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#best-practices)
- [Related Resources](https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-overview#related-resources)