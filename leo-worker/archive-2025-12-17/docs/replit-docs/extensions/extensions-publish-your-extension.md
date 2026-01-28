# Publish your Extension

**Source:** https://docs.replit.com/extensions/publish  
**Section:** extensions  
**Scraped:** 2025-09-08 20:25:30

---

ExtensionsPublish your ExtensionCopy pageLearn how to prepare and publish your Replit Extension to the store, including icon design, build configuration, and the review process.Copy page

After you’ve finished building your Extension, it’s time to publish it to the store for all to use. There are a few steps you will need to complete before you release it. Extensions are expected to be a bundle that can be statically served.

## ​Design an Icon

Extensions need to have a clean, visible, and memorable icon before being added to the store. We have a Figma template you can use to design your own, or you can use the Icon Generator to create one for you.

[Icon Generator Extension](https://replit.com/extension/@theflowingsky/9d8280fb-1a5f-495b-9624-aba982c42205)

## ​Building

If you use a framework like React, you will need to build a static output folder which renders the extension’s contents statically. The default template already has the build steps configured, just confirm that it works by running the build command in the shell.

If you are using HTML/CSS/JS, set the build command to a single space " " and set the output directory to your Replit App’s base URL ..

### ​Vite

Running npx vite build will create a static folder dist. Set build to vite build in your package.json file and set the extension’s build command to npm run build. Next, set the output folder to dist.

### ​Next.js

Next.js supports building a static HTML export, but some features such as server-side rendering and API routes are not supported.

In next.config.js, set the output property to "export".

The required steps to build the static output folder consist of:

1. Deleting the .next folder
1. Building in development mode
1. Running next export

All three steps can be collapsed into a single bash command, which can be set as the "export" command in package.json.

Copy

Ask AI

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "export": "rm -rf .next && export NODE_ENV=development && yarn build && next export"
},

```

Running next export will create a static folder out. In the Extension Devtools, set the build command to npm run export and the output folder to out.

## ​Review

After your extension has been published, you must wait for a Replit staff member to review it before it can be put on the store.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/themes)

[OverviewCommon questions and answers about building, verifying, and troubleshooting Replit Extensions, including server setup and Preview integration.Next](https://docs.replit.com/extensions/faq)
