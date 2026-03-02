---
description: "Execute complete feature implementation (Phases 2-5) with TDD and review gates"
argument-hint: "[feature name or continue from context]"
---

# /cycle

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="TDD_CYCLE")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="cycle")`
4. **Get prompt**: Call `cd_get_prompt("cycle-runner", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-cycle-runner",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Run TDD cycle"
   )
   ```
7. **Update state**: On success, call `cd_approve_gate("tdd_complete")`

## Quick Reference

- **Phase**: TDD
- **Agent**: cd-cycle-runner
- **Gate required**: plan_approved
- **Gate approved on success**: tdd_complete
