# App Storage JavaScript SDK

**Source:** https://docs.replit.com/reference/object-storage-javascript-sdk  
**Section:** reference  
**Scraped:** 2025-09-08 20:23:37

---

App StorageApp Storage JavaScript SDKCopy pageThe Replit App Storage Client is the official JavaScript SDK for managing interactions with Replit App Storage. This lets you programmatically copy, delete, upload, and download files within Replit App Storage buckets.Copy page

This reference guide explains the Client class from the object-storage library and provides code examples for its methods.

## ​Client

The Client class manages interactions with Replit App Storage. This class features methods for performing operations on files in a bucket.

To import the class from the library, add the following line to your JavaScript code:

Copy

Ask AI

```
import { Client } from "@replit/object-storage";

```

Use the following code to create a Client instance that interacts with Replit Object Storage:

Copy

Ask AI

```
const client = new Client();

```

## ​Constructors

constructor

- new Client(options?): Client

Creates a new Client instance to interact with Replit App Storage.

Parameters

NameTypeDescriptionoptions?ClientOptionsConfiguration options for setting up the client.

Returns

Client

## ​Methods

### ​copy

- copy(objectName, destObjectName): Promise<Result<null, RequestError>>

Copies an object within the same bucket.
This method overwrites any existing object at the destination path.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to copy.destObjectNamestringThe full path to copy the object to.

Returns

Promise<Result<null, RequestError>>

### ​delete

- delete(objectName, options?): Promise<Result<null, RequestError>>

Deletes an object from the bucket.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to delete.options?DeleteOptionsConfigurations for the delete operation.

Returns

Promise<Result<null, RequestError>>

### ​downloadAsBytes

- downloadAsBytes(objectName, options?): Promise<Result<Buffer, RequestError>>

Downloads an object and returns its raw contents as a buffer.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to download.options?DownloadOptionsConfigurations for the download operation.

Returns

Promise<Result<Buffer, RequestError>>

### ​downloadAsStream

- downloadAsStream(objectName, options?): Readable

Creates a readable stream of the object’s contents.
The stream emits any errors encountered during the download.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to download.options?DownloadOptionsConfigurations for the download operation.

Returns

Readable

### ​downloadAsText

- downloadAsText(objectName, options?): Promise<Result<string, RequestError>>

Downloads an object and returns its contents as a string.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to download.options?DownloadOptionsConfigurations for the download operation.

Returns

Promise<Result<string, RequestError>>

### ​downloadToFilename

- downloadToFilename(objectName, destFilename, options?): Promise<Result<null, RequestError>>

Downloads an object and saves it to the specified location on the local filesystem.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to download.destFilenamestringThe path on the local filesystem to write the downloaded object to.options?DownloadOptionsConfigurations for the download operation.

Returns

Promise<Result<null, RequestError>>

### ​exists

- exists(objectName): Promise<Result<boolean, RequestError>>

Checks if an object exists in the bucket.

Parameters

NameTypeDescriptionobjectNamestringThe full path of the object to check.

Returns

Promise<Result<boolean, RequestError>>

### ​getBucket

- getBucket(): Promise<Bucket>

Returns

Promise<Bucket>

### ​init

- init(bucketId?): Promise<Bucket>

Parameters

NameTypebucketId?string

Returns

Promise<Bucket>

### ​list

- list(options?): Promise<Result<StorageObject[], RequestError>>

Returns a list of all objects in the bucket.

Parameters

NameTypeDescriptionoptions?ListOptionsConfigurations for the list operation.

Returns

Promise<Result<StorageObject[], RequestError>>

### ​mapUploadOptions

- mapUploadOptions(options?): undefined | UploadOptions

Parameters

NameTypeoptions?UploadOptions

Returns

undefined | UploadOptions

### ​uploadFromBytes

- uploadFromBytes(objectName, contents, options?): Promise<Result<null, RequestError>>

Uploads an object using its in-memory byte representation.
This method overwrites any existing object with the same name.

Parameters

NameTypeDescriptionobjectNamestringThe full destination path of the object.contentsBufferThe raw contents of the object in byte form.options?UploadOptionsConfigurations for the upload operation.

Returns

Promise<Result<null, RequestError>>

### ​uploadFromFilename

- uploadFromFilename(objectName, srcFilename, options?): Promise<Result<null, RequestError>>

Uploads a file from the local filesystem to the bucket.
This method overwrites any existing object with the same name.

Parameters

NameTypeDescriptionobjectNamestringThe full destination path of the object.srcFilenamestringThe path of the file on the local filesystem to upload.options?UploadOptionsConfigurations for the upload operation.

Returns

Promise<Result<null, RequestError>>

### ​uploadFromStream

- uploadFromStream(objectName, stream, options?): Promise<void>

Uploads an object by reading its contents from the provided stream.
The stream emits any errors encountered during the upload. This method overwrites any existing object with the same name.

Parameters

NameTypeDescriptionobjectNamestringThe full destination path of the object.streamReadableA readable stream from which to read the object’s contents.options?UploadOptionsConfigurations for the upload operation.

Returns

Promise<void>

### ​uploadFromText

- uploadFromText(objectName, contents, options?): Promise<Result<null, RequestError>>

Uploads an object using its in-memory text representation.
This method overwrites any existing object with the same name.

Parameters

NameTypeDescriptionobjectNamestringThe full destination path of the object.contentsstringThe contents of the object in text form.options?UploadOptionsConfigurations for the upload operation.

Returns

Promise<Result<null, RequestError>>

## ​Method examples

The following sections provide code examples for managing your files using the Replit Object Storage SDK.

### ​Retrieve an object as text

Copy

Ask AI

```
const { ok, value: textValue, error } = await client.downloadAsText('file.json');
if (!ok) {
    // ... handle error ...
}

```

### ​Retrieve an object as its raw byte representation

Copy

Ask AI

```
const { ok, value: bytesValue, error } = await client.downloadAsBytes('file.png');
if (!ok) {
    // ... handle error ...
}

```

### ​Retrieve an object from a stream

Copy

Ask AI

```
const { ok, value: stream, error } = await client.downloadAsStream('file.json');
if (!ok) {
    // ... handle error ...
}

```

### ​Download an object to the filesystem

Copy

Ask AI

```
const { ok, error } = await client.downloadToFilename('file.json', destFilename);
if (!ok) {
    // ... handle error ...
}

```

### ​List objects in the bucket

Copy

Ask AI

```
const { ok, value, error } = await client.list();
if (!ok) {
    // ... handle error ...
}

```

### ​Upload an object from text

Copy

Ask AI

```
const { ok, error } = await client.uploadFromText('file.json', data);
if (!ok) {
    // ... handle error ...
}

```

### ​Upload an object as bytes

Copy

Ask AI

```
const { ok, error } = await client.uploadFromBytes('file.png', data);
if (!ok) {
    // ... handle error ...
}

```

### ​Upload an object from the filesystem

Copy

Ask AI

```
const { ok, error } = await client.uploadFromFilename('file.json', srcFilename);
if (!ok) {
    // ... handle error ...
}

```

### ​Upload an object from a stream

Copy

Ask AI

```
const { ok, error } = await client.uploadFromStream('file.json', stream);
if (!ok) {
    // ... handle error ...
}

```

### ​Delete an object from the bucket

Copy

Ask AI

```
const { ok, error } = await client.delete('file.json');
if (!ok) {
    // ... handle error ...
}

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/reference/object-storage-python-sdk)

[Key-Value StoreA simple, built-in key-value database for your Replit Apps with no configuration required.Next](https://docs.replit.com/cloud-services/storage-and-databases/replit-database)
