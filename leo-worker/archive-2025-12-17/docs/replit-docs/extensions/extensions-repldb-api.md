# replDb API

**Source:** https://docs.replit.com/extensions/api/replDb  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:53

---

API ReferencereplDb APICopy pageLearn how to use ReplDB, a key-value store for Replit Apps, to persist data in your extensions through simple read and write operations.Copy page

ReplDB is a simple key-value store available on all replit apps by default. Extensions can use ReplDB to store replit apps specific data.

## ​Usage

Copy

Ask AI

```
import { replDb } from '@replit/extensions';

```

## ​Methods

### ​replDb.set

Sets the value for a given key. Required permissions: repldb:read, repldb:write.

Copy

Ask AI

```
set(args: { key: string, value: any }): Promise<void>

```

### ​replDb.get

Returns a value associated with the given key. Required permissions: repldb:read.

Copy

Ask AI

```
get(args: { key: string }): Promise<string | { error: null | string }>

```

### ​replDb.list

Lists keys in the replDb. Accepts an optional prefix, which filters for keys beginning with the given prefix. Required permissions: repldb:read.

Copy

Ask AI

```
list(args: { prefix: string }): Promise<{ keys: string[] } | { error: string }>

```

### ​replDb.del

Deletes a key in the replDb. Required permissions: repldb:read, repldb:write.

Copy

Ask AI

```
del(args: { key: string }): Promise<void>

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/messages)

[Session APIAccess and manage the current user's coding session in the Replit workspace, including active file tracking and change listeners.Next](https://docs.replit.com/extensions/api/session)
