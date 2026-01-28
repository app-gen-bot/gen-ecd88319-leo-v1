# Import

**Source:** https://docs.replit.com/replit-app/import-to-replit  
**Section:** replit-app  
**Scraped:** 2025-09-08 20:20:59

---

Replit AppsImportCopy pageImporting projects and designs from external tools into Replit Agent Apps.Copy page

Replit’s import feature allows you to transform existing projects and designs from external development and design tools into Replit Agent Apps. This reference covers supported platforms, technical specifications, limitations, and compatibility requirements.

## ​Supported import sources

Replit’s import feature supports the following external platforms:

- Figma: Convert design frames into React applications using AI-powered code generation
- Bolt: Import existing Bolt projects and migrate them to Replit Agent Apps
- Lovable: Transfer Lovable projects to Replit with Agent assistance
- Replit Agent: Import previously exported Agent Apps from GitHub repositories
- GitHub: Import compatible repositories as Agent Apps

All imported projects are validated for Agent compatibility before conversion begins.

## ​Quickstart guides

For step-by-step instructions to import from each platform, see the quickstart guides:

[Import from GitHub⏱️ 2 minutesImport an existing GitHub repository into Replit.](https://docs.replit.com/getting-started/quickstarts/import-from-github)

[Import from Figma⏱️ 3 minutesConvert your Figma designs into functional React applications.](https://docs.replit.com/getting-started/quickstarts/import-from-figma)

[Import from Bolt⏱️ 4 minutesMigrate your Bolt projects to Replit with Agent assistance.](https://docs.replit.com/getting-started/quickstarts/import-from-bolt)

[Import from Lovable⏱️ 4 minutesTransfer your Lovable projects to Replit and continue building.](https://docs.replit.com/getting-started/quickstarts/import-from-lovable)

## ​Features

- Automatic compatibility validation: Ensures imported projects work with Replit Agent
- AI-powered migration: Agent assists with project setup and feature completion
- Design-to-code conversion: Transform Figma designs into functional React applications
- Enterprise-ready templates: Import customized Agent Apps with internal configurations
- Real-time progress tracking: Monitor import status with detailed progress updates

## ​Usage

### ​Accessing the import feature

1. Navigate to replit.com/import
1. Select your desired import source from the available options
1. Follow the platform-specific import workflow

### ​Import workflow

The import process follows these general steps:

1. Source selection and validationChoose your import source and provide the necessary project information. The system validates compatibility with Agent before proceeding.If your project is incompatible, you’ll see an error message with suggestions for resolving compatibility issues.

2. Import processingDuring the import process, you’ll see an interstitial screen showing progress updates. Processing time varies based on project complexity and source platform.

3. Agent integrationOnce import completes, Agent engages to finalize the setup and ensure your project is ready for development. This is similar to the end state of Agent Rapid Build.

## ​Platform-specific workflows

Figma importsImport your Figma designs directly into Replit Agent Apps and turn them into functional web applications.​Getting started
Connect your Figma account to authorize access to your designs
In Figma, select the frame you want to build in Replit
Copy the frame URL and paste it into the Replit import interface
For a full guide on how to import a Figma design, see our quickstart guide.​What we’ll import
Theme & components: Design system elements, colors, typography, and reusable components
Assets & icons: Images, icons, and other visual assets from your design
App scaffolding: Basic application structure and layout framework
​Import process
Provide your Figma frame URL or file details
The system converts your design into React code
Agent wires the generated code to a JavaScript stack
Your design becomes a functional web application
Ensure your Figma designs are well-structured with clear component hierarchies complete with auto layout constraints for optimal conversion results.

Bolt importsImport your Bolt projects by exporting them to GitHub first, then importing into Replit Agent Apps.​Getting started
Export your Bolt project to GitHub from your Bolt workspace
Connect your GitHub account to Replit to authorize repository access
Select your new Bolt project repo for import from the available repositories
For a full guide on how to import a Bolt project, see our quickstart guide.​What gets importedDuring the import process, Replit migrates your  project with Agent assistance:
Code: All application code and logic from your  project
Design and styles: UI components, styling, and visual design elements
Assets: Images, icons, and other static resources
Backend functionality: If your  project includes backend functionality, it is imported into the Replit environment.
Database schema: Database structure and table definitions are imported into a Neon Postgres database, which is integrated directly into the Replit environment.
​What’s not included
Supabase database: Database content and data are not migrated
Secrets: Environment variables and API keys must be added separately
You can ask Agent to help build out functionality, add secrets, and recreate databases in your new app.​Import process
The system validates project structure and dependencies
Agent assists with migration and feature completion
Your project is optimized for the Replit environment

Lovable importsImport your Lovable projects by exporting them to GitHub first, then importing into Replit Agent Apps.​Getting started
Export your Lovable project to GitHub from your Lovable workspace
Connect your GitHub account to Replit to authorize repository access
Select your new Lovable project repo for import from the available repositories
For a full guide on how to import a Lovable project, see our quickstart guide.​What gets importedDuring the import process, Replit migrates your  project with Agent assistance:
Code: All application code and logic from your  project
Design and styles: UI components, styling, and visual design elements
Assets: Images, icons, and other static resources
Backend functionality: If your  project includes backend functionality, it is imported into the Replit environment.
Database schema: Database structure and table definitions are imported into a Neon Postgres database, which is integrated directly into the Replit environment.
​What’s not included
Supabase database: Database content and data are not migrated
Secrets: Environment variables and API keys must be added separately
You can ask Agent to help build out functionality, add secrets, and recreate databases in your new app.

Agent App importsImport previously exported Agent Apps from GitHub repositories with preserved configurations.​Getting started
Provide the GitHub repository URL containing your exported Agent App
Verify repository access ensuring the repository is accessible to your account
Confirm Agent App structure in the repository
For a full guide on how to import a GitHub repository, see our quickstart guide.​What we’ll import
Complete codebase: All application code, dependencies, and configurations
Agent configurations: Preserved Agent-specific settings and optimizations
Enterprise customizations: Internal hardening and custom configurations
Project structure: Full project hierarchy and organization
​Import process
The system validates the repository contains Agent App configurations
Internal customizations and enterprise hardening are preserved
The imported app is ready for immediate use or further development

GitHub repository importsImport compatible GitHub repositories and convert them into Replit Agent Apps.​Getting started
Provide the repository URL of the GitHub project you want to import
Ensure repository access with proper permissions or public visibility
Verify compatibility with supported frameworks and technologies
For a full guide on how to import a GitHub repository, see our quickstart guide.​What we’ll import
Source code: Complete repository codebase and file structure
Dependencies: Package configurations and dependency definitions
Documentation: README files, documentation, and project notes
Configuration files: Build configs, environment setups, and project settings
​Import process
The system analyzes the codebase for Agent compatibility
If compatible, the repository is converted to an Agent App
Agent assists with any necessary setup or configuration
Project is optimized for the Replit environment

## ​Limitations and considerations

### ​Current limitations

- Database data: Database contents are not imported; the system includes only schemas and edge functions
- Complex dependencies: Some complex or proprietary dependencies may require manual configuration
- Large projects: Very large projects may take longer to process or require optimization

### ​Future enhancements

- Database content migration: Full database content import capabilities
- Enhanced validation: Improved compatibility checking for complex projects

## ​Error handling

If an import fails, you’ll receive specific error messages indicating the issue:

- Compatibility errors: The project structure is incompatible with Agent
- Access errors: Unable to access the source project or repository
- Processing errors: Technical issues during conversion

If you encounter persistent import issues, check that your source project is publicly accessible or that you have proper permissions.

## ​Best practices

### ​Preparing for import

- Clean project structure: Ensure your source project has a clear, organized structure
- Remove sensitive data: Remove API keys, credentials, and sensitive information before import
- Document dependencies: Include clear documentation of external dependencies
- Test functionality: Verify your source project works correctly before importing

### ​After import

- Review generated code: Check the imported code for accuracy and completeness
- Test functionality: Thoroughly test all features in the Replit environment
- Check secrets: Agent will help you add secrets, but be sure to double check them and add any missing ones using Replit’s Secret management.
- Recreate databases: If your project uses databases, recreate them using the Database tool or by asking Agent to help you.

## ​Billing

Import processing may consume Agent credits depending on the complexity of the migration and Agent involvement.

Imports that require Agent assistance for migration or setup will consume credits based on the amount of processing required. Simple imports may complete without more charges beyond your standard Replit usage.

## ​Troubleshooting

### ​Common issues

Import validation fails

- Verify your source project uses supported frameworks and technologies
- Check that all required files are present and accessible
- Ensure your project follows standard conventions for your platform

Import takes too long

- Large or complex projects may require extended processing time
- Monitor the progress screen for status updates
- Contact support if processing exceeds expected time frames

Generated code doesn’t work as expected

- Review the imported code for missing dependencies or configurations
- Use Agent to help debug and resolve any issues
- Check that all external services and APIs are properly configured

For more support, visit the Replit Help Center or contact the support team.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/category/replit-apps)

[CollaborationOne of the great parts about Replit is that _everything_ you make can be shared with the world. Since your code is hosted in the cloud, it's as simple as one click!Next](https://docs.replit.com/replit-app/collaborate)
