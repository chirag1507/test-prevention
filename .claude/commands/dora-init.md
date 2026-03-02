---
description: "Initialize DORA metrics tracking for the project"
argument-hint: "[project name or context]"
---

# /dora-init

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="dora-init")`
3. **Get prompt**: Call `cd_get_prompt("dora-init", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-dora-init",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Initialize DORA metrics"
   )
   ```

## Quick Reference

- **Phase**: Metrics
- **Agent**: cd-dora-init
- **Gate required**: none
- **Gate approved on success**: none
