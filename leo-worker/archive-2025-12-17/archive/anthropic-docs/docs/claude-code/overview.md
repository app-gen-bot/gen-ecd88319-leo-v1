# Claude Code overview

**Source:** https://docs.anthropic.com/en/docs/claude-code/overview
**Retrieved:** 2025-07-04

---

By integrating directly with your development environment, Claude Code streamlines your workflow without requiring additional servers or complex setup.

## ​Basic usage

To install Claude Code, use NPM:

```bash
npm install -g @anthropic-ai/claude-code

```

For more detailed installation instructions, see[Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/setup).

To run Claude Code, simply call the`claude`CLI:

```bash
claude

```

You can then prompt Claude directly from the interactive Claude Code REPL session.

For more usage instructions, see[Quickstart](https://docs.anthropic.com/en/docs/claude-code/quickstart).

## ​Why Claude Code?

### ​Accelerate development

Use Claude Code to accelerate development with the following key capabilities:

- Editing files and fixing bugs across your codebase
- Answering questions about your code’s architecture and logic
- Executing and fixing tests, linting, and other commands
- Searching through git history, resolving merge conflicts, and creating commits and PRs
- Browsing documentation and resources from the internet using web search

Claude Code provides a comprehensive set of[tools](https://docs.anthropic.com/en/docs/claude-code/settings#tools-available-to-claude)for interacting with your development environment, including file operations, code search, web browsing, and more. Understanding these tools helps you leverage Claude Code’s full capabilities.

### ​Security and privacy by design

Your code’s security is paramount. Claude Code’s architecture ensures:

- **Direct API connection**: Your queries go straight to Anthropic’s API without intermediate servers
- **Works where you work**: Operates directly in your terminal
- **Understands context**: Maintains awareness of your entire project structure
- **Takes action**: Performs real operations like editing files and creating commits

### ​Enterprise integration

Claude Code seamlessly integrates with enterprise AI platforms. You can connect to[Amazon Bedrock or Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/third-party-integrations)for secure, compliant deployments that meet your organization’s requirements.

## ​Next steps

[SetupInstall and authenticate Claude Code](https://docs.anthropic.com/en/docs/claude-code/setup)[QuickstartSee Claude Code in action with practical examples](https://docs.anthropic.com/en/docs/claude-code/quickstart)[CommandsLearn about CLI commands and controls](https://docs.anthropic.com/en/docs/claude-code/cli-reference)[ConfigurationCustomize Claude Code for your workflow](https://docs.anthropic.com/en/docs/claude-code/settings)

## ​Additional resources

[Common workflowsStep-by-step guides for common workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)[TroubleshootingSolutions for common issues with Claude Code](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)[Bedrock & Vertex integrationsConfigure Claude Code with Amazon Bedrock or Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/bedrock-vertex-proxies)[Reference implementationClone our development container reference implementation.](https://github.com/anthropics/claude-code/tree/main/.devcontainer)[Set up](https://docs.anthropic.com/en/docs/claude-code/setup)On this page
- [Basic usage](https://docs.anthropic.com/en/docs/claude-code/overview#basic-usage)
- [Why Claude Code?](https://docs.anthropic.com/en/docs/claude-code/overview#why-claude-code%3F)
- [Accelerate development](https://docs.anthropic.com/en/docs/claude-code/overview#accelerate-development)
- [Security and privacy by design](https://docs.anthropic.com/en/docs/claude-code/overview#security-and-privacy-by-design)
- [Enterprise integration](https://docs.anthropic.com/en/docs/claude-code/overview#enterprise-integration)
- [Next steps](https://docs.anthropic.com/en/docs/claude-code/overview#next-steps)
- [Additional resources](https://docs.anthropic.com/en/docs/claude-code/overview#additional-resources)