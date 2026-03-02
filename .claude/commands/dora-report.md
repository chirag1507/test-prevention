---
description: "Display DORA metrics report for the project"
argument-hint: "[time range or metric focus]"
---

# /dora-report

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="dora-report")`
3. **Get prompt**: Call `cd_get_prompt("dora-reporter", context={from state})`
4. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
5. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-dora-reporter",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Generate DORA report"
   )
   ```

## Quick Reference

- **Phase**: Metrics
- **Agent**: cd-dora-reporter
- **Gate required**: none
- **Gate approved on success**: none
