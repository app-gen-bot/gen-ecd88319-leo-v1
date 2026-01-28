# Development containers

**Source:** https://docs.anthropic.com/en/docs/claude-code/devcontainer
**Retrieved:** 2025-07-04

---

The preconfigured[devcontainer setup](https://code.visualstudio.com/docs/devcontainers/containers)works seamlessly with VS Code’s Remote - Containers extension and similar tools.

The container’s enhanced security measures (isolation and firewall rules) allow you to run`claude --dangerously-skip-permissions`to bypass permission prompts for unattended operation. We’ve included a[reference implementation](https://github.com/anthropics/claude-code/tree/main/.devcontainer)that you can customize for your needs.

While the devcontainer provides substantial protections, no system is
completely immune to all attacks. Always maintain good security practices and
monitor Claude’s activities.

## ​Key features

- **Production-ready Node.js**: Built on Node.js 20 with essential development dependencies
- **Security by design**: Custom firewall restricting network access to only necessary services
- **Developer-friendly tools**: Includes git, ZSH with productivity enhancements, fzf, and more
- **Seamless VS Code integration**: Pre-configured extensions and optimized settings
- **Session persistence**: Preserves command history and configurations between container restarts
- **Works everywhere**: Compatible with macOS, Windows, and Linux development environments

## ​Getting started in 4 steps

1. Install VS Code and the Remote - Containers extension
2. Clone the[Claude Code reference implementation](https://github.com/anthropics/claude-code/tree/main/.devcontainer)repository
3. Open the repository in VS Code
4. When prompted, click “Reopen in Container” (or use Command Palette: Cmd+Shift+P → “Remote-Containers: Reopen in Container”)

## ​Configuration breakdown

The devcontainer setup consists of three primary components:

- [devcontainer.json](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json): Controls container settings, extensions, and volume mounts
- [Dockerfile](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile): Defines the container image and installed tools
- [init-firewall.sh](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh): Establishes network security rules

## ​Security features

The container implements a multi-layered security approach with its firewall configuration:

- **Precise access control**: Restricts outbound connections to whitelisted domains only (npm registry, GitHub, Anthropic API, etc.)
- **Default-deny policy**: Blocks all other external network access
- **Startup verification**: Validates firewall rules when the container initializes
- **Isolation**: Creates a secure development environment separated from your main system

## ​Customization options

The devcontainer configuration is designed to be adaptable to your needs:

- Add or remove VS Code extensions based on your workflow
- Modify resource allocations for different hardware environments
- Adjust network access permissions
- Customize shell configurations and developer tooling

## ​Example use cases

### ​Secure client work

Use devcontainers to isolate different client projects, ensuring code and credentials never mix between environments.

### ​Team onboarding

New team members can get a fully configured development environment in minutes, with all necessary tools and settings pre-installed.

### ​Consistent CI/CD environments

Mirror your devcontainer configuration in CI/CD pipelines to ensure development and production environments match.

## ​Related resources

- [VS Code devcontainers documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Claude Code security best practices](https://docs.anthropic.com/en/docs/claude-code/security)
- [Corporate proxy configuration](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy)
[LLM gateway](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)[Identity and Access Management](https://docs.anthropic.com/en/docs/claude-code/iam)On this page
- [Key features](https://docs.anthropic.com/en/docs/claude-code/devcontainer#key-features)
- [Getting started in 4 steps](https://docs.anthropic.com/en/docs/claude-code/devcontainer#getting-started-in-4-steps)
- [Configuration breakdown](https://docs.anthropic.com/en/docs/claude-code/devcontainer#configuration-breakdown)
- [Security features](https://docs.anthropic.com/en/docs/claude-code/devcontainer#security-features)
- [Customization options](https://docs.anthropic.com/en/docs/claude-code/devcontainer#customization-options)
- [Example use cases](https://docs.anthropic.com/en/docs/claude-code/devcontainer#example-use-cases)
- [Secure client work](https://docs.anthropic.com/en/docs/claude-code/devcontainer#secure-client-work)
- [Team onboarding](https://docs.anthropic.com/en/docs/claude-code/devcontainer#team-onboarding)
- [Consistent CI/CD environments](https://docs.anthropic.com/en/docs/claude-code/devcontainer#consistent-ci%2Fcd-environments)
- [Related resources](https://docs.anthropic.com/en/docs/claude-code/devcontainer#related-resources)