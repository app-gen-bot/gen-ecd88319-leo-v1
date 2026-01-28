# Legacy Stage Archive Targets

Use `git mv` to relocate each item below into `src/app_factory_leonardo_replit/archive/`, preserving internal structure:

- `src/app_factory_leonardo_replit/stages/stage_0_prd.py`
- `src/app_factory_leonardo_replit/stages/stage_1_interaction_spec.py`
- `src/app_factory_leonardo_replit/stages/stage_2_wireframe.py`
- `src/app_factory_leonardo_replit/stages/build_stage_old.py`
- `src/app_factory_leonardo_replit/stages/docs/stage_2_implementation.md`
- `src/app_factory_leonardo_replit/agents/stage_0_orchestrator/`
- `src/app_factory_leonardo_replit/agents/stage_1_interaction_spec/`
- `src/app_factory_leonardo_replit/agents/stage_2_wireframe/`
- `src/app_factory_leonardo_replit/agents/component_analyzer/`
- `src/app_factory_leonardo_replit/initialization/frontend/`

Active code should reference only the remaining directories under `stages/`, `agents/`, and `initialization/` once these moves are complete.
