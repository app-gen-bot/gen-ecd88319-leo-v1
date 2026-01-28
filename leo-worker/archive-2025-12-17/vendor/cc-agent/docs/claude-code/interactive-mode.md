# Interactive mode

**Source:** https://docs.anthropic.com/en/docs/claude-code/interactive-mode
**Retrieved:** 2025-07-04

---

## ​Keyboard shortcuts

### ​General controls

| Shortcut | Description | Context |
| --- | --- | --- |
| Ctrl+C | Cancel current input or generation | Standard interrupt |
| Ctrl+D | Exit Claude Code session | EOF signal |
| Ctrl+L | Clear terminal screen | Keeps conversation history |
| Up/Down arrows | Navigate command history | Recall previous inputs |
| Esc+Esc | Edit previous message | Double-escape to modify |

### ​Multiline input

| Method | Shortcut | Context |
| --- | --- | --- |
| Quick escape | \+Enter | Works in all terminals |
| macOS default | Option+Enter | Default on macOS |
| Terminal setup | Shift+Enter | After/terminal-setup |
| Paste mode | Paste directly | For code blocks, logs |

### ​Quick commands

| Shortcut | Description | Notes |
| --- | --- | --- |
| #at start | Memory shortcut - add to CLAUDE.md | Prompts for file selection |
| /at start | Slash command | Seeslash commands |

## ​Vim mode

Enable vim-style editing with`/vim`command or configure permanently via`/config`.

### ​Mode switching

| Command | Action | From mode |
| --- | --- | --- |
| Esc | Enter NORMAL mode | INSERT |
| i | Insert before cursor | NORMAL |
| I | Insert at beginning of line | NORMAL |
| a | Insert after cursor | NORMAL |
| A | Insert at end of line | NORMAL |
| o | Open line below | NORMAL |
| O | Open line above | NORMAL |

### ​Navigation (NORMAL mode)

| Command | Action |
| --- | --- |
| h/j/k/l | Move left/down/up/right |
| w | Next word |
| e | End of word |
| b | Previous word |
| 0 | Beginning of line |
| $ | End of line |
| ^ | First non-blank character |
| gg | Beginning of input |
| G | End of input |

### ​Editing (NORMAL mode)

| Command | Action |
| --- | --- |
| x | Delete character |
| dd | Delete line |
| D | Delete to end of line |
| dw/de/db | Delete word/to end/back |
| cc | Change line |
| C | Change to end of line |
| cw/ce/cb | Change word/to end/back |
| . | Repeat last change |

Configure your preferred line break behavior in terminal settings. Run`/terminal-setup`to install Shift+Enter binding for iTerm2 and VSCode terminals.

## ​Command history

Claude Code maintains command history for the current session:

- History is stored per working directory
- Cleared with`/clear`command
- Use Up/Down arrows to navigate (see keyboard shortcuts above)
- **Ctrl+R**: Reverse search through history (if supported by terminal)
- **Note**: History expansion (`!`) is disabled by default

## ​See also

- [Slash commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands)- Interactive session commands
- [CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)- Command-line flags and options
- [Settings](https://docs.anthropic.com/en/docs/claude-code/settings)- Configuration options
- [Memory management](https://docs.anthropic.com/en/docs/claude-code/memory)- Managing CLAUDE.md files
[CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)[Slash commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands)On this page
- [Keyboard shortcuts](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#keyboard-shortcuts)
- [General controls](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#general-controls)
- [Multiline input](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#multiline-input)
- [Quick commands](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#quick-commands)
- [Vim mode](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#vim-mode)
- [Mode switching](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#mode-switching)
- [Navigation (NORMAL mode)](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#navigation-normal-mode)
- [Editing (NORMAL mode)](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#editing-normal-mode)
- [Command history](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#command-history)
- [See also](https://docs.anthropic.com/en/docs/claude-code/interactive-mode#see-also)