# Claude Code Init Prompt

## Skill Prompt

Think of yourself as an experience Product Developer/Engineer + with high Techincal Project Managerial Skill. I want you to create necessary @.claude files that can help us built the project autonomously. Let's start with creating SKILL in @.claude/skill folder.

- @.claude/skills/project-manager/SKILL.md - Can Setup the project, write technical instructions, breakdown complex features in to well-scoped PRDs, achievable MILESTONEs, and actional TASKs, also can distribute these tasks to specific agent SKILLs and track their progress and LOG them. He is responsible for project success and should able to validate overall project progression, provide feeback, and take necessary actions to bring the best posibble outcomes.
- @.claude/skills/design-engineer/SKILL.md - Frontend Engineer sepcialized in TypeScript, Nextjs, TailwindCSS, ShadCN, Zustand and can design and understand Figma along all other profession frontend skills. He is capable of following common coding rules, resolve any froentend complex tasks while maintaining code quality and standards.
- @.claude/skills/qa-engineer/SKILL.md - Can write unit and integration test using ViTest, React Testing Library, and Playwrite, and can communicate directly with @.claude/design-engineer/SKILL.md to resolve any issues during the development. He is reponsisble for making the application 100% bug free.

## Template and Rules Prompt

Now use the @.claude/skills/project-manager/SKILL.md file to create the following templates and rules. While generating all outputs, be concise, avoid verbosity, and optimize for minimal token usage without losing clarity or correctness.
Templates

- @.claude/templates/PROMPT.md: a prompt template that defines the task clearly, asks clarifying questions to me (the user), asks clarifying questions to yourself (the agent), and gathers the maximum necessary context before proceeding with any task.
- @.claude/templates/PRDS.md: a template for producing Product Requirement Documents (PRDs) based on the feature brief I provide, ensuring the PRD is execution-ready and unambiguous.
- @.claude/templates/MILESTONE.md: a template for defining milestones derived from each PRD, with clear scope and intent for each milestone.
- @.claude/templates/TASK.md: a template for breaking each milestone into small, clear, and actionable tasks that can be implemented and validated independently.
- @.claude/templates/LOG.md: a template for logging and tracking progress across PRDs, milestones, and tasks, including status updates, blockers, and key decisions.
- @.claude/templates/ERROR.md: a template for documenting anything that goes wrong during progress, including a clear problem description, root cause analysis, and a concrete rescue or recovery plan to resolve the issue.
  Rules:
- @.claude/rules/CODING.md: define coding rules, including shadcn/ui conventions, TypeScript and Next.js best practices, common frontend engineering practices, directory and file structure standards, code acceptance criteria, mandatory kebab-case file naming, mandatory named exports except for Next.js page files which must use default exports, and standard design-engineer rules for frontend development.
- @.claude/rules/COMMIT.md: define rules for pushing changes to Git, including branch naming conventions, commit message format, and the use of :emoji: in commit messages to indicate intent.
- @.claude/rules/TEST.md: define testing rules and responsibilities for the QA engineer, including expectations for coverage, validation, and failure reporting.
- @.claude/rules/VALIDATE.md: define validation and acceptance rules used to validate PRDs, milestones, and tasks, specify completion criteria, and mark items as COMPLETE once all requirements are satisfied.

## Task prompt:

Now, using the @.claude/skills/project-manager/SKILL.md file and strictly following the @.claude/templates and @.claude/rules you have created so far, ask me for one feature at a time using @.claude/template/PROMPT.md and generate the following artifacts for each feature:

- @.claude/plans/PLAN.md: define the overall plan for handling the provided features, including sequencing and execution strategy.
- @.claude/plans/PRDS.md: maintain a list of PRDs generated from each feature brief.
- @.claude/plans/MILESTONES.md: maintain a list of milestones required to complete each feature.
- @.claude/tasks/<PRD_MILESTONE_TASKS>.md: define the full list of tasks derived from the milestones for each PRD.
- @.claude/logs/<PRD_MILESTONE_TASKS>.md: continuously update progress logs for each task, including status changes and notable events.
- @.claude/logs/<PRD_MILESTONE_ERRORS>.md: document any errors that occur, including the context, impact, and resolution steps.
  All of these files are continuously editable artifacts. As I provide additional features over time, you must append to, update, or revise the existing files rather than creating new parallel ones. While generating and updating these files, remain concise, minimize token usage, and provide only the necessary context required for accurate execution.
