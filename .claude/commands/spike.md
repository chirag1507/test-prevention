---
description: "Technical exploration - disposable code for learning"
argument-hint: "<technical question to explore>"
---

# /spike

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="SPIKE")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="spike")`
4. **Get prompt**: Call `cd_get_prompt("spiker", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-spiker",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Technical spike exploration"
   )
   ```

## Quick Reference

- **Phase**: Exploration
- **Agent**: cd-spiker
- **Gate required**: none (bypass)
- **Gate approved on success**: none
