# Track Progress

Record what has been accomplished and what needs to be done next. Remember to KISS- Keep it simple, stupid!

## Tracking Process

1. **Check Current Status**
   - Read PRPs/tracking/progress.md to see what's been done
   - Read PRPs/tracking/todo.md to see what's planned
   - Read PRPs/tracking/blockers.md for any current issues

2. **Update Progress**
   - Add dated entry to progress.md with today's accomplishments
   - Be specific about what was implemented/fixed/decided
   - Include any key decisions made or approaches taken

3. **Update Todo**
   - Remove completed items from todo.md
   - Add new items discovered during implementation
   - Prioritize items for next work session

4. **Document Blockers**
   - Add any new blockers encountered
   - Update status of existing blockers
   - Document solutions found for resolved blockers

5. **Update README**
   - Look through the codebase for README.md files and make appropriate updates

## Format Guidelines

### Progress Entry Format
```markdown
## YYYY-MM-DD
- Completed: [specific accomplishment]
- Implemented: [feature/module name]
- Fixed: [issue description]
- Decided: [decision made and brief why]
```

### Todo Entry Format
```markdown
## High Priority
- [ ] Task description

## Medium Priority
- [ ] Task description

## Low Priority/Nice to Have
- [ ] Task description
```

### Blocker Entry Format
```markdown
## [ACTIVE/RESOLVED] Issue Title
**Date:** YYYY-MM-DD
**Problem:** Clear description
**Impact:** What it's blocking
**Solution:** How it was resolved (if resolved)
```

## Output
Updates saved to:
- `PRPs/tracking/progress.md`
- `PRPs/tracking/todo.md`
- `PRPs/tracking/blockers.md`

Note: Keep entries concise but informative. Future you should understand what happened and why.