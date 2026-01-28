# useIsExtension() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useIsExtension  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:16

---

HooksuseIsExtension() HookCopy pageThe useIsExtension() hook returns whether the handshake has been successfully established with the Replit workspace. If the handshake is loading, undefined will be returned. After loading has finished, the hook will return a boolean.Copy page

## ​Usage

Copy

Ask AI

```
import { useIsExtension } from '@replit/extensions-react';

const Component = () => {
  const isExtension = useIsExtension();

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useIsExtension(): boolean | undefined;

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useActiveFile)

[useReplitEffectThe `useReplitEffect()` hook fires a callback with the `replit` API wrapper upon the first component render and when its dependency array changes. It is similar in functionality to the `useEffect` React hook.Next](https://docs.replit.com/extensions/development/react/hooks/useReplitEffect)
