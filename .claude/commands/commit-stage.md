---
description: "Set up commit stage CI/CD pipeline with test pyramid enforcement"
argument-hint: "[project name or context]"
---

# /commit-stage

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="commit-stage")`
3. **Get prompt**: Call `cd_get_prompt("commit-stage", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-commit-stage",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Set up commit stage"
   )
   ```

## Quick Reference

- **Phase**: CI/CD
- **Agent**: cd-commit-stage
- **Gate required**: none
- **Gate approved on success**: none
