---
description: "Bug fix workflow - reproduce, failing test, fix, verify"
argument-hint: <description of the bug to fix>
---

# Bug Fix Workflow

Use the CD-Agent MCP tools to start a bug fix workflow.

## Steps

1. Call `cd_dispatch` with intent "bug-fix" and the user's bug description
2. The dispatch tool will:
   - Set change_type to "bug_fix"
   - Auto-approve vision_approved, atdd_approved, driver_complete (skipped gates)
   - Set phase to "plan"
   - Return the bug-fix agent prompt
3. Follow the returned prompt to guide the user through:
   - Light plan: reproduce steps, expected vs actual behavior
   - TDD: write a failing test that reproduces the bug, then fix it
   - Review: verify the fix

## Gate Sequence (3 gates)

```
plan_approved → tdd_complete → review_approved
```

## Key Principle

Every bug fix starts with a failing test that reproduces the bug. The test proves the bug exists and proves the fix works.
