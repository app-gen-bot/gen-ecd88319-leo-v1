# debug API

**Source:** https://docs.replit.com/extensions/api/debug  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:35

---

API Referencedebug APICopy pageLearn how to use the debug API module to log data, warnings, and errors to the Extension Devtools in Replit extensions.Copy page

The debug api module allows you to log data to the Extension Devtools

## ​Usage

Copy

Ask AI

```
import { debug } from '@replit/extensions';

```

## ​Methods

### ​debug.info

Logs information to the Extension Devtools

Copy

Ask AI

```
info(message: string, data: Data): Promise<void>

```

### ​debug.warn

Logs a warning to the extension devtools

Copy

Ask AI

```
warn(message: string, data: Data): Promise<void>

```

### ​debug.error

Logs an error message to the extension devtools

Copy

Ask AI

```
error(message: string, data: Data): Promise<void>

```

### ​debug.log

Logs information to the Extension Devtools

Copy

Ask AI

```
log(message: string, data: Data): Promise<void>

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/data)

[Editor APIAccess and manage editor preferences in Replit Apps using the editor API module. Get settings like font size, indentation, and code intelligence.Next](https://docs.replit.com/extensions/api/editor)
