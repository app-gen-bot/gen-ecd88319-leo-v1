# fs API

**Source:** https://docs.replit.com/extensions/api/fs  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:18

---

API Referencefs APICopy pageCreate, read, modify, and watch files and directories in your Replit App using the filesystem API methods and types.Copy page

The fs or filesystem API allows you to create, read, and modify files on the replit app’s filesystem.

## ​Usage

Copy

Ask AI

```
import { fs } from '@replit/extensions';

```

## ​Methods

### ​fs.readFile

Reads the file specified at path and returns an object containing the contents, or an object containing an error if there was one. Required permissions: read.

Copy

Ask AI

```
readFile(path: string, encoding: null | "utf8" | "binary"): Promise<{ content: string } | { error: string }>

```

### ​fs.writeFile

Writes the file specified at path with the contents content. Required permissions: read, write-exec.

Copy

Ask AI

```
writeFile(path: string, content: string | Blob): Promise<{ success: boolean } | { error: string }>

```

### ​fs.readDir

Reads the directory specified at path and returns an object containing the contents, or an object containing an error if there was one. Required permissions: read.

Copy

Ask AI

```
readDir(path: string): Promise<{ children: DirectoryChildNode[], error: string }>

```

### ​fs.createDir

Creates a directory at the specified path. Required permissions: read, write-exec.

Copy

Ask AI

```
createDir(path: string): Promise<{ error: null | string, success: boolean }>

```

### ​fs.deleteFile

Deletes the file at the specified path. Required permissions: read, write-exec.

Copy

Ask AI

```
deleteFile(path: string): Promise<{} | { error: string }>

```

### ​fs.deleteDir

Deletes the directory at the specified path. Required permissions: read, write-exec.

Copy

Ask AI

```
deleteDir(path: string): Promise<{} | { error: string }>

```

### ​fs.move

Moves the file or directory at from to to. Required permissions: read, write-exec.

Copy

Ask AI

```
move(path: string, to: string): Promise<{ error: null | string, success: boolean }>

```

### ​fs.copyFile

Copies the file at from to to. Required permissions: read, write-exec.

Copy

Ask AI

```
copyFile(path: string, to: string): Promise<{ error: null | string, success: boolean }>

```

### ​fs.watchFile

Watches the file at path for changes with the provided listeners. Returns a dispose method which cleans up the listeners. Required permissions: read.

Copy

Ask AI

```
watchFile(path: string, listeners: WatchFileListeners<string>, encoding: "utf8" | "binary"): Promise<DisposerFunction>

```

### ​fs.watchDir

Watches file events (move, create, delete) in the specified directory at the given path. Returns a dispose method which cleans up the listeners. Required permissions: read.

Copy

Ask AI

```
watchDir(path: string, listeners: WatchDirListeners): Promise<DisposerFunction>

```

### ​fs.watchTextFile

Watches a text file at path for changes with the provided listeners. Returns a dispose method which cleans up the listeners.

Use this for watching text files, and receive changes as versioned operational transform (OT) operations annotated with their source.

Required permissions: read.

Copy

Ask AI

```
watchTextFile(path: string, listeners: WatchTextFileListeners): Function

```

## ​Types

### ​ChangeEventType

A file change event type

PropertyType

### ​DeleteEvent

Fired when a file is deleted

PropertyTypeeventTypeDeletenodeFsNode

### ​DirectoryChildNode

A directory child node - a file or a folder.

PropertyTypefilenamestringtypeFsNodeType

### ​FsNode

A base interface for nodes, just includes
the type of the node and the path, This interface
does not expose the node’s content/children

PropertyTypepathstringtypeFsNodeType

### ​FsNodeType

A Filesystem node type

PropertyType

### ​MoveEvent

Fired when a file is moved

PropertyTypeeventTypeMovenodeFsNodetostring

### ​TextChange

A written text change for the WriteChange function exposed by WatchTextFileListeners.onReady

PropertyTypefromnumberinsert?stringto?number

### ​TextFileOnChangeEvent

Signifies a change when a text file’s text content is updated

PropertyTypechangesTextChange[]latestContentstring

### ​TextFileReadyEvent

A set of listeners and values exposed by WatchTextFileListeners.onReady

PropertyTypegetLatestContentGetLatestContentinitialContentstringwriteChangeWriteChange

### ​WatchDirListeners

A set of listeners for watching a directory

PropertyTypeonChangeWatchDirOnChangeListeneronErrorWatchDirOnErrorListeneronMoveOrDelete?WatchDirOnMoveOrDeleteListener

### ​WatchFileListeners

A set of listeners for watching a non-text file<T extends string | Blob = string>

PropertyTypeonChangeWatchFileOnChangeListener<T>onError?WatchFileOnErrorListeneronMoveOrDelete?WatchFileOnMoveOrDeleteListener

### ​WatchTextFileListeners

A set of listeners for watching a text file

PropertyTypeonChange?WatchTextFileOnChangeListeneronError?WatchTextFileOnErrorListeneronMoveOrDelete?WatchTextFileOnMoveOrDeleteListeneronReadyWatchTextFileOnReadyListener

### ​ChangeEventType

A file change event type

Copy

Ask AI

```
Create = 'CREATE'
Delete = 'DELETE'
Modify = 'MODIFY'
Move = 'MOVE'

```

### ​FsNodeType

A Filesystem node type

Copy

Ask AI

```
Directory = 'DIRECTORY'
File = 'FILE'

```

### ​DisposerFunction

A cleanup/disposer function (void)

Copy

Ask AI

```
() => void

```

### ​FsNodeArray

Copy

Ask AI

```
Array<FsNode>

```

### ​GetLatestContent

Returns the latest content of a watched file as a string

Copy

Ask AI

```
() => string

```

### ​WatchDirOnChangeListener

Fires when a directory’s child nodes change

Copy

Ask AI

```
(children: FsNodeArray) => void

```

### ​WatchDirOnErrorListener

Fires when watching a directory fails

Copy

Ask AI

```
(err: Error, extraInfo: Record) => void

```

### ​WatchDirOnMoveOrDeleteListener

Fires when a watched directory is moved or deleted

Copy

Ask AI

```
(event: DeleteEvent | MoveEvent) => void

```

### ​WatchFileOnChangeListener

Fires when a non-text file is changed

Copy

Ask AI

```
(newContent: T) => void

```

### ​WatchFileOnErrorListener

Fires when watching a non-text file fails

Copy

Ask AI

```
(error: string) => void

```

### ​WatchFileOnMoveOrDeleteListener

Fires when a non-text file is moved or deleted

Copy

Ask AI

```
(moveOrDeleteEvent: MoveEvent | DeleteEvent) => void

```

### ​WatchTextFileOnChangeListener

Fires when a watched text file’s text content is updated

Copy

Ask AI

```
(changeEvent: TextFileOnChangeEvent) => void

```

### ​WatchTextFileOnErrorListener

Fires when watching a text file fails

Copy

Ask AI

```
(error: string) => void

```

### ​WatchTextFileOnMoveOrDeleteListener

Fires when a watched text file is moved or deleted

Copy

Ask AI

```
(moveOrDeleteEvent: MoveEvent | DeleteEvent) => void

```

### ​WatchTextFileOnReadyListener

Fires when a text file watcher is ready

Copy

Ask AI

```
(readyEvent: TextFileReadyEvent) => void

```

### ​WriteChange

Writes a change to a watched file using the TextChange interface

Copy

Ask AI

```
(changes: TextChange | Array<TextChange>) => void

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/exec)

[Me APIAccess information about the current extension context, including file paths for file handlers and extension-specific data.Next](https://docs.replit.com/extensions/api/me)
