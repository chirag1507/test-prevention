---
description: "Define product vision with problem statement, users, and success metrics"
argument-hint: "[product or feature context]"
---

# /vision

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="VISION")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="vision")`
4. **Get prompt**: Call `cd_get_prompt("visionary", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-visionary",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Define product vision"
   )
   ```
7. **Update state**: On success, call `cd_approve_gate("vision_approved")`

## Quick Reference

- **Phase**: Strategy
- **Agent**: cd-visionary
- **Gate required**: none
- **Gate approved on success**: vision_approved
