# Full-Stack

**Source:** https://docs.replit.com/extensions/development/full-stack  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:28

---

DevelopmentFull-StackCopy pageLearn how to build a full-stack extension by creating a separate backend API server to handle requests from your extension client on Replit.Copy page

# ​Create a full-stack Extension

While full-stack extensions are not supported within a single Replit App (aka a monorepo) at this time, you can always call out from your Extension client Replit App to any outside API endpoints.

Until we have full Deployments support, you can use this simple workaround to create your own server API for your extension:

1. Create your Extension Client Replit App →
1. Create a separate Replit App for your backend. This should expose an API. For example it could be a Node or Ruby API server, or even a Next.js site with a serverless function.
1. Make fetch requests from your extension client to your backend
Make sure to enable CORS requests on your extension backend API, since the extension client and API will run on different subdomains

If you’re using Next.js to build your extension, we recommend exporting it statically and pointing your releases to the build directory.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/installation)

[IntroductionLearn how to build Replit extensions using React with our official package, hooks, and components for a streamlined development experience.Next](https://docs.replit.com/extensions/development/react/introduction)
