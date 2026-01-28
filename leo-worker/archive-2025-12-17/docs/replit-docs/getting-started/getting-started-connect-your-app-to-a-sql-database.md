# Connect your app to a SQL database

**Source:** https://docs.replit.com/getting-started/quickstarts/database-connection  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:21:54

---

Data storageConnect your app to a SQL databaseCopy pageLearn how to connect to your Replit database from your Replit App.Copy page

This guide shows you how to connect to your Replit App’s database
from your code using the connection methods:

- Direct connection: Connection for development and lighter workloads
- Connection pooling: Efficient connection management for high-traffic production applications

To determine which type of connection you need, see
Choosing your driver and connection type
in the Neon documentation.

Use Agent or Assistant to generate code that connects to your existing database.

## ​Prerequisites

Before getting started, make sure you have the following:

- Created a database in your Replit App
- Knowledge of coding and database connection management

## ​Create a connection script

This tutorial does not provide examples for all programming languages.
Use PostgresSQL driver documentation for your project’s programming language
or ask Assistant to translate the code examples.

1

Create a directory for your connection script

Create a directory at the top level of your project called scripts.

2

Create a connection script

Create a file in this directory and paste one of the following connection examples.

Direct connection examplesJavaScriptPythonCopyAsk AIconst { Client } = require('pg')

async function queryDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  const client = new Client({ connectionString: databaseUrl })

  try {
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE active = true')
    return result.rows
  } finally {
    await client.end()
  }
}

queryDatabase()
  .then(rows => console.log(rows))
  .catch(err => console.error(err))

Pooled connection examplesJavaScriptPythonCopyAsk AIconst { Pool } = require('pg')

async function queryDatabasePool() {
  const databaseUrl = process.env.DATABASE_URL
  // changes the URL to use the Neon's connection pooler
  const poolUrl = databaseUrl.replace('.us-east-2', '-pooler.us-east-2')
  const pool = new Pool({
    connectionString: poolUrl,
    max: 10
  })

  try {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT * FROM users WHERE active = true')
      return result.rows
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

queryDatabasePool()
  .then(rows => console.log(rows))
  .catch(err => console.error(err))

## ​Create a workflow to run your script

Your workflow may vary depending on the language you chose and the file path of the script you created.

1

Add a new workflow

Navigate to the Workflows tool and select New Workflow to add a workflow.
In the Workflow field, enter “test connection” as the name.

2

Create a command to run the script

Select Execute Shell Command under the Tasks heading. Add a command to run the script you created in the line below it.

The following screenshot shows the “test connection” workflow configured to run a JavaScript connection example:

3

Run the workflow

Select the arrow to the left of the workflow name to run it.

4

View the output

Navigate to the Console tool, where you should see a data from your users table, if any exists.

## ​Next steps

To learn more about working with databases in Replit, see the following resources:

- Database: learn how to create and manage a SQL database using the Replit Database tool.
- Workflows: learn how to create and run custom workflows.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/ai-slack-channel-summarizer)

[App Storage in PythonLearn how to use the Python App Storage client library to manage files from your Replit App.Next](https://docs.replit.com/getting-started/quickstarts/object-storage-python)
