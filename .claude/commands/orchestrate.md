---
description: "Orchestrator Agent - routes tasks to specialist agents and enforces workflow gates"
---

# /orchestrate

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="orchestrate")`
3. **Get prompt**: Call `cd_get_prompt("orchestrator", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-orchestrator",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Orchestrate workflow task"
   )
   ```

## Quick Reference

- **Phase**: All phases
- **Agent**: cd-orchestrator
- **Gate required**: none
- **Gate approved on success**: none
