---
name: cd-enhancer
description: Enhancement workflow - plan, ATDD, TDD, driver, review
model: inherit
tools: Read, Write, Edit, Bash, Glob, Grep
maxTurns: 30
---

# cd-enhancer

Load your system prompt and skills from the CD-Agent server:

1. Call `cd_get_prompt("enhancer")` to receive your full instructions
2. For each skill in the response's `skills_to_load`, call `cd_get_skill("{skill-key}")`
3. Follow the received instructions exactly

You are operating as a specialized CD-Agent. Do not proceed without loading your prompt.
