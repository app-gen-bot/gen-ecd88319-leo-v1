# Database

**Source:** https://docs.replit.com/cloud-services/storage-and-databases/sql-database  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:22:15

---

Storage and DatabasesDatabaseCopy pageReplit Database is a SQL database built-in to your Replit App. It allows you to store and retrieve data for your app and users.Copy page

Replit Database uses a fully-managed SQL database that lets you add persistent data storage to your Replit App from the Workspace.

The fastest way to get started is to ask Agent to add a database to your app. Agent will set up the integration, create the database schema, and update your app to store and retrieve data.

## ​Features

The Replit Database tool provides the following features:

- Instant setup: Add a production-ready SQL database with a single click
- Database tools: Run queries, manage database schema, and visualize data with the built-in SQL tools
- Point-in-time restore: Restore your database to a specific point in time within your specified retention period
- Usage-based billing: Pay only for the storage and data transfer you use
- Environment variables: Use environment variables in your Replit App to securely access the database

## ​Usage

You can access the Replit Database tool directly in your Replit App Workspace.
The following sections guide you through setting up and managing your Database.

How to access the Replit Database toolFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Database.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Replit Database” to locate the tool and select it from the results.

### ​Add a database

Use one of the following methods to add a Replit Database integration to your Replit App:

- Ask Agent to add a PostgreSQL database to your Replit App, including details on what
data your Replit App should store. Agent sets up the integration, creates the database schema,
and updates the app to communicate with the database.
- From the Replit Database tool, select Create a database. When using this method, you
must create the tables and update your app to connect to the database.

### ​Run database commands

The SQL runner is a Workspace tool that lets you run SQL commands on your database and view the results.

How to access SQL runnerFrom the Replit Database tool:
Select the My Data tab
Select  SQL runner

To run a query, enter the SQL statement in the text area and select the
adjacent  run button
as shown below:

### ​Browse and modify data visually

The Replit Database tool includes Drizzle Studio,
a tool that lets you browse and modify data visually.

These visual tools help you avoid syntax errors and offer the following functionality:

- Filter and sort data to focus on specific information
- Export data to a file for external use
- Insert or modify row data
- Create and manage schema, tables, views, and enums

You can access these tools in the My Data tab in the Replit Database tool.

The following image shows a view from the Drizzle Studio builder interface:

You can connect to your database using any PostgresSQL-compatible SQL client using the connection string
found in your environment variables.

### ​View database connection credentials

When you add a database, the Replit Database tool automatically saves your connection credentials
as environment variables in your Replit App. Your app uses the credentials to securely
connect to the database and run commands.

How to access your database connection credentials
Navigate to the  Replit Database tool in your workspace
Select the  Commands tab and scroll to the Environment variables section

The list includes the following environment variables, which you can reference from your Replit App’s code:

- DATABASE_URL: Database connection string which contains all details for a secure connection
- PGHOST: database hostname
- PGUSER: database username
- PGPASSWORD: database password

To learn how to use these credentials in your code, see Connect your app to a SQL database.

### ​Restore tool

The Restore tool lets you revert your database to a specific point in time.
To activate this tool, you must select a retention period in the History Retention option.
You can then restore from any point within that period.

Common uses for the Restore tool include the following:

- Recovering from accidental data deletion or corruption
- Reverting to a previous state for testing or debugging
- Reviewing historical data from a specific point in time

How to access the Restore tool and History Retention setting
Navigate to the  Replit Database tool in your workspace
Select the  Settings tab and scroll to the Restore and History Retention sections

To restore your database to a specific time, follow the steps below:

1. Enter the target date and time in the Timestamp field
1. Select Restore. Select Continue to proceed in the confirmation dialog.

### ​Remove tool

The remove action is irreversible. Make sure to back up any important data before proceeding.

If you no longer need a database for your Replit App, you can remove it and all its data.

How to remove a databaseFrom the Replit Database tool:
Select the  Settings tab
Select Remove database and confirm by selecting Yes, Remove database

### ​Billing and resource usage

Replit optimizes your cost savings for database usage by using Neon, a serverless database provider.

Neon’s serverless capabilities include the following:

- Zero infrastructure setup or maintenance
- Automatic scaling to handle your usage needs
- Compute time billing only when the database is active

The database enters an idle state after five minutes of inactivity, pausing compute time billing.
It instantly reactivates when it receives a query.

To learn more about this serverless database technology, see the
Neon Compute lifecycle documentation.

Replit provides real-time tracking of your database usage.
You can view the breakdown of compute time and storage usage for the current Replit App
or for each Replit App on your account.

How to access database usageTo view your database compute time and storage usage for the current billing period, follow the steps below:From the Replit Database tool:
Navigate to the  Replit Database tool in your workspace
Select the  Settings tab
Scroll to the Account resource usage section to view a usage summary
To view for every Replit App on your account from the Account resource usage section, follow the steps below:
Select View account resource limits to open the Usage page
Scroll to Resource usage section
Expand the PostgresSQL Storage and PostgresSQL Compute rows for details on each Replit App

To learn how Replit charges for database usage, see Deployments and Database Billing.

### ​Security features

When you add a database integration using Agent, it adds an Object-Relational Mapper (ORM)
that handles all database communications with built-in security.

This ORM layer, combined with Agent’s security best practice implementation, protects your app from
exploits through the following features:

- Schema validation: Verifies data conforms to expected formats
- Data sanitization: Automatically cleans up builder input to prevent SQL injection attacks

## ​Next steps

To learn how to connect to a Replit SQL database from code, see Connect your app to a SQL database.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/category/storage-and-databases)

[Production DatabasesLearn how to safely manage and publish database changes in production environments.Next](https://docs.replit.com/cloud-services/storage-and-databases/production-databases)
