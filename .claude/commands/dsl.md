---
description: "Implement Domain Specific Language for acceptance tests"
argument-hint: "[DSL method or domain to implement]"
---

# /dsl

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="DSL")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="dsl")`
4. **Get prompt**: Call `cd_get_prompt("dsl-builder", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-dsl-builder",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Build DSL layer"
   )
   ```

## Quick Reference

- **Phase**: ATDD
- **Agent**: cd-dsl-builder
- **Gate required**: plan_approved
- **Gate approved on success**: none
