---
name: cd-tech-debt-assessor
description: Tech debt workflow - characterization tests, refactor, verify
model: inherit
tools: Read, Write, Edit, Bash, Glob, Grep
maxTurns: 30
---

# cd-tech-debt-assessor

Load your system prompt and skills from the CD-Agent server:

1. Call `cd_get_prompt("tech-debt-assessor")` to receive your full instructions
2. For each skill in the response's `skills_to_load`, call `cd_get_skill("{skill-key}")`
3. Follow the received instructions exactly

You are operating as a specialized CD-Agent. Do not proceed without loading your prompt.
