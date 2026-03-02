---
description: "Show CD-Agent status, available commands, and next steps"
---

# CD-Agent Help & Status

## Steps

1. Call `cd_get_status()` to get the current workflow state
2. Call `cd_get_catalog()` to get available commands and skills

3. Display a formatted summary based on the response:

### If NOT initialized:

```
CD-Agent Status
===============
Project not initialized.

Getting Started:
  1. Run /cd-init [backend|frontend|fullstack] to set up project structure
  2. Run /vision to define what you're building
  3. Run /plan <feature> to break down your first feature

Workflow: idle → vision → plan → atdd → tdd → driver → review → ship

Change Type Shortcuts:
  /bug-fix <description>    Skip vision/plan, start with failing test
  /enhance <description>    Skip vision, start at planning
  /tech-debt <description>  Characterization tests then refactor
```

### If initialized:

```
CD-Agent Status
===============
Phase:       <current phase>
Feature:     <feature name>
Change Type: <feature|bug_fix|enhancement|tech_debt>
Mode:        <current mode>

Gates:
  <show only gates required for the current change type>
  <icon> vision_approved     (skipped for bug_fix, tech_debt)
  <icon> plan_approved
  <icon> atdd_approved       (skipped for bug_fix, tech_debt)
  <icon> tdd_complete
  <icon> driver_complete     (skipped for bug_fix, tech_debt)
  <icon> review_approved

Next Action: <next action from status>

Available Commands:
  <list commands relevant to current phase>
```

4. Show phase-specific command suggestions:
   - **idle**: `/vision`, `/plan`, `/spike`, `/bug-fix`, `/enhance`, `/tech-debt`
   - **vision**: `/vision`, `/plan`
   - **plan**: `/plan`, `/acceptance-test`
   - **atdd**: `/acceptance-test`, `/dsl`, `/driver`
   - **tdd**: `/red`, `/green`, `/refactor`, `/cycle`, `/layer`
   - **driver**: `/driver`
   - **review**: `/code-review`, `/commit`
   - **ship**: `/ship`, `/commit`

5. Show change type gate requirements:
   - **feature** (default): All 6 gates
   - **bug_fix**: plan_approved → tdd_complete → review_approved (3 gates)
   - **enhancement**: plan_approved → atdd_approved → tdd_complete → driver_complete → review_approved (5 gates)
   - **tech_debt**: plan_approved → tdd_complete → review_approved (3 gates)
