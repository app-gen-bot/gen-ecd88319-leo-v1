# useThemeValues() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useThemeValues  
**Section:** extensions  
**Scraped:** 2025-09-08 20:25:46

---

HooksuseThemeValues() HookCopy pageThe useThemeValues() hook provides you with the global token color values of the current user’s theme.Copy page

## ​Usage

Copy

Ask AI

```
import { useThemeValues } from '@replit/extensions-react';

const Component = () => {
  const themeValues = useThemeValues();

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useThemeValues(): ThemeValuesGlobal | null;

```

## ​Types

### ​ThemeValuesGlobal

Replit’s global theme token values for UI, excluding syntax highlighting.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useTheme)

[useWatchTextFileThe `useWatchTextFile()` hook allows you to read and write to the contents of a file at the provided `filePath`.Next](https://docs.replit.com/extensions/development/react/hooks/useWatchTextFile)
