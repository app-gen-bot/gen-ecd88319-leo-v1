# editor API

**Source:** https://docs.replit.com/extensions/api/editor  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:30

---

API Referenceeditor APICopy pageAccess and manage editor preferences in Replit Apps using the editor API module. Get settings like font size, indentation, and code intelligence.Copy page

The editor api module allows you to get the current user’s editor preferences.

## ​Usage

Copy

Ask AI

```
import { experimental } from '@replit/extensions';
const { editor } = experimental;

```

## ​Methods

### ​editor.getPreferences

Returns the current user’s editor preferences.

Copy

Ask AI

```
getPreferences(): Promise<EditorPreferences>

```

## ​Types

### ​EditorPreferences

Editor Preferences

PropertyType__typenamestringcodeIntelligencebooleancodeSuggestionbooleanfontSizenumberindentIsSpacesbooleanindentSizenumberkeyboardHandlerstringminimapDisplaystringmultiselectModifierKeystringwrappingboolean

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/debug)

[Exec  APILearn how to run shell commands in Replit Apps using the exec API module. Includes methods for spawning processes and executing commands.Next](https://docs.replit.com/extensions/api/exec)
