# session API

**Source:** https://docs.replit.com/extensions/api/session  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:46

---

API Referencesession APICopy pageAccess and manage the current user’s coding session in the Replit workspace, including active file tracking and change listeners.Copy page

The session api provides you with information on the current user’s coding session in the workspace.

## ​Usage

Copy

Ask AI

```
import { session } from '@replit/extensions';

```

## ​Methods

### ​session.onActiveFileChange

Sets up a listener to handle when the active file is changed

Copy

Ask AI

```
onActiveFileChange(listener: OnActiveFileChangeListener): DisposerFunction

```

### ​session.getActiveFile

Returns the current file the user is focusing

Copy

Ask AI

```
getActiveFile(): Promise<null | string>

```

## ​Types

### ​DisposerFunction

A cleanup/disposer function (void)

Copy

Ask AI

```
() => void

```

### ​OnActiveFileChangeListener

Fires when the current user switches to a different file/tool in the workspace.  Returns null if the current file/tool cannot be found in the filesystem.

Copy

Ask AI

```
(file: string | ) => void

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/replDb)

[Themes APIAccess and utilize theme data and color tokens in your Replit extensions. Get current theme values and listen for theme changes.Next](https://docs.replit.com/extensions/api/themes)
