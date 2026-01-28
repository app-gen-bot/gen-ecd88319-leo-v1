# Security checklist for vibe coding

**Source:** https://docs.replit.com/tutorials/vibe-code-security-checklist  
**Section:** tutorials  
**Scraped:** 2025-09-08 20:24:03

---

SecuritySecurity checklist for vibe codingCopy pageFollow this comprehensive security checklist to ensure your vibe coded applications follow best security practices.Copy page

[Matt PalmerHead of Developer Relations](https://youtube.com/@mattpalmer)

This guide provides a comprehensive security checklist to ensure your vibe coded applications follow best security practices.

While Replit provides many security features out of the box, it’s important to understand and implement more security measures for your specific application needs.

## ​Prerequisites

- A Replit account
- Basic understanding of your preferred programming language
- Familiarity with the Replit Workspace
- An application you’re building on Replit

## ​Front-end security

HTTPS everywhereReplit uses HTTPS by default for all applications. So you don’t need to worry about it!

Input validation and sanitizationAlways validate and sanitize user input to prevent cross-site scripting (XSS) attacks:CopyAsk AI// Bad: Direct use of user input
element.innerHTML = userInput;

// Good: Sanitize input before using
import { sanitize } from 'some-sanitizer-library';
element.innerHTML = sanitize(userInput);
You can ask Assistant:CopyAsk AIHelp me validate and sanitize inputs to protect against XSS attacks

Keep sensitive data out of the browserYou should use Replit Secrets to store sensitive information like API keys.Be sure you don’t pass secrets to the client side or put them in the following places:
Local storage
Session storage
Client-side JavaScript
Cookies without proper security attributes
You can ask Assistant / Agent:CopyAsk AIHelp me keep sensitive data out of the browser. Am I doing this correctly?

CSRF protectionImplement Cross-Site Request Forgery (CSRF) protection for forms:CopyAsk AI// Example of CSRF token implementation
const csrfToken = generateToken();
session.csrfToken = csrfToken;
You can ask Agent / Assistant:CopyAsk AIHelp me implement CSRF tokens for forms

## ​Back-end security

Authentication fundamentalsWhen implementing authentication:
Use Replit Auth when possible
If building custom auth, use established libraries
Never store plain text passwords
Ask Agent:CopyAsk AIHelp me implement authentication for my application with Replit Auth

Authorization checksAlways verify permissions before performing actions:CopyAsk AI// Example authorization check
if (!user.canAccess(resource)) {
  return res.status(403).send('Access denied');
}
Ask Agent:CopyAsk AIHelp me implement authorization checks for my application

API endpoint protectionSecure your API endpoints:
Add authentication to sensitive endpoints
Implement proper CORS settings
Consider rate limiting
Ask Assistant:CopyAsk AIHow do I properly authenticate endpoints in my app?

SQL injection preventionAgent uses ORMs by default, which helps prevent SQL injection. If writing custom database queries:CopyAsk AI// Bad: String concatenation in queries
db.query(`SELECT * FROM users WHERE username = '${username}'`);

// Good: Parameterized queries with ORM
db.query('SELECT * FROM users WHERE username = ?', [username]);

Security headersAdd important security headers to your application:CopyAsk AI<!-- In index.html or through your back-end -->
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
You can scan your site at securityheaders.com for recommendations.Ask Assistant:CopyAsk AICan you add the security headers to my application?

## ​Ongoing security practices

Keep dependencies updatedRegularly check for outdated packages that might have vulnerabilities:CopyAsk AInpm audit

Proper error handlingDon’t expose sensitive information in error messages:CopyAsk AI// Bad: Exposing sensitive details
catch (err) {
  res.status(500).send(`Database error: ${err.message}`);
}

// Good: Generic error message
catch (err) {
  console.error(err); // Log internally
  res.status(500).send('An error occurred');
}
Ask Agent:CopyAsk AIHelp me implement proper error handling for my application

Secure cookiesWhen using cookies:
Set HttpOnly flag to prevent JavaScript access
Use Secure attribute to require HTTPS
Implement SameSite attribute to prevent CSRF
Ask Agent:CopyAsk AIHelp me secure my cookies for my application

File upload securityIf your application allows file uploads:
Restrict file types and sizes
Scan for malware if possible
Store files in Replit’s object storage
Generate new filenames rather than using user-provided ones
Ask Agent:CopyAsk AIHelp me secure my file uploads for my application

Rate limitingImplement rate limiting for API endpoints, especially authentication-related ones:CopyAsk AI// Example rate limiting middleware
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
Ask Agent:CopyAsk AIHelp me implement rate limiting for my application

## ​Checklist

Here’s the above in a checklist to help you stay on top of your security practices.

## ​Front-end security

Security MeasureDescription☐Use HTTPS everywherePrevents basic eavesdropping and man-in-the-middle attacks☐Input validation and sanitizationPrevents XSS attacks by validating all user inputs☐Don’t store sensitive data in the browserNo secrets in local storage or client-side code☐CSRF protectionImplement anti-CSRF tokens for forms and state-changing requests☐Never expose API keys in frontendAPI credentials should always remain server-side

## ​Back-end security

Security MeasureDescription☐Authentication fundamentalsUse established libraries, proper password storage (hashing+salting)☐Authorization checksAlways verify permissions before performing actions☐API endpoint protectionImplement proper authentication for every API endpoint☐SQL injection preventionUse parameterized queries or ORMs, never raw SQL with user input☐Basic security headersImplement X-Frame-Options, X-Content-Type-Options, and HSTS☐DDoS protectionUse a CDN or cloud service with built-in DDoS mitigation capabilities

## ​Practical security habits

Security MeasureDescription☐Keep dependencies updatedMost vulnerabilities come from outdated libraries☐Proper error handlingDon’t expose sensitive details in error messages☐Secure cookiesSet HttpOnly, Secure and SameSite attributes☐File upload securityValidate file types, sizes, and scan for malicious content☐Rate limitingImplement on all API endpoints, especially authentication-related ones

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/tutorials/vibe-code-securely)

[Learn about MCP in 3 minutesLearn how to use Model Context Protocol (MCP) to give AI models access to tools, data sources, and real-world capabilities in just 3 minutes.Next](https://docs.replit.com/tutorials/mcp-in-3)
