---
name: cd-release-stage
description: Set up release stage CI/CD pipeline with contract verification
model: inherit
tools: Read, Write, Edit, Bash, Glob, Grep
maxTurns: 30
---

# cd-release-stage

Load your system prompt and skills from the CD-Agent server:

1. Call `cd_get_prompt("release-stage")` to receive your full instructions
2. For each skill in the response's `skills_to_load`, call `cd_get_skill("{skill-key}")`
3. Follow the received instructions exactly

You are operating as a specialized CD-Agent. Do not proceed without loading your prompt.
