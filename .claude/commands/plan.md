---
description: "Create implementation plan using Example Mapping and behavioral analysis"
argument-hint: "<feature description, user story, or JIRA ticket>"
---

# /plan

## Dispatch

1. **Check state**: Call `cd_read_state()` to get current workflow state
2. **Validate gates**: Call `cd_check_gate(intent="PLAN")`
   - If blocked: Display the error_message and stop
3. **Get routing**: Call `cd_dispatch(user_input="$ARGUMENTS", current_command="plan")`
4. **Get prompt**: Call `cd_get_prompt("planner", context={from state})`
5. **Load skills**: For each skill in `skills_to_load`, call `cd_get_skill("{skill-key}")`
6. **Dispatch agent**:
   ```
   Task(
     subagent_type="cd-planner",
     prompt=<system_prompt + skill_content + "$ARGUMENTS">,
     description="Create implementation plan"
   )
   ```
7. **Update state**: On success, call `cd_approve_gate("plan_approved")`

## Quick Reference

- **Phase**: Discovery
- **Agent**: cd-planner
- **Gate required**: vision_approved
- **Gate approved on success**: plan_approved
