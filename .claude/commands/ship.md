---
description: "Merge completed work to main branch"
argument-hint: "[optional PR title]"
---

# /ship

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="SHIP")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="ship")`
4. **Get prompt**: Call `cd_get_prompt("shipper", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-shipper",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Ship to main branch"
   )
   ```

## Quick Reference

- **Phase**: Ship
- **Agent**: cd-shipper
- **Gate required**: review_approved
- **Gate approved on success**: none
