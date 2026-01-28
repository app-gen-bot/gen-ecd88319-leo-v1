# useReplitEffect() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useReplitEffect  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:06

---

HooksuseReplitEffect() HookCopy pageThe useReplitEffect() hook fires a callback with the replit API wrapper upon the first component render and when its dependency array changes. It is similar in functionality to the useEffect React hook.Copy page

## ​Usage

Copy

Ask AI

```
import { useReplitEffect } from '@replit/extensions-react';

const Component = () => {
  useReplitEffect(async (replit) => {
    ...
  }, [...dependencies]);

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useReplitEffect(
  callback: (typeof replit) => Promise<void>;
  dependencies: Array<any>
): null;

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useIsExtension)

[useThemeThe `useTheme()` hook returns all metadata on the current theme including syntax highlighting, description, HSL, token values, and more.Next](https://docs.replit.com/extensions/development/react/hooks/useTheme)
