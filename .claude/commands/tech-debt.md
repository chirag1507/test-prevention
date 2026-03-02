---
description: "Tech debt workflow - characterization tests first, then refactor"
argument-hint: <description of the tech debt to address>
---

# Tech Debt Workflow

Use the CD-Agent MCP tools to start a tech debt workflow.

## Steps

1. Call `cd_dispatch` with intent "tech-debt" and the user's tech debt description
2. The dispatch tool will:
   - Set change_type to "tech_debt"
   - Auto-approve vision_approved, atdd_approved, driver_complete (skipped gates)
   - Set phase to "plan"
   - Return the tech-debt agent prompt
3. Follow the returned prompt to guide the user through:
   - Plan: identify scope, understand current structure
   - TDD: write characterization tests to lock current behavior, then refactor
   - Review: verify no behavior changes, only structural improvements

## Gate Sequence (3 gates)

```
plan_approved → tdd_complete → review_approved
```

## Key Principle

Safety first. Write characterization tests that capture existing behavior before making any structural changes. Tests must stay green throughout refactoring.
