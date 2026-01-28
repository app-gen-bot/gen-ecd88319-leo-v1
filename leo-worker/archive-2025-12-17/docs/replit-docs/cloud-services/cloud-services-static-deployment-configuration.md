# Static Deployment Configuration

**Source:** https://docs.replit.com/cloud-services/deployments/static-deployments-advanced  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:34

---

Advanced ConfigurationStatic Deployment ConfigurationCopy pageStatic deployments let you control the HTTP headers, routing rules, and URL rewrites for your static website.Copy page

This guide covers the following web server-level configurations:

- Add response headers
- Create a custom 404 page
- Define URL path rewrites

## ​Add response headers

Custom response headers let you add HTTP header instructions to requests that match specific paths.
A response header is a name-value pair that provides instructions to browsers on how
to interact with the requested content.

For example, you can specify the Access-Control-Allow-Origin header to specify which domains the browser can access for that page.
To create this entry, add the following to the .replit file in your Replit App’s root directory:

Copy

Ask AI

```
[[deployment.responseHeaders]]
path = "/*"
name = "Access-Control-Allow-Origin"
value = "origin"

```

This response header includes the following parameters:

- path: URL path pattern that matches requested resources
- name: HTTP header name
- value: Value of the HTTP header

You can add multiple deployment.responseHeaders entries to the .replit file.

To apply configuration updates, republish your Replit App.

#### ​Reserved headers

Replit reserves the following HTTP headers and does not allow you to configure them.

Copy

Ask AI

```
Accept-Ranges
Age
Allow
Alt-Svc
Connection
Content-Encoding
Content-Length
Content-Range
Date
Location
Server
Set-Cookie
Trailer
Transfer-Encoding
Upgrade

```

See all 16 lines

To learn more about HTTP headers, see

[HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)

in the MDN web documentation.

## ​Create a custom 404 page

A custom 404 page displays when users request URL paths that don’t match any files or rules in your published app.

To add a custom 404 page, create the page content in a file named 404.html in the root directory of your Replit App.

When users attempt to access a URL path that doesn’t exist, they see the rendered HTML of the custom 404 page.

## ​Define URL path rewrites

You can define URL rewrites to change the URL path of a request before your Replit App processes it.
The original URL remains visible in the browser, but the server loads the resource defined in the rewrite rule.

For example, you can specify all requests that start with /app load the contents of the /app/index.html file.
To create this entry, add the following to the .replit file in your Replit App’s root directory:

Copy

Ask AI

```
[[deployment.rewrites]]
from = "/app/*"
to = "/app/index.html"

```

- from: URL path pattern that matches requested resources
- to: Rewritten path, which corresponds to a file in your Static Deployment.

You can add multiple deployment.rewrites entries to the .replit file.
The server interprets the entries in the listed order and ignores duplicates.

To apply configuration updates, you must republish your Replit App.

The following sections describe URL rewrite rule constraints.

### ​Path matching

The following constraints apply to the from and to parameters in rewrite rules:

- Matches must be exact unless a * is present
- A * matches the remainder of a path
- A * is only valid at the end of the path
- When including * in the from parameter, you can include it in the to parameter to represent the matching section of the path

For example, if your .replit file contains the following rewrite:

Copy

Ask AI

```
[[deployment.rewrites]]
from = "/v1/*"
to = "/v2/*"

```

When a user visits the path /v1/about-us.html, the rewrite serves the file located at /v2/about-us.html.

### ​Shadowing

Shadowing occurs when a rewrite matches a URL path that also matches a file in your Static Deployment.
When this occurs, the cloud server ignores the rewrite and serves the file directly.

For example, suppose your published app contains the following files:

- index.html
- about.html

The .replit file contains the following rewrite:

Copy

Ask AI

```
[[deployment.rewrites]]
from = "/*"
to = "/index.html"

```

When a user visits /register.html, the server rewrites the request to /index.html and serves that file.
However, if a user visits /about.html, the server ignores the rewrite and serves the about.html file since it exists in your Static Deployment.

### ​Domain restrictions

Rewrites only work for requests to your Static Deployment’s primary domain and can
only redirect to files within your Static Deployment.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/private-deployments)

[OverviewLearn about file storage and database options on Replit.Next](https://docs.replit.com/category/storage-and-databases)
