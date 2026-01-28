# Model configuration

**Source:** https://docs.anthropic.com/en/docs/claude-code/model-config
**Retrieved:** 2025-08-30

---

## ​Available models

For the`model`setting in Claude Code, you can either configure:

- A**model alias**
- A full**model name**
- For Bedrock, an ARN

### ​Model aliases

Model aliases provide a convenient way to select model settings without
remembering exact version numbers:

| Model alias | Behavior |
| --- | --- |
| default | Recommended model setting, depending on your account type |
| sonnet | Uses the latest Sonnet model (currently Sonnet 4) for daily coding tasks |
| opus | Uses the most capable Opus model (currently Opus 4.1) for complex reasoning |
| haiku | Uses the fast and efficient Haiku model for simple tasks |
| sonnet[1m] | Uses Sonnet with a1 million token context windowwindow for long sessions |
| opusplan | Special mode that usesopusduring plan mode, then switches tosonnetfor execution |

### ​Setting your model

You can configure your model in several ways, listed in order of priority:

1. **During session**- Use`/model <alias|name>`to switch models mid-session
2. **At startup**- Launch with`claude --model <alias|name>`
3. **Environment variable**- Set`ANTHROPIC_MODEL=<alias|name>`
4. **Settings**- Configure permanently in your settings file using the`model`field.

Example usage:

```bash

# Start with Opus

claude --model opus

# Switch to Sonnet during session

/model sonnet

```

Example settings file:

```
{
    "permissions": {
        ...
    },
    "model": "opus"
}

```

## ​Special model behavior

### ​defaultmodel setting

The behavior of`default`depends on your account type.

For certain Max users, Claude Code will automatically fall back to Sonnet if you
hit a usage threshold with Opus.

### ​opusplanmodel setting

The`opusplan`model alias provides an automated hybrid approach:

- **In plan mode**- Uses`opus`for complex reasoning and architecture
decisions
- **In execution mode**- Automatically switches to`sonnet`for code generation
and implementation

This gives you the best of both worlds: Opus’s superior reasoning for planning,
and Sonnet’s efficiency for execution.

### ​Extended context with [1m]

For Console/API users, the`[1m]`suffix can be added to full model names to
enable a[1 million token context window](https://docs.anthropic.com/en/docs/build-with-claude/context-windows#1m-token-context-window).

```bash

# Example of using a full model name with the [1m] suffix

/model anthropic.claude-sonnet-4-20250514-v1:0[1m]

```

Note: Extended context models have[different pricing](https://docs.anthropic.com/en/docs/about-claude/pricing#long-context-pricing).

## ​Checking your current model

You can see which model you’re currently using in several ways:

1. In[status line](https://docs.anthropic.com/en/docs/claude-code/statusline)(if configured)
2. In`/status`, which also displays your account information.

## ​Environment variables

You can use the following environment variables, which must be full**model
names**, to control the model names that the aliases map to.

| Env var | Description |
| --- | --- |
| ANTHROPIC_DEFAULT_OPUS_MODEL | The model to use foropus, or foropusplanwhen Plan Mode is active. |
| ANTHROPIC_DEFAULT_SONNET_MODEL | The model to use forsonnet, or foropusplanwhen Plan Mode is not active. |
| ANTHROPIC_DEFAULT_HAIKU_MODEL | The model to use forhaiku, orbackground functionality |
| CLAUDE_CODE_SUBAGENT_MODEL | The model to use forsubagents |

Note:`ANTHROPIC_SMALL_FAST_MODEL`is deprecated in favor of`ANTHROPIC_DEFAULT_HAIKU_MODEL`.
[Terminal configuration](https://docs.anthropic.com/en/docs/claude-code/terminal-config)[Memory management](https://docs.anthropic.com/en/docs/claude-code/memory)On this page
- [Available models](https://docs.anthropic.com/en/docs/claude-code/model-config#available-models)
- [Model aliases](https://docs.anthropic.com/en/docs/claude-code/model-config#model-aliases)
- [Setting your model](https://docs.anthropic.com/en/docs/claude-code/model-config#setting-your-model)
- [Special model behavior](https://docs.anthropic.com/en/docs/claude-code/model-config#special-model-behavior)
- [default model setting](https://docs.anthropic.com/en/docs/claude-code/model-config#default-model-setting)
- [opusplan model setting](https://docs.anthropic.com/en/docs/claude-code/model-config#opusplan-model-setting)
- [Extended context with [1m]](https://docs.anthropic.com/en/docs/claude-code/model-config#extended-context-with-%5B1m%5D)
- [Checking your current model](https://docs.anthropic.com/en/docs/claude-code/model-config#checking-your-current-model)
- [Environment variables](https://docs.anthropic.com/en/docs/claude-code/model-config#environment-variables)