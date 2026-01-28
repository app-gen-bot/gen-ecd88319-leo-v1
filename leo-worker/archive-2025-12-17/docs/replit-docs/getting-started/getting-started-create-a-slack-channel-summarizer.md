# Create a Slack channel summarizer

**Source:** https://docs.replit.com/getting-started/quickstarts/ai-slack-channel-summarizer  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:09:43

---

Start from a templateCreate a Slack channel summarizerCopy pageBuild a Slack bot that summarizes channel activity using GPT-4. Learn how to integrate AI with Slack’s API.Copy page

Turn your Slack conversations into concise summaries with AI. This guide shows you how to create a bot that summarizes channel activity using GPT-4.

## ​Features

## Channel Summaries

Summarize Slack channel activity for any time period

## GPT-4 Integration

Generate intelligent, context-aware summaries using OpenAI’s GPT-4

## ​Create your summarizer

1

Fork the template

1. Sign in to Replit
1. Navigate to the AI Slack summary template
1. Select + Use Template in the upper-right corner
1. Follow the prompts to create your Replit App

2

Create a Slack app

1. Go to the Slack Apps page
1. Select Create an App
1. Choose From an app manifest
1. Select your workspace from the dropdown
1. Replace the manifest content with the manifest.json file
1. Review the configuration and select Create
1. Select Install the App

You may need administrator approval to install the app depending on your organization’s settings.

3

Configure your tokens

Add the following secrets to your Replit App’s Secrets tab:

1. SLACK_BOT_TOKEN

Navigate to Settings > Install App in your Slack App
Copy the Bot User OAuth Token
1. SLACK_SIGNING_SECRET

Go to Settings > Basic Information
Copy the Signing Secret from App Credentials
1. SLACK_APP_TOKEN

Go to Settings > Basic Information
Under App-Level Tokens, select Generate Token and Scopes
Add a token name and select permissions
Copy the generated token
1. OPENAI_API_KEY

Get your API key from OpenAI’s platform

4

Publish your bot

1. Select Publish in the Workspace header
1. Choose Reserved VM Deployments
1. Select Set up your published app
1. Select Publish

## ​Using your summarizer

Add your bot to a channel and send it a direct message with the following command:

Copy

Ask AI

```
/summarize-channel #channel-name duration

```

For example, to summarize the last 24 hours of activity in #general:

Copy

Ask AI

```
/summarize-channel #general 24

```

## ​Customization options

Summarization criteriaCustomize your summaries by modifying the prompt to focus on specific
keywords or topics.

Platform integrationsExtend functionality by connecting with additional platforms and services.

Alert messagesCustomize the format and content of Slack alert messages.

Summary frequencyConfigure different summarization intervals for channels or topics.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/webscrape-and-slack-notifications)

[Add a SQL databaseLearn how to connect to your Replit database from your Replit App.Next](https://docs.replit.com/getting-started/quickstarts/database-connection)
