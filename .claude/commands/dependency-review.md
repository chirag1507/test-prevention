---
description: "Review dependencies and generate gradual update plan"
---

# /dependency-review

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="dependency-review")`
3. **Get prompt**: Call `cd_get_prompt("dependency-reviewer", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-dependency-reviewer",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Review project dependencies"
   )
   ```

## Quick Reference

- **Phase**: Maintenance
- **Agent**: cd-dependency-reviewer
- **Gate required**: none
- **Gate approved on success**: none
