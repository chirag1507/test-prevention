---
description: "Review code for XP/CD best practices and Clean Architecture"
argument-hint: "[file path or PR number]"
---

# /code-review

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="CODE_REVIEW")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="code-review")`
4. **Get prompt**: Call `cd_get_prompt("reviewer", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-reviewer",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Review code quality"
   )
   ```
7. **Update state**: On success, call `cd_approve_gate("review_approved")`

## Quick Reference

- **Phase**: Quality
- **Agent**: cd-reviewer
- **Gate required**: tdd_complete
- **Gate approved on success**: review_approved
