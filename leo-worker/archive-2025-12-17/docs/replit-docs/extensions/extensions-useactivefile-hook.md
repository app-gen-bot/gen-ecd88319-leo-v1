# useActiveFile() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useActiveFile  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:22

---

HooksuseActiveFile() HookCopy pageThe useActiveFile() hook returns the file actively focused on by the current user.Copy page

## ​Usage

Copy

Ask AI

```
import { useActiveFile } from "@replit/extensions-react";

const Component = () => {
  const activeFile = useActiveFile();

  return (
    <>
      <span>Active File: {activeFile}</span>
    </>
  );
};

```

## ​Signature

Copy

Ask AI

```
function useActiveFile(): string | null;

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useReplit)

[useIsExtensionThe `useIsExtension()` hook returns whether the handshake has been successfully established with the Replit workspace. If the handshake is loading, `undefined` will be returned. After loading has finished, the hook will return a boolean.Next](https://docs.replit.com/extensions/development/react/hooks/useIsExtension)
