# Claude Code Python SDK API Reference

**Generated from source code**
**Retrieved:** 2025-07-04

---

## Module: types

### Class: McpStdioServerConfig

MCP stdio server configuration.

### Class: McpSSEServerConfig

MCP SSE server configuration.

### Class: McpHttpServerConfig

MCP HTTP server configuration.

### Class: class

Text content block.

### Class: class

Tool use content block.

### Class: class

Tool result content block.

### Class: class

User message.

### Class: class

Assistant message with content blocks.

### Class: class

System message with metadata.

### Class: class

Result message with cost and usage information.

### Class: class

Query options for Claude SDK.

## Module: client

### Class: InternalClient

Internal client implementation.

### Function: process_query(
        self, prompt: str, options: ClaudeCodeOptions
    )

Process a query through transport.

## Module: subprocess_cli

### Class: SubprocessCLITransport

Subprocess transport using Claude Code CLI.

### Function: connect(self)

Start subprocess.

### Function: disconnect(self)

Terminate subprocess.

### Function: send_request(self, messages: list[Any], options: dict[str, Any])

Not used for CLI transport - args passed via command line.

### Function: receive_messages(self)

Receive messages from CLI.

### Function: is_connected(self)

Check if subprocess is running.

