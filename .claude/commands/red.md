---
description: "TDD Red Phase - Write ONE failing test"
argument-hint: "[behavior to test]"
---

# /red

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="RED")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="red")`
4. **Get prompt**: Call `cd_get_prompt("red", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-red",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Write failing test"
   )
   ```

## Quick Reference

- **Phase**: TDD
- **Agent**: cd-red
- **Gate required**: plan_approved
- **Gate approved on success**: none
