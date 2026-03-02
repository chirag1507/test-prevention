---
description: "Implement Protocol Driver for acceptance tests"
argument-hint: "[driver type: ui, api, or specific channel]"
---

# /driver

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="DRIVER")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="driver")`
4. **Get prompt**: Call `cd_get_prompt("driver-builder", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-driver-builder",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Build protocol driver"
   )
   ```
7. **Update state**: On success, call `cd_approve_gate("driver_complete")`

## Quick Reference

- **Phase**: ATDD
- **Agent**: cd-driver-builder
- **Gate required**: atdd_approved
- **Gate approved on success**: driver_complete
