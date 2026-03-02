---
description: "TDD Green Phase - Write MINIMAL code to pass the failing test"
argument-hint: "[implementation hint]"
---

# /green

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="GREEN")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="green")`
4. **Get prompt**: Call `cd_get_prompt("green", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-green",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Implement to pass test"
   )
   ```

## Quick Reference

- **Phase**: TDD
- **Agent**: cd-green
- **Gate required**: plan_approved
- **Gate approved on success**: none
