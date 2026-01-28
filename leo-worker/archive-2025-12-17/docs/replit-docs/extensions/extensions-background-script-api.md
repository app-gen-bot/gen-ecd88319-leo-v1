# Background Script API

**Source:** https://docs.replit.com/extensions/api/background  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:54

---

API ReferenceBackground Script APICopy pageLearn how to use background scripts to run persistent code in your Replit extension from startup until the workspace closes.Copy page

Background scripts are loaded when the Replit App opens. They remain permanently loaded until the extension is uninstalled or you close the workspace.

Background scripts are written in a “background page”, which is an “invisible” iFrame context that renders no UI.

You can add a background page to your extension by adding the following field to your Manifest file:

Copy

Ask AI

```
{
  "background": {
    "page": "/path/to/background.html"
  }
}

```

The path points to a page in your extension bundle. We load it as an invisible iframe element; if you render any UI elements, they will not be visible to users. (To render UI, you want to create tools instead).

Here’s an example extension that makes use of the background script:

[Background Script Example](https://replit.com/@util/background-script-example#README.md)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/auth)

[commands APIRegister and manage custom commands for the Replit command bar and other extension points using the commands API module.Next](https://docs.replit.com/extensions/api/commands)
