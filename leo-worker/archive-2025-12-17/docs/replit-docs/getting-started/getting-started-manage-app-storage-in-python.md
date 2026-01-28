# Manage App Storage in Python

**Source:** https://docs.replit.com/getting-started/quickstarts/object-storage-python  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:21:36

---

Data storageManage App Storage in PythonCopy pageLearn how to use the Python App Storage client library to manage files from your Replit App.Copy page

This guide demonstrates how to use the Python client library to upload, list, download, and delete files in your App Storage bucket.

## ​Create a Python Replit App

1. Select  Create App from the home screen.
1. Navigate to the Choose a Template tab.
1. Type “Python” in the template search field and select it as shown below:
1. Select  Create App.

## ​Install the official client library

To install the client library, follow the one-click setup or package manager instructions below.

- One-click setup
- upm
- pip

1

Access the App Storage tool

1. Navigate to the App Storage tab.
1. Select the  Commands view in the App Storage tab.

The installation screen should resemble the following screenshot:

2

Install the dependencies

1. Select “Python” from the programming language dropdown on the top left.
1. Select Install replit-object-storage package.
1. When completed, the button text should read Package installed.

## ​Create a bucket

Before storing objects, you must create a bucket. Follow the steps below to create a new bucket:

1. Navigate to the App Storage tool
1. Select Create new bucket
1. Enter a name for the bucket in the Name field
1. Select Create bucket

## ​Add and run the example code

1

Locate main.py

Open the  Files tool from the left dock.

Select main.py to open it in a file editor.

2

Add the client code

Copy and paste the following code into main.py:

Copy

Ask AI

```
# Instantiate a Client
from replit.object_storage import Client
client = Client()

# Upload a text file that contains the text "Hello, World!"
client.upload_from_text("file.txt", "Hello World!")

# List the objects in the bucket
objects = client.list()
print("Bucket contents:", objects)

# Retrieve and print the contents of the uploaded file
contents = client.download_as_text("file.txt")
print("file.txt contents: ", contents)

```

3

Run the app

Select Run to execute the example code.

Navigate to the Console tab to view the output, which should resemble the output below:

Copy

Ask AI

```
Bucket contents: [Object(name='file.txt')]
file.txt contents:  Hello World!

```

Confirm that the file.txt object appears in your bucket in the Objects view of the
Object Storage tool.

Reload the page to update the object list if file.txt fails to appear.

## ​Delete the object

To remove the file.txt file from the bucket,

1. Replace the content of main.py with the following code:
CopyAsk AIfrom replit.object_storage import Client
client = Client()

# Delete file.txt from the bucket
client.delete("file.txt")
print("Delete succeeded")
1. Select Run to execute the example code.
1. Navigate to the Console tab to view the output, which should resemble the output below:
CopyAsk AIDelete succeeded
1. Verify that the file.txt object no longer appears in the bucket.

## ​Next steps

To learn more about Replit App Storage, see the following resources:

- App Storage: Learn more about the App Storage feature and workspace tool
- App Storage Python SDK: Learn about the Client class and its methods

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/database-connection)

[App Storage in JavaScriptLearn how to use the JavaScript App Storage client library to manage files from your Replit App.Next](https://docs.replit.com/getting-started/quickstarts/object-storage-javascript)
