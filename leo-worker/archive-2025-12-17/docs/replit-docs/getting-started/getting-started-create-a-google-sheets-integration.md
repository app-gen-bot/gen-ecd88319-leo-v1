# Create a Google Sheets integration

**Source:** https://docs.replit.com/getting-started/quickstarts/google-sheets-integration  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:09:26

---

Start from a templateCreate a Google Sheets integrationCopy pageBuild an app that connects to Google Sheets using Python. Learn how to fetch and process spreadsheet data on Replit.Copy page

Learn how to create an application that interacts with Google Sheets. This guide shows you how to access and display spreadsheet data using Python and pandas.

## ​What you’ll learn

## Google Sheets

Connect to spreadsheet data

## Data Processing

Work with pandas dataframes

## API Integration

Use Google’s API services

## Authentication

Handle OAuth and service accounts

## ​Create your app

1

Fork the template

Sign in to Replit and fork the Google Sheets to HTML Renderer. Select + Use Template and follow the prompts to create your Replit App.

2

Configure for public sheets

1. Open main.py
1. Replace WORKSHEET_URL with your Google Sheet URL
1. Set require_auth=False for public sheets

A worksheet refers to a single tab in a Google Sheet. Make sure to use the correct tab’s URL.

3

Configure for private sheets

1. Enable Google Sheets API access:

Enable Drive and Spreadsheets APIs
Follow the API setup guide
1. Create a service account
1. Add the service account JSON to your Replit App’s Secrets as SERVICE_ACCOUNT_JSON
1. Share your sheet with the service account email

Service accounts provide secure, automated access to your sheets.

## ​Publish your app

1

Set up publishing

1. Select Publish in the workspace header
1. Choose Reserved VM deployment
1. Select Publish

2

Test

Your app will be live in a few minutes. Test it by accessing the HTML endpoint in your browser.

## ​Customization options

## Data Processing

- Modify data transformations
- Add filtering options
- Create custom views

## Display

- Customize HTML rendering
- Add interactive features
- Style your output

## ​Next steps

[FastAPICreate an API service](https://docs.replit.com/getting-started/quickstarts/fastapi-service)

[DatabasesAdd persistent storage](https://docs.replit.com/cloud-services/storage-and-databases/sql-database)

## ​Related guides

[Create a Slack botBuild a Slack integration](https://docs.replit.com/getting-started/quickstarts/webscrape-and-slack-notifications)

[Build with AICreate apps using Agent](https://docs.replit.com/getting-started/quickstarts/build-with-ai)

Want to learn more about API integrations? Check out our publishing documentation.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/tutorials/create-apps-with-grok-3)

[Create a Discord botBuild a fun Discord bot that tells jokes. Learn how to use the Discord API and publish your bot on Replit.Next](https://docs.replit.com/getting-started/quickstarts/discord-bot)
