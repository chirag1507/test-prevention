---
description: "Initialize a new project with CD-Agent structure and dependencies"
argument-hint: "[project-type: backend, frontend, fullstack]"
---

# /cd-init

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="INITIALIZE")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="cd-init")`
4. **Get prompt**: Call `cd_get_prompt("init", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-init",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Initialize project structure"
   )
   ```

## Quick Reference

- **Phase**: Setup
- **Agent**: cd-init
- **Gate required**: none
- **Gate approved on success**: none
