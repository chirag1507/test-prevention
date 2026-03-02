---
description: "Enhancement workflow - extend existing functionality"
argument-hint: <description of the enhancement>
---

# Enhancement Workflow

Use the CD-Agent MCP tools to start an enhancement workflow.

## Steps

1. Call `cd_dispatch` with intent "enhance" and the user's enhancement description
2. The dispatch tool will:
   - Set change_type to "enhancement"
   - Auto-approve vision_approved (skipped gate)
   - Set phase to "plan"
   - Return the enhance agent prompt
3. Follow the returned prompt to guide the user through:
   - Plan: understand existing behavior, plan changes
   - ATDD: write acceptance tests for the enhanced behavior
   - TDD: implement changes with red-green-refactor
   - Driver: update protocol drivers if needed
   - Review: verify the enhancement

## Gate Sequence (5 gates)

```
plan_approved → atdd_approved → tdd_complete → driver_complete → review_approved
```

## Key Principle

Enhancements build on existing functionality. Understand what exists before changing it.
