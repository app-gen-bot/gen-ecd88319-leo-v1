# Storage and Databases

**Source:** https://docs.replit.com/category/storage-and-databases  
**Section:** category  
**Scraped:** 2025-09-08 20:22:22

---

Storage and DatabasesStorage and DatabasesCopy pageLearn about file storage and database options on Replit.Copy page

Using Replit’s flexible storage solutions, you can quickly add the perfect
data storage your app needs to run. You can use Replit’s database or object storage
for apps with the following requirements, and Agent can automatically set up and integrate both solutions:

- A game that needs to save player information such as progress or high scores
- A content platform that manages media files

## ​What are Replit’s storage and database options

Replit offers the following data storage options:

- Database: stores structured data such as user profiles, game scores, and product catalogs.
You can store or retrieve data by attributes and relationships between data points.
- App Storage: stores unstructured data such as images, videos, documents.
You can store and retrieve large files and binary data.

### ​App Storage and database comparison

DatabaseApp StorageIdeal data formatStructured data with relationshipsLarge files (images, videos, documents)Data modelTables, rows, columnsBuckets, filesQuery languageSQLREST APIClientsPostgresSQL-compatible clients and ORMsReplit SDKs and GCS client librariesBilling modelPay for compute time and storage spacePay for bandwidth and storage space

### ​Workspace tools

Learn more about the following Replit tools to set up and manage your app’s data storage:

[DatabaseIdeal for structured data and representing data relationships.
Backed by Neon’s serverless PostgresSQL solution that scales with your app.](https://docs.replit.com/cloud-services/storage-and-databases/sql-database)

[App StorageIdeal for unstructured data and large files, such as images, videos, and documents.
Backed by Google Cloud Storage (GCS) for high availability and scalability. Agent can automatically set up App Storage with advanced authentication and access controls.](https://docs.replit.com/cloud-services/storage-and-databases/object-storage)

## ​Getting started

The quickest way to get started with Replit’s storage solutions is to follow one of the tutorials below:

[DatabaseConnect your app to a SQL database](https://docs.replit.com/getting-started/quickstarts/database-connection)

[App Storage in PythonManage App Storage using the Replit Python SDK](https://docs.replit.com/getting-started/quickstarts/object-storage-python)

[App Storage in JavaScriptManage App Storage using the Replit JavaScript SDK](https://docs.replit.com/getting-started/quickstarts/object-storage-javascript)

## ​Use cases

The following examples show how the database and object storage tools can support your Replit Apps.

### ​E-commerce app

Store product information, customer profiles, and order history in the database.
Use SQL queries to filter products by category, search for items, and manage customer orders.

### ​File sharing app

Share large files such as images, videos, and documents using App Storage.
Use the Replit App Storage SDK to upload, download, and move files.

## ​Next steps

- Database: Learn about the database workspace tool and how to connect your Replit App to a database
- App Storage: Learn how to use Replit’s App Storage solution

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/static-deployments-advanced)

[DatabaseReplit Database is a SQL database built-in to your Replit App. It allows you to store and retrieve data for your app and users.Next](https://docs.replit.com/cloud-services/storage-and-databases/sql-database)
