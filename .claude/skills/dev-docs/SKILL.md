---
name: dev-docs
description: Create and manage dev documentation for complex multi-session tasks. Use when working on features that span multiple sessions or require careful planning.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Dev Docs

Persistent task documentation across context resets using the three-file Dev Docs pattern.

## Overview

Dev Docs provide a structured way to document complex tasks that span multiple sessions or context resets. They ensure continuity and prevent lost work.

## The Three-File Structure

```
dev/active/[task-name]/
├── [task-name]-plan.md      # Strategic plan with architecture
├── [task-name]-context.md   # Current progress and decisions
└── [task-name]-tasks.md     # Detailed task checklist
```

### File Purposes

**plan.md** - Strategic documentation
- High-level approach and architecture
- Key design decisions
- Implementation phases
- Success criteria

**context.md** - Session continuity
- Current progress tracking
- Key decisions made (with rationale)
- Important file references
- Session notes and progress

**tasks.md** - Execution checklist
- Detailed task breakdown
- Checkbox format for tracking
- Subtasks and dependencies
- Completion status

## When to Use Dev Docs

### ✅ Use Dev Docs for:
- Features requiring multiple sessions
- Complex refactoring with many files
- Multi-step architecture changes
- Tasks requiring careful planning
- Work that's likely to be interrupted

### ❌ Skip Dev Docs for:
- Simple bug fixes (single file)
- Quick updates (< 2 hours)
- Trivial changes
- Well-understood maintenance

**Rule of thumb:** If it takes more than 2 hours or spans multiple sessions, use dev docs.

## Creating Dev Docs

### Step 1: User invokes the skill

User says:
```
/dev-docs create [task description]
```

Example:
```
/dev-docs create implementing real-time notifications with WebSockets
```

### Step 2: Generate the three files

Create directory structure:
```bash
dev/active/[task-name]/
```

Generate the three files with appropriate content.

### Step 3: Review and adjust

User reviews the plan and suggests adjustments.

### Step 4: Start implementation

Begin working through tasks in `tasks.md`.

## File Templates

### plan.md Template

```markdown
# [Task Name] - Implementation Plan

## Overview
[High-level description of what we're building]

## Objectives
- [Primary objective 1]
- [Primary objective 2]
- [Primary objective 3]

## Architecture

### Components Involved
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]
- [Component 3]: [Purpose]

### Data Flow
[Description of how data flows through the system]

### Key Technologies
- [Technology 1]: [Why it's used]
- [Technology 2]: [Why it's used]

## Implementation Phases

### Phase 1: [Phase Name]
**Goal:** [What this phase achieves]

**Tasks:**
- [Task 1]
- [Task 2]
- [Task 3]

**Success Criteria:**
- [Criteria 1]
- [Criteria 2]

### Phase 2: [Phase Name]
**Goal:** [What this phase achieves]

**Tasks:**
- [Task 1]
- [Task 2]

**Success Criteria:**
- [Criteria 1]

### Phase 3: [Phase Name]
**Goal:** [What this phase achieves]

**Tasks:**
- [Task 1]
- [Task 2]

**Success Criteria:**
- [Criteria 1]

## Design Decisions

### Decision 1: [Title]
**Context:** [Why we needed to decide]
**Options Considered:**
- Option A: [Pros/cons]
- Option B: [Pros/cons]
**Decision:** [What we chose and why]

### Decision 2: [Title]
**Context:** [Why we needed to decide]
**Options Considered:**
- Option A: [Pros/cons]
- Option B: [Pros/cons]
**Decision:** [What we chose and why]

## Risks & Considerations

### Risk 1: [Description]
**Mitigation:** [How we're addressing it]

### Risk 2: [Description]
**Mitigation:** [How we're addressing it]

## Success Criteria
- [ ] [Measurable success criteria 1]
- [ ] [Measurable success criteria 2]
- [ ] [Measurable success criteria 3]

## Definition of Done
- [ ] All phases complete
- [ ] All success criteria met
- [ ] Code reviewed and merged
- [ ] Tests passing
- [ ] Documentation updated
```

### context.md Template

```markdown
# [Task Name] - Implementation Context

## Task Overview
[One-sentence description of what we're building]

**Status:** [Planning | In Progress | Blocked | Review | Complete]
**Last Updated:** [Date]
**Current Phase:** [Phase name]

---

## Session Progress

### Session 1 - [Date]
**Focus:** [What was worked on]
**Progress:**
- Completed [task 1]
- Completed [task 2]
- Started [task 3]

**Blockers:** [Any blockers encountered]

**Next Session:**
- [ ] Complete [task 3]
- [ ] Start [task 4]

### Session 2 - [Date]
**Focus:** [What was worked on]
**Progress:**
- Completed [task 3]
- Completed [task 4]

**Blockers:** [Any blockers encountered]

**Next Session:**
- [ ] Start [task 5]

---

## Key Decisions

### Decision 1: [Title]
**Date:** [When decision was made]
**Decision:** [What was decided]
**Rationale:** [Why this decision was made]
**Impact:** [What this affects]

### Decision 2: [Title]
**Date:** [When decision was made]
**Decision:** [What was decided]
**Rationale:** [Why this decision was made]
**Impact:** [What this affects]

---

## Important Files

### Backend Files
- `apps/backend/src/[path]/[file].ts` - [Purpose]
- `apps/backend/src/[path]/[file].ts` - [Purpose]

### Frontend Files
- `apps/frontend/src/[path]/[file].tsx` - [Purpose]
- `apps/frontend/src/[path]/[file].tsx` - [Purpose]

### Configuration Files
- `[path]/[config-file]` - [Purpose]

### Database Files
- `apps/backend/src/migrations/[migration-file].ts` - [Purpose]

---

## Technical Notes

### [Topic 1]
[Technical notes, gotchas, or important information]

### [Topic 2]
[Technical notes, gotchas, or important information]

---

## Dependencies

### External Dependencies
- [Package name]: [Version] - [Why needed]

### Internal Dependencies
- Depends on completion of [other task/feature]
- Requires changes to [component/service]

---

## Testing Strategy

### Unit Tests
- [Test 1]: [What it tests]
- [Test 2]: [What it tests]

### Integration Tests
- [Test 1]: [What it tests]
- [Test 2]: [What it tests]

### Manual Testing
- [Test scenario 1]
- [Test scenario 2]

---

## Open Questions

### Question 1: [Question]
**Status:** [Open | Resolved]
**Resolution:** [How it was resolved, if applicable]

### Question 2: [Question]
**Status:** [Open | Resolved]
**Resolution:** [How it was resolved, if applicable]

---

## Next Steps

1. [Immediate next step]
2. [Following step]
3. [Step after that]
```

### tasks.md Template

```markdown
# [Task Name] - Implementation Tasks

## Phase 1: [Phase Name]

- [ ] Task 1.1: [Description]
  - [ ] Subtask 1.1.1
  - [ ] Subtask 1.1.2
- [ ] Task 1.2: [Description]
- [ ] Task 1.3: [Description]
  - [ ] Subtask 1.3.1
  - [ ] Subtask 1.3.2
  - [ ] Subtask 1.3.3

## Phase 2: [Phase Name]

- [ ] Task 2.1: [Description]
- [ ] Task 2.2: [Description]
  - [ ] Subtask 2.2.1
- [ ] Task 2.3: [Description]

## Phase 3: [Phase Name]

- [ ] Task 3.1: [Description]
- [ ] Task 3.2: [Description]
- [ ] Task 3.3: [Description]

## Testing & Documentation

- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual testing
- [ ] Update documentation
- [ ] Code review

---

## Task Details

### Task 1.1: [Task Name]
**Description:** [Detailed description]
**Files:** [Affected files]
**Estimated Complexity:** [Low/Medium/High]
**Dependencies:** [What needs to be done first]
**Notes:** [Additional context]

### Task 1.2: [Task Name]
**Description:** [Detailed description]
**Files:** [Affected files]
**Estimated Complexity:** [Low/Medium/High]
**Dependencies:** [What needs to be done first]
**Notes:** [Additional context]

---

## Completion Checklist

### Phase 1
- [ ] All Phase 1 tasks complete
- [ ] Phase 1 tests passing
- [ ] Phase 1 code reviewed

### Phase 2
- [ ] All Phase 2 tasks complete
- [ ] Phase 2 tests passing
- [ ] Phase 2 code reviewed

### Phase 3
- [ ] All Phase 3 tasks complete
- [ ] Phase 3 tests passing
- [ ] Phase 3 code reviewed

### Overall
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Code merged to main branch
- [ ] Dev docs archived
```

## Usage Examples

### Example 1: Creating Dev Docs

**User:**
```
/dev-docs create implementing WebSocket notifications
```

**Claude:**
1. Creates `dev/active/websocket-notifications/`
2. Generates three files with appropriate content
3. Presents plan for review

### Example 2: After Context Reset

**User:**
```
/dev-docs resume
```

**Claude:**
1. Reads all dev docs in `dev/active/`
2. Presents current status
3. Asks which task to continue

### Example 3: Updating Progress

**User:**
```
/dev-docs update I just completed the WebSocket server setup
```

**Claude:**
1. Updates `context.md` with session progress
2. Checks off completed tasks in `tasks.md`
3. Updates current phase and next steps

### Example 4: Archive Completed

**User:**
```
/dev-docs archive websocket-notifications
```

**Claude:**
1. Moves `dev/active/websocket-notifications/` to `dev/completed/`
2. Updates task status to complete
3. Removes from active tasks list

## Best Practices

### Writing Plans
- Start with clear objectives
- Break into logical phases
- Define success criteria upfront
- Document design decisions with rationale
- Consider risks and mitigations

### Maintaining Context
- Update after every session
- Record important decisions as they're made
- Note file locations for quick reference
- Document technical gotchas
- Keep next steps current

### Managing Tasks
- Break down into small, checkable items
- Use subtasks for complex work
- Mark complete immediately after finishing
- Update estimates as you learn
- Note dependencies clearly

### During Implementation
- Refer to plan.md for strategy
- Check tasks.md for what's next
- Update context.md frequently
- Don't skip updating progress
- Note blockers immediately

## Commands Reference

### `/dev-docs create [task]`
Create new dev docs for a task

**Example:**
```
/dev-docs create adding user profile management
```

### `/dev-docs resume`
List active dev docs and resume work

**Example:**
```
/dev-docs resume
```

### `/dev-docs status [task]`
Show current status of a task

**Example:**
```
/dev-docs status websocket-notifications
```

### `/dev-docs update [notes]`
Update progress for current task

**Example:**
```
/dev-docs update completed the authentication controller
```

### `/dev-docs archive [task]`
Archive completed dev docs

**Example:**
```
/dev-docs archive websocket-notifications
```

### `/dev-docs list`
List all active dev docs

**Example:**
```
/dev-docs list
```

## Directory Structure

```
dev/
├── README.md                    # This file
├── active/                      # Currently active tasks
│   ├── task-a/
│   │   ├── task-a-plan.md
│   │   ├── task-a-context.md
│   │   └── task-a-tasks.md
│   └── task-b/
│       ├── task-b-plan.md
│       ├── task-b-context.md
│       └── task-b-tasks.md
└── completed/                   # Archived tasks
    └── task-c/
        ├── task-c-plan.md
        ├── task-c-context.md
        └── task-c-tasks.md
```

## Tips for Success

1. **Create early** - Set up dev docs when starting a complex task
2. **Update frequently** - Keep context.md current after every session
3. **Be specific** - Detailed notes are better than vague ones
4. **Track decisions** - Document the "why" not just the "what"
5. **Use checkboxes** - Check off tasks as you complete them
6. **Reference files** - Note important file locations for quick access
7. **Note blockers** - Record what's blocking you and potential solutions
8. **Plan next steps** - Always end a session with clear next steps
9. **Archive when done** - Move completed tasks to avoid clutter
10. **Review before resuming** - Read all three files after context reset

## Common Patterns

### Feature Implementation
```markdown
Plan: High-level architecture, API design, database schema
Context: Current phase, key decisions, files modified
Tasks: Backend API → Frontend UI → Testing → Documentation
```

### Refactoring
```markdown
Plan: Current problems, proposed solution, migration strategy
Context: Files refactored, breaking changes, test updates
Tasks: Identify scope → Refactor incrementally → Update tests → Verify
```

### Bug Fix Investigation
```markdown
Plan: Bug description, reproduction steps, investigation approach
Context: Findings, root cause analysis, potential solutions
Tasks: Reproduce → Investigate → Identify cause → Implement fix → Test
```

### Architecture Change
```markdown
Plan: Current limitations, proposed architecture, migration plan
Context: Design decisions, trade-offs, implementation notes
Tasks: Design → Implement new → Migrate data → Remove old → Test
```

---

**See:** `dev/README.md` for complete documentation
