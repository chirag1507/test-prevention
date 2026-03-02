---
description: "TDD Refactor Phase - Improve code structure while keeping tests green"
argument-hint: "[refactoring focus]"
---

# /refactor

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="REFACTOR")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="refactor")`
4. **Get prompt**: Call `cd_get_prompt("refactorer", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-refactorer",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Refactor with green tests"
   )
   ```

## Quick Reference

- **Phase**: TDD
- **Agent**: cd-refactorer
- **Gate required**: plan_approved
- **Gate approved on success**: none
