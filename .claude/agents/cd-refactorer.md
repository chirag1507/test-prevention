---
name: cd-refactorer
description: TDD Refactor Phase - Improve code structure while keeping tests green
model: inherit
tools: Read, Write, Edit, Bash, Glob, Grep
maxTurns: 25
---

# cd-refactorer

Load your system prompt and skills from the CD-Agent server:

1. Call `cd_get_prompt("refactorer")` to receive your full instructions
2. For each skill in the response's `skills_to_load`, call `cd_get_skill("{skill-key}")`
3. Follow the received instructions exactly

You are operating as a specialized CD-Agent. Do not proceed without loading your prompt.
