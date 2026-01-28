# Quickstart

**Source:** https://docs.anthropic.com/en/docs/claude-code/quickstart
**Retrieved:** 2025-07-04

---

This quickstart guide will have you using AI-powered coding assistance in just a few minutes. By the end, you’ll understand how to use Claude Code for common development tasks.

## ​Before you begin

Make sure you have:

- [Installed Claude Code](https://docs.anthropic.com/en/docs/claude-code/setup)
- A terminal or command prompt open
- A code project to work with

## ​Step 1: Start your first session

Open your terminal in any project directory and start Claude Code:

```bash
cd /path/to/your/project
claude

```

You’ll see the Claude Code prompt inside a new interactive session:

```
✻ Welcome to Claude Code!

...

> Try "create a util logging.py that..." 

```

## ​Step 2: Ask your first question

Let’s start with understanding your codebase. Try one of these commands:

```
> what does this project do?

```

Claude will analyze your files and provide a summary. You can also ask more specific questions:

```
> what technologies does this project use?

```

```
> where is the main entry point?

```

```
> explain the folder structure

```

Claude Code reads your files as needed - you don’t have to manually add context.

## ​Step 3: Make your first code change

Now let’s make Claude Code do some actual coding. Try a simple task:

```
> add a hello world function to the main file

```

Claude Code will:

1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

Claude Code always asks for permission before modifying files. You can approve individual changes or enable “Accept all” mode for a session.

## ​Step 4: Use Git with Claude Code

Claude Code makes Git operations conversational:

```
> what files have I changed?

```

```
> commit my changes with a descriptive message

```

You can also prompt for more complex Git operations:

```
> create a new branch called feature/quickstart

```

```
> show me the last 5 commits

```

```
> help me resolve merge conflicts

```

## ​Step 5: Fix a bug or add a feature

Claude is proficient at debugging and feature implementation.

Describe what you want in natural language:

```
> add input validation to the user registration form

```

Or fix existing issues:

```
> there's a bug where users can submit empty forms - fix it

```

Claude Code will:

- Locate the relevant code
- Understand the context
- Implement a solution
- Run tests if available

## ​Step 6: Test out other common workflows

There are a number of ways to work with Claude:

**Refactor code**

```
> refactor the authentication module to use async/await instead of callbacks

```

**Write tests**

```
> write unit tests for the calculator functions

```

**Update documentation**

```
> update the README with installation instructions

```

**Code review**

```
> review my changes and suggest improvements

```

**Remember**: Claude Code is your AI pair programmer. Talk to it like you would a helpful colleague - describe what you want to achieve, and it will help you get there.

## ​Essential commands

Here are the most important commands for daily use:

| Command | What it does | Example |
| --- | --- | --- |
| claude | Start interactive mode | claude |
| claude "task" | Run a one-time task | claude "fix the build error" |
| claude -p "query" | Run one-off query, then exit | claude -p "explain this function" |
| claude -c | Continue most recent conversation | claude -c |
| claude -r | Resume a previous conversation | claude -r |
| claude commit | Create a Git commit | claude commit |
| /clear | Clear conversation history | > /clear |
| /help | Show available commands | > /help |
| exitor Ctrl+C | Exit Claude Code | > exit |

## ​Pro tips for beginners

Be specific with your requests

Instead of: “fix the bug”

Try: “fix the login bug where users see a blank screen after entering wrong credentials”

Use step-by-step instructions

Break complex tasks into steps:

```
> 1. create a new API endpoint for user profiles

```

```
> 2. add validation for required fields

```

```
> 3. write tests for the endpoint

```

Let Claude explore first

Before making changes, let Claude understand your code:

```
> analyze the database schema

```

```
> how does error handling work in this app?

```

Save time with shortcuts

- Use Tab for command completion
- Press ↑ for command history
- Type`/`to see all slash commands

## ​What’s next?

Now that you’ve learned the basics, explore more advanced features:
[CLI referenceMaster all commands and options](https://docs.anthropic.com/en/docs/claude-code/cli-reference)[ConfigurationCustomize Claude Code for your workflow](https://docs.anthropic.com/en/docs/claude-code/settings)[Common workflowsLearn advanced techniques](https://docs.anthropic.com/en/docs/claude-code/common-workflows)

## ​Getting help

- **In Claude Code**: Type`/help`or ask “how do I…”
- **Documentation**: You’re here! Browse other guides
- **Community**: Join our[Discord](https://www.anthropic.com/discord)for tips and support
[Set up](https://docs.anthropic.com/en/docs/claude-code/setup)[Memory management](https://docs.anthropic.com/en/docs/claude-code/memory)On this page
- [Before you begin](https://docs.anthropic.com/en/docs/claude-code/quickstart#before-you-begin)
- [Step 1: Start your first session](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-1%3A-start-your-first-session)
- [Step 2: Ask your first question](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-2%3A-ask-your-first-question)
- [Step 3: Make your first code change](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-3%3A-make-your-first-code-change)
- [Step 4: Use Git with Claude Code](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-4%3A-use-git-with-claude-code)
- [Step 5: Fix a bug or add a feature](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-5%3A-fix-a-bug-or-add-a-feature)
- [Step 6: Test out other common workflows](https://docs.anthropic.com/en/docs/claude-code/quickstart#step-6%3A-test-out-other-common-workflows)
- [Essential commands](https://docs.anthropic.com/en/docs/claude-code/quickstart#essential-commands)
- [Pro tips for beginners](https://docs.anthropic.com/en/docs/claude-code/quickstart#pro-tips-for-beginners)
- [What’s next?](https://docs.anthropic.com/en/docs/claude-code/quickstart#what%E2%80%99s-next%3F)
- [Getting help](https://docs.anthropic.com/en/docs/claude-code/quickstart#getting-help)