# commands API

**Source:** https://docs.replit.com/extensions/api/commands  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:47

---

API Referencecommands APICopy pageRegister and manage custom commands for the Replit command bar and other extension points using the commands API module.Copy page

The commands api module allows you to register commands that can be run from the CLUI command bar and other contribution points.

## ​Usage

Copy

Ask AI

```
import { commands } from '@replit/extensions';

```

## ​Methods

### ​commands.add

Adds a command to the command system.

Copy

Ask AI

```
add(__namedParameters: AddCommandArgs): void

```

## ​Types

### ​ActionCommandArgs

Copy

Ask AI

```
undefined

```

### ​BaseCommandArgs

Copy

Ask AI

```
undefined

```

### ​CommandArgs

Copy

Ask AI

```
ActionCommandArgs | ContextCommandArgs

```

### ​CommandFnArgs

Copy

Ask AI

```
undefined

```

### ​CommandProxy

Copy

Ask AI

```
 |

```

### ​CommandsFn

Copy

Ask AI

```
(args: CommandFnArgs) => Promise

```

### ​ContextCommandArgs

Copy

Ask AI

```
undefined

```

### ​CreateCommand

Copy

Ask AI

```
(args: CommandFnArgs) => undefined

```

### ​Run

Copy

Ask AI

```
() => any

```

### ​SerializableValue

Copy

Ask AI

```
string | number | boolean |  | undefined |  |

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/background)

[Data APIAccess Replit's GraphQL API to retrieve user information, Replit App metadata, and other platform data through the Extensions API.Next](https://docs.replit.com/extensions/api/data)
