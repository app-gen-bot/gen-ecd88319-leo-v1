# Create a file converter with AI

**Source:** https://docs.replit.com/getting-started/quickstarts/build-with-ai  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:09:16

---

Agent & AssistantCreate a file converter with AICopy pageBuild a file conversion app in 15 minutes using Replit’s AI tools. Learn how to use Agent and Assistant to create apps through natural language.Copy page

Learn how to replace line-by-line coding with AI-powered conversations. This guide shows you how to effectively communicate your vision and leverage Replit’s AI tools to bring your ideas to life.

## ​What you’ll learn

## AI Tool Mastery

Use Agent and Assistant effectively for different development tasks

## Clear Communication

Learn the art of describing your vision to AI tools

## Best Practices

Discover how to provide context and specifications effectively

## Rapid Development

Build and publish a working app in just 15 minutes

You’ll need a Replit account and Core subscription to access Agent.

Quick access
View the finished template
Try the live demo

## ​Start with Agent

1

Understand the library

We’ll use MarkItDown, Microsoft’s file conversion library. Since it’s new, provide Agent with context about its capabilities:

Copy

Ask AI

```
MarkItDown is a utility for converting various files to Markdown (e.g., for indexing, text analysis, etc). It supports:
PDF
PowerPoint
Word
Excel
Images (EXIF metadata and OCR)
Audio (EXIF metadata and speech transcription)
HTML
Text-based formats (CSV, JSON, XML)
ZIP files (iterates over contents)
https://github.com/microsoft/markitdown
```

Hover over URLs and select “copy content” to give Agent additional context.

2

Create your prompt

Craft a clear prompt explaining your vision:

Copy

Ask AI

```
I’d like to build a simple app that converts office files to markdown. It should have a drag and drop interface and be both desktop and mobile friendly.
```

3

Review the plan

Agent will create a development plan outlining:

- Required files
- Code structure
- Implementation steps

## ​Develop iteratively

### ​Using Agent for major changes

Agent excels at handling structural changes and core functionality. When you encounter issues:

1. Copy error messages directly into the chat
1. Be descriptive about what’s not working
1. Provide clear requirements for new features

Example prompts for adding features:

Copy

Ask AI

```
Make the app more responsive and mobile friendly, the copy and download buttons are cut off on narrow screens
```

### ​Refining with Assistant

Switch to Assistant for detailed improvements and UI refinements. Use the @ symbol to reference specific files:

Copy

Ask AI

```
Remove ‘Powered by MarkItDown Library’ and add a description to the top of the app
Add a footer with links to social profiles
```

Use web development terms like “responsive,” “mobile-friendly,” and “grid interface” to communicate effectively.

## ​Publish your app

1

Start publishing

Select Publish or search for “Deployments” in the command bar.

2

Configure resources

For auto-scale published apps, configure:

- Basic resources (1 CPU, 1GB RAM per instance)
- Maximum machines (start with 6)
- Environment variables
- Run commands

3

Launch

1. Name your app
1. Select Publish
1. Wait 1-5 minutes for it to go live
1. Access your app via the provided URL

## ​Best practices

## Use Agent for

- Initial setup
- Core functionality
- Major structural changes
- Error resolution

## Use Assistant for

- UI refinements
- Small feature additions
- Code optimization
- Documentation

Success with AI tools depends more on clear communication than coding expertise. Focus on describing your vision effectively using web development terminology.

## ​Resources

[TemplateFork the template](https://replit.com/@matt/msftmd-Office-Markdown-Converter?v=1&utm_source=matt&utm_medium=youtube&utm_campaign=msftmd-app)

[DemoTry the live demo](https://msftmd.replit.app/)

[TutorialWatch the video above](#)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/no-code-cat-image-generator)

[Built-in security featuresLearn about the security features built into Replit.Next](https://docs.replit.com/tutorials/vibe-code-securely)
