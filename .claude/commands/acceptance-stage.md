---
description: "Set up acceptance stage workflow with version-based test execution"
argument-hint: "[project name or context]"
---

# /acceptance-stage

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="acceptance-stage")`
3. **Get prompt**: Call `cd_get_prompt("acceptance-stage", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-acceptance-stage",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Set up acceptance stage"
   )
   ```

## Quick Reference

- **Phase**: CI/CD
- **Agent**: cd-acceptance-stage
- **Gate required**: none
- **Gate approved on success**: none
