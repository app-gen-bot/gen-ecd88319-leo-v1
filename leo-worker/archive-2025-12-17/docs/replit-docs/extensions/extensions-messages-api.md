# messages API

**Source:** https://docs.replit.com/extensions/api/messages  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:59

---

API Referencemessages APICopy pageDisplay custom toast notifications in the Replit workspace using the messages API to show confirmations, errors, warnings, and notices.Copy page

The messages API allows you to send custom notices in the Replit workspace.

## ​Usage

Copy

Ask AI

```
import { messages } from '@replit/extensions';

```

## ​Methods

### ​messages.showConfirm

Shows a confirmation toast message within the Replit workspace for length milliseconds. Returns the ID of the message as a UUID

Copy

Ask AI

```
showConfirm(str: string, length: number): Promise<string>

```

### ​messages.showError

Shows an error toast message within the Replit workspace for length milliseconds. Returns the ID of the message as a UUID

Copy

Ask AI

```
showError(str: string, length: number): Promise<string>

```

### ​messages.showNotice

Shows a notice toast message within the Replit workspace for length milliseconds. Returns the ID of the message as a UUID

Copy

Ask AI

```
showNotice(str: string, length: number): Promise<string>

```

### ​messages.showWarning

Shows a warning toast message within the Replit workspace for length milliseconds. Returns the ID of the message as a UUID

Copy

Ask AI

```
showWarning(str: string, length: number): Promise<string>

```

### ​messages.hideMessage

Hides a message by its IDs

Copy

Ask AI

```
hideMessage(id: string): Promise<void>

```

### ​messages.hideAllMessages

Hides all toast messages visible on the screens

Copy

Ask AI

```
hideAllMessages(): Promise<void>

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/me)

[ReplDB APILearn how to use ReplDB, a key-value store for Replit Apps, to persist data in your extensions through simple read and write operations.Next](https://docs.replit.com/extensions/api/replDb)
