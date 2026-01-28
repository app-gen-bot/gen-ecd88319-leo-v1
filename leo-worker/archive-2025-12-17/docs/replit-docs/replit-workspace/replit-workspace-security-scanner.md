# Security Scanner

**Source:** https://docs.replit.com/replit-workspace/workspace-features/security-scanner  
**Section:** replit-workspace  
**Scraped:** 2025-09-08 20:05:29

---

FeaturesSecurity ScannerCopy pageSecurity Scanner helps you identify and fix potential security vulnerabilities in your application before publishing.Copy page

Security Scanner is currently still in beta. While it is powerful, it may occasionally report false positives or miss some issues. Review the results and use your judgment when addressing reported issues.

## ​What is Security Scanner?

+Security Scanner is a tool that analyzes your dependencies and code for potential security vulnerabilities. Code analysis is powered by Semgrep Community Edition.

It helps you:

- Identify common security issues before publishing
- Fix vulnerabilities with the Agent
- Build more secure applications

## ​What is a security vulnerability?

A security vulnerability is like a weak spot in your application that could potentially be exploited. Think of it as leaving a window unlocked in your house - while it might not cause problems immediately, it’s better to know about it and fix it before someone takes advantage of it.

Here are some common examples of security vulnerabilities:

- Hard-coded credentials: Having passwords or API keys directly in your code
CopyAsk AI// Vulnerable code
const apiKey = "sk_live_123456789";
- SQL Injection: When user input isn’t properly sanitized before being used in database queries
CopyAsk AI// Vulnerable code
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
- Cross-Site Scripting (XSS): When user input is rendered as HTML without proper sanitization
CopyAsk AI// Vulnerable code
element.innerHTML = userInput; // Could contain malicious JavaScript
- Insecure dependencies: When your application relies on vulnerable packages
CopyAsk AI{
  "dependencies": {
    "express": "^4.18.2" // Vulnerable version of Express
  }
}

The Security Scanner helps you identify these and other potential issues in your code before they can be exploited. When it finds a vulnerability, you can ask the Agent to fix it, making it easier to maintain a robust and secure application.

## ​Getting started

You can access the Security Scanner in two ways:

1. From the Deployments pane
1. By searching for “Security Scanner” in the workspace search tool

The scanner doesn’t run automatically during publishing - you’ll need to initiate it manually when you’re ready to check your code.

## ​Understanding scan results

Not all vulnerabilities require immediate attention. For example:

- A low-severity issue like using an older version of a package in a development environment might not need immediate fixing
- Some warnings might be false positives or related to test code
- You can still publish your application even if some non-critical vulnerabilities are present

## ​Next steps

- Learn about Publishing to understand how Security Scanner fits into the publishing process
- Explore Replit AI to see how the Agent can help fix security vulnerabilities
- Check out Workspace Features for more tools to enhance your development experience

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replit-workspace/workspace-features/secrets)

[ShellShell is a command-line tool that lets you run commands in your Replit App's workspace.Next](https://docs.replit.com/replit-workspace/workspace-features/shell)
