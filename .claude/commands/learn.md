look # Capture Learning

Document insights, decisions, and retrospectives from development work. Remember to KISS- Keep it simple, stupid!

## Learning Process

1. **Check Existing Learning**
   - Read PRPs/learning/retros.md for past retrospectives
   - Read PRPs/learning/decisions.md for documented choices

2. **Capture Retrospective** (After completing a milestone)
   - What worked well and should be repeated
   - What was challenging or took longer than expected
   - Key technical insights discovered
   - Process improvements for next milestone

3. **Document Decisions**
   - Record architectural/technical choices made
   - Explain why Option A was chosen over Option B
   - Include context that influenced the decision
   - Note any trade-offs accepted

4. **Extract Patterns**
   - Identify successful code patterns to reuse
   - Note anti-patterns to avoid
   - Document gotchas and their solutions

## Format Guidelines

### Retrospective Format
```markdown
## After [Milestone Name]
**Date:** YYYY-MM-DD
**Worked well:** Brief list of successes
**Struggled with:** Challenges faced
**Key learning:** Most important insight
**Next milestone:** What to tackle next
```

### Decision Format
```markdown
## [Decision Title]
**Date:** YYYY-MM-DD
**Options considered:**
- Option A: Description
- Option B: Description

**Chose:** Option A
**Reason:** Why this was the best choice
**Trade-offs:** What we gave up
```

### Pattern Format
```markdown
## Pattern: [Name]
**When to use:** Context where this applies
**Implementation:** Brief code example or approach
**Benefits:** Why this works well
```

## Trigger Points

Run this command:
- After completing any significant feature or milestone
- When making important technical decisions
- After solving a particularly tricky problem
- When discovering a useful pattern or anti-pattern

## Output
Updates saved to:
- `PRPs/learning/retros.md`
- `PRPs/learning/decisions.md`

Note: Focus on insights that will be valuable for future development. Keep entries actionable and specific.