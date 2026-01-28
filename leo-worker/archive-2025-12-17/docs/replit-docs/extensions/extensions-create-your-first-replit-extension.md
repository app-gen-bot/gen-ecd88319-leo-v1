# Create your first Replit Extension

**Source:** https://docs.replit.com/extensions/basics/create-extension  
**Section:** extensions  
**Scraped:** 2025-09-08 20:13:59

---

BasicsCreate your first Replit ExtensionCopy pageLearn how to build a basic Replit extension by creating, previewing, and adding features to a sample project using Extension Devtools and the Extensions API.Copy page

#### ​Learn the basics of extension development by building and previewing a simple extension.

In this guide, you’ll build a sample “Hello, world!” React.js extension with a custom Tool UI.

## ​Before you begin

- Make sure you have a Replit account — you’ll need to be logged in to create an extension.
- You’ll also need to make sure you’ve verified your email address, as this is required to publish an extension.
- You’ll need to be familiar with JavaScript, and ideally React.js, which is our preferred framework for building UI Extensions.

## ​Create an Extension Replit App

To start building a Replit extension, you need to create an Extension Replit App. This is a special Replit App that contains all the configuration necessary to build, preview, and release your extension.

1. Fork a template below. Give it a name and click “Create Extension Replit App”

[React ExtensionA starter template for Replit Extensions using the React JavaScript
framework.](https://replit.com/new/extension?template=656d6107-3a39-4802-b8d9-59479cc5e358)

[JavaScript ExtensionA starter template for a Replit Extension with Vanilla JavaScript](https://replit.com/new/extension?template=44dadedd-8045-46a9-ad28-2b86699a861)

1. After creating the Replit App, your Workspace should open. On the left side you’ll find a code editor, and on the right side, you’ll find the Extension Devtools tab. Learn more about devtools

### ​Preview your extension

Building an extension is a lot easier when you can see what you’re building. We’ve made it easy to preview your extension in a Replit App, similar to the Preview tool you’re familiar with in other Replit Apps.

Extension Replit Apps do not support the regular Preview tool. Read more in
the FAQ

1. Open Extension Devtools
1. Click “Load Locally” This will run your Replit App’s development server, if it’s not already running, and load your extension in the preview window.
1. Open a development preview tab Click the “Preview” button next to any Tool or File Handler in the Extension Devtools to open a preview tab. This will open a new tab in your Workspace, where you can see your extension in action.

### ​Add features

Next, it’s time to start adding features using the Replit Extensions API.

There are two ways to use the APIs, depending on which template you chose:

- React Extensions In React Extensions, some APIs have hooks, while others are available on the replit object returned by useReplit().
- JavaScript Extensions In JavaScript Extensions, all APIs are available on the global replit object created by the init API

Features are added through the Devtools UI, which is available in the Extension Devtools tab. Features are divided into three categories:

1. Tools (UI Extensions) An custom user interface presented as a Tab in the workspace. Examples include a ReplDB editor or a Chat Extension. Learn how to build your first tool.
1. File Handlers (File Editors and Icons) File handlers allow you to build Tools and add icons for specific file types. Examples include a JSON file editor or a CSV file editor. Learn how to build your first file handler. Under the hood, file handlers are just tools with a filetype association.

### ​Using devtools to scaffold features

Extension developer tools make it easy to scaffold out new functionality without manually editing the Manifest file. (Behind the scenes, all the edits you make here are reflected in the Manifest file.)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/basics/key-concepts)

[Extension DevtoolsLearn how to use Replit's Extension Devtools to manage metadata, file handlers, and tools while developing your extension.Next](https://docs.replit.com/extensions/development/devtools)
