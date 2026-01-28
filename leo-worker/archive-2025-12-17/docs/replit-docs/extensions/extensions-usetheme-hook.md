# useTheme() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useTheme  
**Section:** extensions  
**Scraped:** 2025-09-08 20:25:53

---

HooksuseTheme() HookCopy pageThe useTheme() hook returns all metadata on the current theme including syntax highlighting, description, HSL, token values, and more.Copy page

## ​Usage

Copy

Ask AI

```
import { useTheme } from '@replit/extensions-react';

const Component = () => {
  const theme = useTheme();

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useThemeValues(): ThemeVersion | null;

```

## ​Types

### ​ThemeVersion

A specific theme version reflecting all colors and metadata on the current theme.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useReplitEffect)

[useThemeValuesThe `useThemeValues()` hook provides you with the global token color values of the current user's theme.Next](https://docs.replit.com/extensions/development/react/hooks/useThemeValues)
