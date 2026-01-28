# useWatchTextFile() Hook

**Source:** https://docs.replit.com/extensions/development/react/hooks/useWatchTextFile  
**Section:** extensions  
**Scraped:** 2025-09-08 20:25:41

---

HooksuseWatchTextFile() HookCopy pageThe useWatchTextFile() hook allows you to read and write to the contents of a file at the provided filePath.Copy page

## ​Usage

Copy

Ask AI

```
import { useWatchTextFile } from '@replit/extensions-react';

const Component = () => {
  const { content, watching, watchError, writeChange } = useWatchTextFile({ filePath: "..." });

  ...
}

```

## ​Signature

Copy

Ask AI

```
function useWatchTextFile({
  filePath: string | null | undefined
}): UseWatchTextFileLoading | UseWatchTextFileErrorLike | UseWatchTextFileWatching;

```

## ​Result

PropertyTypeDescriptionstatusUseWatchTextFileStatusThe file watcher’s status. Useful for ensuring the desired file is being watched.contentstring | nullIf watching, the contents of the file located at the provided filePathwatchErrorstring | nullIf an error occurs, the corresponding error messagewriteChangeWriteChange | nullIf watching, a function to update the watched file

## ​Types

### ​TextChange

PropertyTypefromnumberto?numberinsert?string

### ​UseWatchTextFileErrorLike

PropertyTypestatusUseWatchTextFileStatus.Error | UseWatchTextFileStatus.Moved | UseWatchTextFileStatus.DeletedcontentnullwatchErrorstring | nullwriteChangenull

### ​UseWatchTextFileLoading

PropertyTypestatusUseWatchTextFileStatus.LoadingcontentnullwatchErrornullwriteChangenull

### ​UseWatchTextFileWatching

PropertyTypestatusUseWatchTextFileStatus.WatchingcontentstringwatchErrornullwriteChangeWriteChange

## ​UseWatchTextFileStatus

Copy

Ask AI

```
Error = "error",
Loading = "loading",
Watching = "watching",
Moved = "moved",
Deleted = "deleted",

```

### ​WriteChange

Copy

Ask AI

```
(changes: TextChange | Array<TextChange>) => void

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/react/hooks/useThemeValues)

[JSON EditorBuild a custom JSON editor extension for Replit using React and react-json-view to enable structured editing and code folding of JSON files.Next](https://docs.replit.com/extensions/examples/json-editor)
