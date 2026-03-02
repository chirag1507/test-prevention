---
description: "Analyze test effectiveness with mutation testing"
argument-hint: "<branch or files to analyze>"
---

# /mutation-testing

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="MUTATION_TEST")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="mutation-testing")`
4. **Get prompt**: Call `cd_get_prompt("mutation-tester", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-mutation-tester",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Mutation testing analysis"
   )
   ```

## Quick Reference

- **Phase**: Quality (analysis)
- **Agent**: cd-mutation-tester
- **Gate required**: none (bypass)
- **Gate approved on success**: none
