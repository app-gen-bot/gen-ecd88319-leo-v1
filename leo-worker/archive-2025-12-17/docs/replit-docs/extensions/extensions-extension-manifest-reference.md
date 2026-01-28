# Extension manifest reference

**Source:** https://docs.replit.com/extensions/api/manifest  
**Section:** extensions  
**Scraped:** 2025-09-08 20:13:54

---

API ReferenceExtension manifest referenceCopy pageLearn how to configure your Replit Extension with the extension.json manifest file. View required fields, optional properties, and supported types.Copy page

The extension.json file contains the manifest for an Extension and needs to be placed in a public directory such that it is served at the root (/extension.json). You are required to provide a manifest file to publish an Extension to the Extensions Store.

## ​Properties

PropertyTypeDescriptionnamestringRequired. The Extension’s name. Length can be 1-60 characters.descriptionstringRequired. The Extension’s description. Length can be 1-255 characters.longDescription?stringOptional. The Extension’s longer description. Markdown is supported and recommended.icon?stringOptional. The Extension’s icon. This is a reference to a file on the replit app. Any web based image format is accepted, but SVGs are preferred.tags?string[]Optional. A list of tags that describe the extension.coverImages?CoverImage[]Optional. A Cover Image belonging to an Extension. Max 4 coverImages per extension.website?stringOptional. The Extension’s websiteauthorEmail?stringOptional. The email address of the extension author. This is made publicfileHandlers?FileHandler[]Optional. An array of file handlers registered by the extension.tools?Tool[]Optional. An array of tools registered by the extension.scopes?Scope[]Optional. An array of scopes required by the extension.background?BackgroundPageOptional. A path to a background script

## ​Types

### ​CoverImage

A Cover Image belonging to your extension. Currently, only the first image will be used in the extension store. The path should reference an image file on the Replit App’s file system.

PropertyTypeDescriptionpathstringThe path to the image. This is relative to the statically served rootlabelstringThe label of the image. This is used as the alt text for the image

### ​FileHandler

A file handler is a custom user experience around a particular file in the Workspace, in the form of a Pane.

PropertyTypeDescriptionglobstringA glob pattern that matches the files that this handler should be used forhandlerstringThe path to the handler. This is relative to the statically served root.name?stringOptional. Required if more than one file handler is registered. Fallback value is the extension’s name.icon?stringOptional. Required if more than one file handler is registered. Fallback value is the extension’s icon.

### ​Tool

A tool is a custom user experience in the Workspace, in the form of a Pane.

PropertyTypeDescriptionhandlerstringThe path to the handler. This is relative to the statically served root.name?stringOptional. Required if more than one tool is registered. Fallback value is the extension’s name.icon?stringOptional. Required if more than one tool is registered. Fallback value is the extension’s icon.

### ​Scope

Scopes/Permissions required by the extension.

PropertyTypeDescriptionnameScopeTypeThe name of the scopereasonstringThe reason why the extension needs this scope

### ​ScopeType

- read - Read any file in a Replit App
- write-exec - Write to any file, and execute any code or shell command in a Replit App
- repldb:read - Read all data in the key-value ReplDB in a Replit App
- repldb:write - Write or delete any key in the key-value ReplDB in a Replit App
- experimental-api - Use experimental APIs that may be unstable, may change in behavior or be removed entirely

Copy

Ask AI

```
"read" | "write-exec" | "repldb:read" | "repldb:write" | "experimental-api"

```

### ​BackgroundPage

The path to a specified route that will run a background script.

Copy

Ask AI

```
{
  page: string;
}

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/examples/javascript-commands)

[Initialization APILearn how to initialize a Replit extension, establish a handshake with the Replit App, and manage event listeners using the init() method.Next](https://docs.replit.com/extensions/api/init)
