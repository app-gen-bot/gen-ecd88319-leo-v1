# Target Container File Structure

Optimal file layout for the Leo container.

---

## Top Level

```
/app/                       # Leo (app-generator)
├── leo_container/          # WSI client, managers (entry point)
├── src/                    # app_factory_leonardo_replit (agents)
├── vendor/                 # cc-agent, cc-tools
├── docs/                   # Pipeline prompts
├── .claude/                # Claude config
└── apps/.claude/           # Skills for generated apps

/workspace/                 # Generation workspace
├── app/                    # Generated app (pushed to GitHub)
│   └── .git
└── leo-artifacts/          # Logs, sessions, checkpoints (pushed to GitHub)
    └── .git
```

---

## Session Storage

### Leo
```
/workspace/app/.agent_session.json
```

### Claude
```
/home/leouser/.claude/
├── projects/-workspace-app/
│   ├── {session-uuid}.jsonl
│   └── agent-{short-id}.jsonl
└── todos/{session-uuid}-agent-{uuid}.json
```

> **TODO**: Remove `{app_name}` from all container paths.
>
> Current: `/workspace/app/{app_name}/app/`
> Target: `/workspace/app/`
>
> Files to change in `leo_container/wsi_client/client.py`:
> - Line 664: `_clone_from_github()` - `output_dir = os.path.join(self.workspace, "app", app_name)`
> - Line 955: new app generation - `app_dir = os.path.join(output_dir, message.app_name, "app")`


