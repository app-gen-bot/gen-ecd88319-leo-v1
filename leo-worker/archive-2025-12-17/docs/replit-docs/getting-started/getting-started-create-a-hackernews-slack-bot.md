# Create a HackerNews Slack bot

**Source:** https://docs.replit.com/getting-started/quickstarts/webscrape-and-slack-notifications  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:08:04

---

Start from a templateCreate a HackerNews Slack botCopy pageBuild a bot that scrapes HackerNews and sends updates to Slack. Learn how to use Scheduled Deployments and integrate with external services.Copy page

Learn how to create a bot that monitors HackerNews and sends notifications to Slack. This guide shows you how to use Scheduled Deployments and external APIs.

## ​What you’ll learn

## Web Scraping

Fetch data from HackerNews

## Slack Integration

Send notifications to Slack channels

## Scheduling

Configure automated publishing

## API Usage

Work with external services

## ​Create your bot

1

Fork the template

Sign in to Replit and fork the HackerNews webscraper template. Select + Use Template and follow the prompts to create your Replit App.

2

Create a Slack app

1. Go to Slack Apps and select Create an App
1. Choose From an app manifest
1. Select your workspace

1. Replace the manifest with this JSON

(/* vale on */}

1. Review and select Create
1. Select Install the App

You may need administrator approval based on your organization’s policies.

3

Configure tokens

Add these secrets to your Replit App’s Secrets tab:

1. SLACK_BOT_TOKEN

Go to Settings > Install App
Copy the Bot User OAuth Token
1. SLACK_SIGNING_SECRET

Go to Settings > Basic Information
Copy the Signing Secret from App Credentials
1. SLACK_APP_TOKEN

Go to Settings > Basic Information
Under App-Level Tokens, select Generate Token and Scopes
Add permissions and generate token

4

Customize your bot

Update app.py with your preferences:

Copy

Ask AI

```
KEYWORDS = ["h"]  # Terms to search for
ALERT_UIDS = ["U06C34217C5"]  # Your Slack member ID
NUM_TOP_STORIES = 25  # Number of stories to check

```

Get your Slack member ID from your profile settings under the ellipsis menu.

## ​Publish with scheduling

1

Start publishing

Select Publish in the workspace header.

2

Configure schedule

1. Choose Scheduled
Deployments 2. Set your
preferred schedule 3. Select Publish

3

Monitor

Your bot will now run automatically according to your schedule.

## ​Customization options

## Enhance filtering

- Add more keywords - Refine matching criteria - Customize scoring

## Improve notifications

- Format messages - Add rich previews - Include metadata

## ​Next steps

[AI IntegrationAdd AI summaries to notifications](https://docs.replit.com/getting-started/quickstarts/ai-slack-channel-summarizer)

[DeploymentsLearn more about scheduling](https://docs.replit.com/cloud-services/deployments/scheduled-deployments)

[DatabasesStore historical data](https://docs.replit.com/cloud-services/storage-and-databases/sql-database)

## ​Related guides

[Create a Slack summarizerBuild a bot that summarizes Slack channels](https://docs.replit.com/getting-started/quickstarts/ai-slack-channel-summarizer)

[Build with AICreate apps using Agent and Assistant](https://docs.replit.com/getting-started/quickstarts/build-with-ai)

Want to learn more about publishing? Check out our publishing documentation.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/static-blog-astro)

[Create a Slack channel summarizerBuild a Slack bot that summarizes channel activity using GPT-4. Learn how to integrate AI with Slack's API.Next](https://docs.replit.com/getting-started/quickstarts/ai-slack-channel-summarizer)
