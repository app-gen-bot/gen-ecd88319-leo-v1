# exec API

**Source:** https://docs.replit.com/extensions/api/exec  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:25

---

API Referenceexec APICopy pageLearn how to run shell commands in Replit Apps using the exec API module. Includes methods for spawning processes and executing commands.Copy page

The exec api module allows you to execute arbitrary shell commands.

## ​Usage

Copy

Ask AI

```
import { exec } from '@replit/extensions';

```

## ​Methods

### ​exec.spawn

Spawns a command, with given arguments and environment variables. Takes in callbacks,
and returns an object containing a promise that resolves when the command exits, and
a dispose function to kill the process.

Copy

Ask AI

```
spawn(options: SpawnOptions): SpawnOutput

```

### ​exec.exec

Executes a command in the shell, with given arguments and environment variables

Copy

Ask AI

```
exec(command: string, options: { env: Record<string, string> }): Promise<ExecResult>

```

## ​Types

### ​BaseSpawnOptions

PropertyTypeargsstring[]env?Record<string, string>splitStderr?boolean

### ​CombinedStderrSpawnOptions

PropertyTypeargsstring[]env?Record<string, string>onOutput?FunctionsplitStderr?false

### ​ExecResult

PropertyTypeexitCodenumberoutputstring

### ​SpawnOutput

PropertyTypedisposeFunctionresultPromisePromise<SpawnResult>

### ​SpawnResult

PropertyTypeerrornull │ stringexitCodenumber

### ​SplitStderrSpawnOptions

PropertyTypeargsstring[]env?Record<string, string>onStdErr?OutputStrCallbackonStdOut?OutputStrCallbacksplitStderrtrue

### ​OutputStrCallback

Copy

Ask AI

```
(output: string) => void

```

### ​SpawnOptions

Copy

Ask AI

```
SplitStderrSpawnOptions | CombinedStderrSpawnOptions

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/editor)

[Filesystem APICreate, read, modify, and watch files and directories in your Replit App using the filesystem API methods and types.Next](https://docs.replit.com/extensions/api/fs)
