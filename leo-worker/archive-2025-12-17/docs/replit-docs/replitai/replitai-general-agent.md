# General Agent

**Source:** https://docs.replit.com/replitai/general-agent  
**Section:** replitai  
**Scraped:** 2025-09-08 20:05:15

---

FeaturesGeneral AgentCopy pageGeneral Agent is a powerful variant of Replit Agent designed to work with any project type or framework, offering enhanced flexibility and broader workflow supportCopy page

General Agent is an advanced feature that allows you to use any framework with Replit Agent. That means you can build with your favorite projects or workflows. This comes with some risk: not all projects will work on the first try, but it means that you can now use Agent on any new or existing project that runs on Replit.

## ​How to access General Agent

You can get General Agent for your project in three ways:

1. Select “General” before writing a prompt on the Replit main page
1. Choose any Developer Framework - All Developer Frameworks now automatically include General Agent (including historical Apps made from Developer Frameworks)
1. Import from GitHub - Projects imported from GitHub that aren’t previous Replit, Lovable, or Figma projects automatically get General Agent (including historical GitHub imports)

## ​What makes General Agent different

General Agent has three key differences from the standard Replit Agent:

### ​Flexible guardrails

General Agent doesn’t have the specialized technology rules that act as guardrails on standard Agent behavior. When you ask for something, General Agent makes its best effort to fulfill your request.

### ​Enhanced toolset

General Agent has access to more tools for configuring your Replit environment and project setup, allowing it to handle:

- Complex workflows
- Custom run configurations
- Environment setup
- Dependency management
- And much more

### ​Manual publishing configuration

Unlike the regular Replit Agent with pre-configured environment, publishing, and run commands:  General Agent will setup its own environment and run commands based on your request and it will require you to ask it to configure publishing. While more powerful, this means your experience may vary.

## ​Supported workflows

General Agent can handle a wide variety of workflows, including:

- Alternative web frameworks like Angular or Vue
- Different programming languages like Rust, C#, or Go
- Alternative databases (Note: Database rollbacks for non-Replit Databases are not supported, so proceed carefully)
- Command-line tools including Rust CLIs or terminal-based user interfaces (TUIs)
- Desktop applications using Python tkinter or Godot games

## ​Getting started

1

Create or import your project

Use one of the three methods above to get a project with General Agent

2

Describe what you want to build

Tell General Agent about your project goals in natural language

3

Iterate and refine

Work with General Agent to configure your environment and setup exactly how you want it

## ​What to expect

The setup process with General Agent varies depending on your project’s tech stack, complexity, and requirements:

- Single-shot setup: Sometimes General Agent configures everything in one go
- Iterative collaboration: You may need to work with General Agent through multiple rounds to get the setup exactly right
- Technology limitations: Under the hood, Replit uses Nix for managing packages. Some technologies may not be supported in the Nix environment or may be difficult to work with modern LLM agents.

Your milage may vary, but you have the power to try out whatever you like!  General Agent offers significantly more power and flexibility, making it ideal for builders who want to work with diverse technologies and complex project requirements, and are comfortable with occasional debugging.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replitai/dynamic-intelligence)

[Image generationGenerate AI images directly in Replit and seamlessly integrate them into your projects with Agent's image generation capabilities.Next](https://docs.replit.com/replitai/image-generation)
