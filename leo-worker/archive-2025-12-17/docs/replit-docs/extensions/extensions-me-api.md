# me API

**Source:** https://docs.replit.com/extensions/api/me  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:06

---

API Referenceme APICopy pageAccess information about the current extension context, including file paths for file handlers and extension-specific data.Copy page

The me api module exposes information specific to the current extension.

## ​Usage

Copy

Ask AI

```
import { me } from '@replit/extensions';

```

## ​Methods

### ​me.filePath

Returns the path to the current file the extension is opened with, if it is a File Handler.

Copy

Ask AI

```
filePath(): Promise<string>

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/fs)

[Messages APIDisplay custom toast notifications in the Replit workspace using the messages API to show confirmations, errors, warnings, and notices.Next](https://docs.replit.com/extensions/api/messages)
