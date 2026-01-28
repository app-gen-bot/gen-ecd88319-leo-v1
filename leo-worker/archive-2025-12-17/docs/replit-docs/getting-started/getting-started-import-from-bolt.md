# Import from Bolt

**Source:** https://docs.replit.com/getting-started/quickstarts/import-from-bolt  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:09:22

---

ImportImport from BoltCopy pageLearn how to import Bolt projects into Replit by exporting to GitHub first, then importing with Agent assistance.Copy page

## ​Import your Bolt project

⏰ Estimated time: four minutes

Agent currently only supports Vite + React apps imported from Bolt.

You can import your Bolt projects into Replit by exporting them to GitHub first, then importing them as Replit Agent Apps.

This quickstart covers the step-by-step process to migrate your Bolt projects to Replit.

For comprehensive import options including other platforms like GitHub, Figma, and Lovable, see the Import feature documentation.

## ​Export and import process

1. Export your Bolt project to GitHub from your Bolt workspace.
1. Navigate to https://replit.com/import.
1. Select Bolt from the available import sources.
1. Connect your GitHub account to Replit to authorize repository access.
1. Select your new Bolt project repo for import from the available repositories.
1. Select Import to start the migration process.

## ​What gets imported

During the import process, Replit migrates your  project with Agent assistance:

- Code: All application code and logic from your  project
- Design and styles: UI components, styling, and visual design elements
- Assets: Images, icons, and other static resources
- Backend functionality: If your  project includes backend functionality, it is imported into the Replit environment.
- Database schema: Database structure and table definitions are imported into a Neon Postgres database, which is integrated directly into the Replit environment.

### ​What’s not included

- Supabase database: Database content and data are not migrated
- Secrets: Environment variables and API keys must be added separately

You can ask Agent to help build out functionality, add secrets, and recreate databases in your new app.

## ​Configure and run your app

During the import process, .
If your app doesn’t run as expected, Replit offers the following workspace tools to help you resolve the issues:

- Agent: Use AI to add new features and refine your imported project
- Assistant: Get help with code questions and debugging
- Secrets: Add your API keys and environment variables
- Workflows: Configure the Run button to your preferred command

## ​Continue your journey

Now that you’ve imported your  , learn more about what you can do with your Replit App:

- Replit Agent: Get AI assistance with code review, testing, and feature implementation
- Make your Replit App Public: Share your app as a Template for others to remix
- Replit Deployments: Publish your app to the cloud with a few clicks
- Database setup: Let Agent help you configure and optimize your database
- Collaborate: Work with others on your imported projects

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/import-from-figma)

[Import from LovableLearn how to import Lovable projects into Replit by exporting to GitHub first, then importing with Agent assistance.Next](https://docs.replit.com/getting-started/quickstarts/import-from-lovable)
