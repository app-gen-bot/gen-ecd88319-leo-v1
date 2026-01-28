# App Storage Python SDK

**Source:** https://docs.replit.com/reference/object-storage-python-sdk  
**Section:** reference  
**Scraped:** 2025-09-08 20:23:31

---

App StorageApp Storage Python SDKCopy pageThe Replit App Storage Client is the official Python SDK for managing interactions with Replit App Storage. This lets you programmatically copy, delete, upload, and download objects within Replit App Storage buckets.Copy page

This reference guide explains the Client class from the replit-object-storage-python package and provides code examples for its class methods.

## ​Client

The Client class manages interactions with Replit App Storage. This class features methods for performing operations on objects in a bucket.

To import the class from the replit.object_storage package, add the following line to your Python code:

Copy

Ask AI

```
from replit.object_storage import Client

```

Use the following code to create a Client instance that interacts with Replit App Storage:

Copy

Ask AI

```
client = Client()

```

If your app uses multiple buckets, create one Client instance per bucket.

### ​__init__

The init method initializes an instance of the Client class.

Copy

Ask AI

```
def __init__(bucket_id: Optional[str] = None)

```

Argument:

- bucket_id (Optional[str]): The ID of the bucket the client manages. When omitted, the Client uses the default bucket associated with the Replit App or Deployment.

### ​copy

The copy method copies an object within the same bucket. If an object exists in the same location, it overwrites the original.

Copy

Ask AI

```
def copy(object_name: str, dest_object_name: str) -> None

```

Arguments:

- object_name (str) - The full path of the source object.
- dest_object_name (str) - The full path of the object destination.

Raises:

- ObjectNotFoundError - Indicates the source object does not exist at the specified path.

### ​delete

The delete method permanently removes a file from App Storage.

Copy

Ask AI

```
def delete(object_name: str, ignore_not_found: bool = False) -> None

```

Arguments:

- object_name (str) - The name of the object to delete.
- ignore_not_found (bool) - When True, suppress the error if the object does not exist.

Raises:

- ObjectNotFoundError - Indicates the object does not exist.

### ​download_as_bytes

The download_as_bytes method retrieves the contents of a file as bytes.

Copy

Ask AI

```
def download_as_bytes(object_name: str) -> bytes

```

Argument:

- object_name (str) - The name of the object to download.

Returns:

- bytes- The raw byte representation of the object’s contents.

Raises:

- ObjectNotFoundError - Indicates the object does not exist.

### ​download_as_text

The download_as_text method downloads the contents of a file as a str type.

Copy

Ask AI

```
def download_as_text(object_name: str) -> str

```

Argument:

- object_name (str) - The source object name to retrieve.

Returns:

- str: The object’s contents as a UTF-8 encoded string.

Raises:

- ObjectNotFoundError - Indicates the object does not exist.

### ​download_to_filename

Downloads the contents of an object into a file on the local disk.

Copy

Ask AI

```
def download_to_filename(object_name: str, dest_filename: str) -> None

```

Arguments:

- object_name (str) - The name of the source object from App Storage to retrieve.
- dest_filename (str) - The destination filename on local disk.

Raises:

- ObjectNotFoundError - Indicates the object does not exist.

### ​exists

The exists method checks if an object exists.

Copy

Ask AI

```
def exists(object_name: str) -> bool

```

Argument:

- object_name (str) - The name of the object to check for existence.

Returns:

- bool: True if the object exists, False otherwise.

### ​list

The list method lists objects in the Bucket.

Copy

Ask AI

```
def list(end_offset: Optional[str] = None,
         match_glob: Optional[str] = None,
         max_results: Optional[int] = None,
         prefix: Optional[str] = None,
         start_offset: Optional[str] = None) -> List[Object]

```

Arguments:

- end_offset(Optional[str]) - Filter results to objects named lexicographically before end_offset. If start_offset is defined, the objects listed
have names between start_offset (inclusive) and end_offset (exclusive).
- match_glob (Optional[str]) - Use a glob pattern to filter results. For example: “foo*bar” matches “footbar”, “foo baz bar”, and “foobar”.
- max_results (Optional[int]) - The maximum number of results to return in the response.
- prefix (Optional[str]) - Filter results to objects whose names have the specified prefix.
- start_offset (Optional[str]) - Filter results to objects whose names are lexicographically equal to or after start_offset.
When end_offset is set, the objects listed have names between start_offset (inclusive) and end_offset (exclusive).

Returns:

- List(Object): A list of objects matching the given query parameters.

### ​upload_from_filename

Use upload_from_filename() to upload an object from a source file on the local disk to App Storage.

Copy

Ask AI

```
def upload_from_filename(dest_object_name: str, src_filename: str) -> None

```

Arguments:

- dest_object_name(str) - The name of the uploaded file.
- src_filename(str) - The source file to upload.

### ​upload_from_bytes

The upload_from_bytes method uploads an object from bytes data.

Copy

Ask AI

```
def upload_from_bytes(dest_object_name: str, src_data: bytes) -> None

```

Arguments:

- dest_object_name(str) - The name of the object to upload.
- src_data(str) - The bytes data to upload.

### ​upload_from_text

The upload_from_text method uploads an object from a string.

Copy

Ask AI

```
def upload_from_text(dest_object_name: str, src_data: Union[bytes, str]) -> None

```

Arguments:

- dest_object_name(str) - The name of the object to upload.
- src_data(str)- The text data to upload.

### ​Exception types

- When interacting with Replit App Storage using the Client, any method might return one of the following errors:


BucketNotFoundError: Indicates the configured bucket name does not match with any bucket in App Storage.


DefaultBucketError: Indicates missing default bucket configuration.


ForbiddenError: Indicates insufficient permissions to access to the bucket.


TooManyRequestsError: Indicates the operation is rate-limited due to excessive requests.


UnauthorizedError: Indicates authorization restricted access to the operation.

## ​Class method examples

The following sections provide code examples for managing your objects using the Replit App Storage SDK.

### ​Retrieve a file as text

Copy

Ask AI

```
client.download_as_text("file.json")

```

### ​Retrieve raw bytes of a file

Copy

Ask AI

```
client.download_as_bytes("file.png")

```

### ​Download a file to the local filesystem

Copy

Ask AI

```
client.download_to_filename("file.json", dest_filename)

```

### ​List objects in the bucket

Copy

Ask AI

```
client.list()

```

### ​Upload a file from text

Copy

Ask AI

```
client.upload_from_text("file.json", data)

```

### ​Upload a file as bytes

Copy

Ask AI

```
client.upload_from_bytes("file.png", data)

```

### ​Upload a objects from the filesystem

Copy

Ask AI

```
client.upload_from_filename("file.json", src_filename)

```

### ​Delete an object from the bucket

Copy

Ask AI

```
client.delete("file.json")

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/storage-and-databases/object-storage)

[App Storage JavaScript SDKThe Replit App Storage Client is the official JavaScript SDK for managing interactions with Replit App Storage. This lets you programmatically copy, delete, upload, and download files within Replit App Storage buckets.Next](https://docs.replit.com/reference/object-storage-javascript-sdk)
