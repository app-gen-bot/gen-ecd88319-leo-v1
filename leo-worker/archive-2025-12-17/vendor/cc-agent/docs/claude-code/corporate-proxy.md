# Corporate proxy configuration

**Source:** https://docs.anthropic.com/en/docs/claude-code/corporate-proxy
**Retrieved:** 2025-07-04

---

Claude Code supports standard HTTP/HTTPS proxy configurations through environment variables. This allows you to route all Claude Code traffic through your organization’s proxy servers for security, compliance, and monitoring purposes.

## ​Basic proxy configuration

### ​Environment variables

Claude Code respects standard proxy environment variables:

```bash

# HTTPS proxy (recommended)

export HTTPS_PROXY=https://proxy.example.com:8080

# HTTP proxy (if HTTPS not available)

export HTTP_PROXY=http://proxy.example.com:8080

```

Claude Code currently does not support the`NO_PROXY`environment variable. All traffic will be routed through the configured proxy.

Claude Code does not support SOCKS proxies.

## ​Authentication

### ​Basic authentication

If your proxy requires basic authentication, include credentials in the proxy URL:

```bash
export HTTPS_PROXY=http://username:password@proxy.example.com:8080

```

Avoid hardcoding passwords in scripts. Use environment variables or secure credential storage instead.

For proxies requiring advanced authentication (NTLM, Kerberos, etc.), consider using an LLM Gateway service that supports your authentication method.

### ​SSL certificate issues

If your proxy uses custom SSL certificates, you may encounter certificate errors.

Ensure that you set the correct certificate bundle path:

```bash
export SSL_CERT_FILE=/path/to/certificate-bundle.crt
export NODE_EXTRA_CA_CERTS=/path/to/certificate-bundle.crt

```

## ​Network access requirements

Claude Code requires access to the following URLs:

- `api.anthropic.com`- Claude API endpoints
- `statsig.anthropic.com`- Telemetry and metrics
- `sentry.io`- Error reporting

Ensure these URLs are allowlisted in your proxy configuration and firewall rules. This is especially important when using Claude Code in containerized or restricted network environments.

## ​Additional resources

- [Claude Code settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Environment variables reference](https://docs.anthropic.com/en/docs/claude-code/settings#environment-variables)
- [Troubleshooting guide](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)
[Google Vertex AI](https://docs.anthropic.com/en/docs/claude-code/google-vertex-ai)[LLM gateway](https://docs.anthropic.com/en/docs/claude-code/llm-gateway)On this page
- [Basic proxy configuration](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#basic-proxy-configuration)
- [Environment variables](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#environment-variables)
- [Authentication](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#authentication)
- [Basic authentication](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#basic-authentication)
- [SSL certificate issues](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#ssl-certificate-issues)
- [Network access requirements](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#network-access-requirements)
- [Additional resources](https://docs.anthropic.com/en/docs/claude-code/corporate-proxy#additional-resources)