# useReplit() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useReplit  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:11

---

HooksuseReplit() HookCopy pageThe useReplit() hook establishes the handshake between the Replit and the extension and passes the API wrapper for usage inside a React component.Copy page

## ​Usage

Copy

Ask AI

```
import { useReplit } from '@replit/extensions-react';

const Component = () => {
  const { replit, status, filePath, error } = useReplit();

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useReplit(init?: {
  permissions: Array<string>;
}): UseReplitInitialized | UseReplitPreInitialization | UseReplitFailure;

```

## ​Result

PropertyTypeDescriptionstatusHandshakeStatusA string indicating the status of the handshake between Replit and the Extensionerrorstring | nullIf the handshake has failed, error is a string indicating the error messagefilePathstring | nullIf the handshake has succeeded, filePath points to the current file the user is focusingreplittypeof replitIf the handshake has succeeded, replit is the API wrapper for the entire @replit/extensions module

## ​Types

### ​HandshakeStatus

An enumerated set of values for the handshake status.

KeyValueReady"ready"Error"error"Loading"loading"

### ​UseReplitReady

If the handshake between Replit and the Extension has been established successfully

PropertyTypestatusHandshakeStatus.ReadyerrornullfilePathstringreplittypeof replit

### ​UseReplitLoading

The default handshake status, before initialization has been established.

PropertyTypestatusHandshakeStatus.LoadingerrornullfilePathnullreplitnull

### ​UseReplitFailure

If the handshake has failed.

PropertyTypestatusHandshakeStatus.ErrorerrorstringfilePathnullreplitnull

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/introduction)

[useActiveFileThe useActiveFile() hook returns the file actively focused on by the current user.Next](https://docs.replit.com/extensions/development/react/hooks/useActiveFile)
