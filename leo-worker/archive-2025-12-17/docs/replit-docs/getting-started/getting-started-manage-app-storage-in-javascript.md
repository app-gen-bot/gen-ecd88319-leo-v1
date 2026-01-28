# Manage App Storage in JavaScript

**Source:** https://docs.replit.com/getting-started/quickstarts/object-storage-javascript  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:21:42

---

Data storageManage App Storage in JavaScriptCopy pageLearn how to use the JavaScript App Storage client library to manage files from your Replit App.Copy page

This guide demonstrates how to use the JavaScript client library to upload, list, download, and delete files in your App Storage bucket.

This client library, written in TypeScript, can be used for projects that use JavaScript runtimes such as Bun, Deno, and Node.js 14 and later.

## ​Create a TypeScript Replit App

1. Select  Create App from the home screen.
1. Navigate to the Choose a Template tab.
1. Type “TypeScript” in the template search field and select it as shown below:
1. Select  Create App.

## ​Install the official client library

To install the client library, follow the one-click setup or package manager instructions below.

- One-click setup
- npm
- yarn

1

Access the App Storage tool

1. Navigate to the App Storage tab.
1. Select the  Commands view in the App Storage tab.

The installation screen should resemble the following screenshot:

2

Install the dependencies

1. Select “JavaScript” from the programming language dropdown on the top left.
1. Select Install @replit/object-storage package.
1. When completed, the button text should read Package installed.

## ​Create a bucket

Before storing files, you must create a bucket. Follow the steps below to create a new bucket:

1. Navigate to the App Storage tool
1. Select Create new bucket
1. Enter a name for the bucket in the Name field
1. Select Create bucket

## ​Add and run the example code

1

Locate index.ts

Open the  Files tool from the left dock.

Select index.ts to open it in a file editor.

2

Add the client code

Replace the contents of index.ts with the following code:

Copy

Ask AI

```
import { Client } from "@replit/object-storage";
const client = new Client();

// Upload a text file that contains the text "Hello, World!"
const { ok: uploadOk, error: uploadError } = await client.uploadFromText(
  "file.txt",
  "Hello World!",
);
if (!uploadOk) console.error("Upload failed:", uploadError);

// List the files in the bucket
const { ok: listOk, value: listValue, error: listError } = await client.list();
if (!listOk) console.error("List failed:", listError);
else console.log("Bucket contents:", listValue);

// Retrieve and print the contents of the uploaded file
const {
  ok: downloadOk,
  value,
  error: downloadError,
} = await client.downloadAsText("file.txt");
if (!downloadOk) console.error("Download failed:", downloadError);
else console.log("file.txt contents:", value);

```

3

Run the app

Select Run to execute the example code.

Navigate to the Console tab to view the output, which should resemble the output below:

Copy

Ask AI

```
Bucket contents: [ { name: 'file.txt' } ]
file.txt contents: Hello World!

```

Confirm that the file.txt file appears in your bucket in the Objects view of the
App Storage tool.

Reload the page to update the object list if file.txt fails to appear.

## ​Delete the object

To remove the file.txt file from the bucket,

1. Replace the content of index.ts with the following code:
CopyAsk AIimport { Client } from "@replit/object-storage";
const client = new Client();

// Delete file.txt from the bucket
const { ok: deleteOk, error: deleteError } = await client.delete("file.txt");
if (!deleteOk) console.error("Delete failed:", deleteError);
else console.log("Delete succeeded");
1. Select Run to execute the example code.
1. Navigate to the Console tab to view the output, which should resemble the output below:
CopyAsk AIDelete succeeded
1. Verify that the file.txt object no longer appears in the bucket.

## ​Next steps

To learn more about Replit App Storage, see the following resources:

- App Storage: Learn more about the App Storage feature and workspace tool
- App Storage JavaScript SDK: Learn about the Client class and its methods

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/object-storage-python)

[Add a Replit BadgeAdd, customize, and embed a Replit Badge in your Replit App to showcase your project and link back to your cover page.Next](https://docs.replit.com/additional-resources/add-a-made-with-replit-badge-to-your-app)
