# init API

**Source:** https://docs.replit.com/extensions/api/init  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:12

---

API Referenceinit APICopy pageLearn how to initialize a Replit extension, establish a handshake with the Replit App, and manage event listeners using the init() method.Copy page

The init() method initializes the Extension, establishes a handshake with the Replit App, and adds an event listener to the window object. It takes as an argument an object containing optional parameters for the initialization process. It returns a function that removes the event listener added to the window object.

## ​Usage

Copy

Ask AI

```
import { init } from '@replit/extensions';

```

## ​Signature

Copy

Ask AI

```
init(args: ReplitInitArgs): Promise<ReplitInitOutput>

```

## ​Types

### ​HandshakeStatus

An enumerated set of values for the Handshake between the workspace and an extension

PropertyType

### ​ReplitInitArgs

The Replit init() function arguments

PropertyTypetimeout?number

### ​ReplitInitOutput

The output of the Replit init() function

PropertyTypedisposeFunctionstatusHandshakeStatus

### ​HandshakeStatus

An enumerated set of values for the Handshake between the workspace and an extension

Copy

Ask AI

```
Error = 'error'
Loading = 'loading'
Ready = 'ready'

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/manifest)

[Authentication APILearn how to authenticate users securely in your Replit extensions using the auth API module. Get and verify JWT tokens for user authentication.Next](https://docs.replit.com/extensions/api/auth)
