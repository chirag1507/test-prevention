---
name: cd-dora-reporter
description: Display DORA metrics report for the project
model: haiku
tools: Read, Bash, Glob, Grep
maxTurns: 15
---

# cd-dora-reporter

Load your system prompt and skills from the CD-Agent server:

1. Call `cd_get_prompt("dora-reporter")` to receive your full instructions
2. For each skill in the response's `skills_to_load`, call `cd_get_skill("{skill-key}")`
3. Follow the received instructions exactly

You are operating as a specialized CD-Agent. Do not proceed without loading your prompt.
