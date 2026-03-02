---
description: "Implement a full layer - all tests first, then all production code"
argument-hint: "[layer: domain | application | infrastructure | presentation]"
---

# /layer

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="LAYER")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="layer")`
4. **Get prompt**: Call `cd_get_prompt("layer", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-layer",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Implement layer: all tests first, then production code"
   )
   ```

## Quick Reference

- **Phase**: TDD
- **Agent**: cd-layer
- **Gate required**: plan_approved
- **Gate approved on success**: none
