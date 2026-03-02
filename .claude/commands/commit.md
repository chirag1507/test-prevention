---
description: "Create a git commit following conventional commit standards"
argument-hint: "[optional commit description]"
---

# /commit

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="COMMIT")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="commit")`
4. **Get prompt**: Call `cd_get_prompt("committer", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-committer",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Create conventional commit"
   )
   ```

## Quick Reference

- **Phase**: Ship
- **Agent**: cd-committer
- **Gate required**: none
- **Gate approved on success**: none
