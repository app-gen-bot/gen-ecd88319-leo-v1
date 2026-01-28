# Frequently Asked Questions

**Source:** https://docs.replit.com/extensions/faq  
**Section:** extensions  
**Scraped:** 2025-09-08 20:21:58

---

ExtensionsFrequently Asked QuestionsCopy pageCommon questions and answers about building, verifying, and troubleshooting Replit Extensions, including server setup and Preview integration.Copy page

How does my extension get verified?A Replit staff member must review your Extension and manually verify it.

My backend server isn't working with my extensionExtensions are expected to be a bundle that can be statically served. This means that you can’t run a server in the same Replit App as the extension you’re hosting. We would recommend separating your server and client for extension development.

My extension is throwing a timeout errorMake sure you are viewing your extension through the correct pane and not the Preview pane. To correctly open your extension, use the Extension Devtools.
If your extension is opened in the correct pane, hit the Reload icon in the extension tab.

What's the difference between the Preview tool and an Extension?The preview tool uses a normal iframe to displays the web output of your Replit App. In the case of an extension, a special handshake is established between that web output and the Replit workspace.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/publish)

[CLUILearn how to use CLUI, Replit's interactive command bar that lets you perform various actions across your Account, Workspace, and through Shortcuts.Next](https://docs.replit.com/additional-resources/clui-graphical-cli)
