# Publicly Available MCP Servers

## Overview

The Model Context Protocol (MCP) is an open-source standard for connecting AI assistants to systems where data lives. It acts like a universal adapter, allowing AI models to interact with various data sources, tools, and APIs beyond just text.

## MCP Server Directories

### Official Resources
- **[GitHub - modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)** - Official MCP servers repository
- **[MCP Examples](https://modelcontextprotocol.io/examples)** - Official example servers and implementations

### Community Directories
- **[MCP Directory](https://mcpserverdirectory.org/)** - Comprehensive MCP server index
- **[MCP Server Finder](https://www.mcpserverfinder.com/)** - Directory for discovering and comparing MCP servers
- **[Awesome MCP Servers](https://mcpservers.org/)** - Curated collection with search features
- **[awesome-mcp-servers (GitHub)](https://github.com/wong2/awesome-mcp-servers)** - Community-curated list

## Notable MCP Servers

### Chrome DevTools MCP Server

**Official Chrome DevTools MCP Server**
- **Repository**: [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- **Purpose**: Enables AI coding assistants to control and inspect live Chrome browsers with full DevTools access
- **Key Features**:
  - Performance insights via Chrome DevTools traces
  - Advanced browser debugging (network analysis, screenshots, console access)
  - Reliable automation using Puppeteer
- **Installation**:
  - Claude Code: `claude mcp add chrome-devtools npx chrome-devtools-mcp@latest`
  - VS Code: `code --add-mcp '{"name":"chrome-devtools","command":"npx","args":["chrome-devtools-mcp@latest"]}'`
- **Resources**:
  - [Chrome for Developers Blog](https://developer.chrome.com/blog/chrome-devtools-mcp)
  - [Alternative implementation by benjaminr](https://github.com/benjaminr/chrome-devtools-mcp)

### Figma MCP Server

**Official Figma Dev Mode MCP Server**
- **Purpose**: Enables AI assistants to generate code from Figma designs with full design context
- **Modes**: 
  - Local MCP server (runs through Figma desktop app)
  - Remote MCP server (connects to https://mcp.figma.com/mcp)
- **Setup**:
  1. Update Figma desktop app to latest version
  2. Enable via Preferences → Enable local MCP server
  3. For Claude Code: Connect to existing server at `http://127.0.0.1:3845/sse`
- **Resources**:
  - [Figma Help Center Guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server)
  - [Figma Blog Announcement](https://www.figma.com/blog/introducing-figmas-dev-mode-mcp-server/)

**Community Figma MCP Implementations**:
- [arinspunk/claude-talk-to-figma-mcp](https://github.com/arinspunk/claude-talk-to-figma-mcp)
- [TimHolden/figma-mcp-server](https://github.com/TimHolden/figma-mcp-server)
- [MatthewDailey/figma-mcp](https://github.com/MatthewDailey/figma-mcp)
- [GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)

### Official Reference Servers

- **Everything** - Reference/test server for MCP development
- **Fetch** - Web content fetching capabilities
- **Filesystem** - Secure file operations
- **Git** - Repository manipulation
- **Memory** - Knowledge graph system
- **Sequential Thinking** - Dynamic problem-solving

### Enterprise Integrations

- **GitHub** - Official MCP server for GitHub integration
- **GitLab** - Official server with OAuth 2.0 support
- **Google Drive** - Access and manage Google Drive files
- **Slack** - Integrate with Slack workspaces
- **Postgres** - PostgreSQL database operations
- **Puppeteer** - Browser automation and web scraping
- **Microsoft Teams** - AI Library with MCP support
- **Buildable** - AI-powered development tools

### Popular Community Servers

#### Development Tools
- Database connectors (PostgreSQL, MySQL, MongoDB)
- IDE integrations
- Code analysis tools
- Testing frameworks

#### Data & APIs
- Cryptocurrency and financial data
- Weather services
- News aggregators
- Social media integrations

#### Productivity
- Note-taking applications
- Task management
- Calendar integrations
- Document processing

## Using MCP Servers

### Installation Methods
- **TypeScript servers**: Use directly with `npx`
- **Python servers**: Install with `uvx` or `pip`

### Claude Code Integration
Claude Code can connect to MCP servers through configuration. Add servers to your Claude Code settings to enable access to external tools, databases, and APIs.

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Anthropic's MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [Claude Code MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)
- [Model Context Protocol GitHub Organization](https://github.com/modelcontextprotocol)

---

*This document provides a curated list of publicly available MCP servers. For the most up-to-date information, refer to the official directories and repositories listed above.*