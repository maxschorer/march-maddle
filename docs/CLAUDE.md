# CLAUDE.md - Documentation Standards for GuessGrid

This file establishes formatting and structure standards for all feature documentation in this project.

## 📋 Documentation Standards

### File Naming Convention
- Use kebab-case: `feature-name.md`
- Prefix with type: `feature-`, `bug-`, `refactor-`, `enhancement-`
- Examples: `feature-keep-playing.md`, `bug-auth-redirect.md`

### Required Sections

#### 1. Header with Title and Overview
```markdown
# Feature Name - Implementation Plan

## Overview
Brief description of what this feature does and why it's needed.
```

#### 2. Current vs Desired Behavior
```markdown
## Current Behavior
- What happens now

## Desired Behavior  
- What should happen after implementation
```

#### 3. Implementation Steps with Checkboxes
```markdown
## Implementation Steps

### Phase 1: [Phase Name] ✅/❌
- [ ] Task 1 description
- [ ] Task 2 description
- [x] Completed task (example)

### Phase 2: [Phase Name] 
- [ ] Task 1 description
- [ ] Task 2 description

## ✅ IMPLEMENTATION COMPLETE (when all phases done)
```

#### 4. Technical Details
```markdown
## Technical Considerations
- Architecture decisions
- Performance implications
- Edge cases to handle

## Files Modified
- `/path/to/file1.ts` - Description of changes
- `/path/to/file2.tsx` - Description of changes

## Testing Requirements
- [ ] Unit tests for new functions
- [ ] Integration tests for user flows
- [ ] Manual testing scenarios
```

#### 5. Future Enhancements (Optional)
```markdown
## Future Enhancements
- Ideas for extending this feature
- Related features to consider
```

### Formatting Guidelines

#### Checkboxes
- **Always use checkboxes** for any task, milestone, or actionable item
- Update status in real-time as work progresses
- Use `- [ ]` for incomplete, `- [x]` for complete

#### Status Indicators
- ✅ for completed phases/sections
- ❌ for blocked/failed phases  
- 🚧 for in-progress phases
- 📋 for planning phases

#### Code Examples
- Always use proper syntax highlighting
- Include file paths in comments
- Show before/after for significant changes

#### Emojis for Visual Hierarchy
- 🎯 **Goals/Objectives**
- 🏗️ **Architecture/Technical**
- 🎨 **UI/UX**
- 🐛 **Bug Related**
- 📊 **Data/Analytics**
- 🔧 **Configuration/Setup**
- ⚡ **Performance**
- 🚀 **Deployment/Release**

### Example Template

```markdown
# Feature Example - Implementation Plan

## Overview
Brief description of the feature and its purpose.

## Current Behavior
- Describe what happens now

## Desired Behavior
- Describe what should happen

## Implementation Steps

### Phase 1: Planning ✅
- [x] Research existing solutions
- [x] Define requirements
- [x] Create technical design

### Phase 2: Development 🚧
- [x] Create data models
- [ ] Implement core logic
- [ ] Add UI components
- [ ] Write tests

### Phase 3: Testing & Polish
- [ ] Manual testing
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Documentation updates

## Technical Considerations

### Architecture
- How this fits into existing system
- New dependencies or patterns

### Performance
- Expected impact on load times
- Scalability considerations

### Edge Cases
- Error scenarios to handle
- Validation requirements

## Files Modified
- `/src/components/ExampleComponent.tsx` - New component for feature
- `/src/utils/exampleUtils.ts` - Helper functions
- `/src/types/Example.ts` - Type definitions

## Testing Requirements
- [ ] Unit tests for utility functions
- [ ] Component testing for UI
- [ ] Integration tests for user workflow
- [ ] Manual testing checklist

## Future Enhancements
- Additional features that could build on this
- Related improvements to consider
```

## ⚡ Development Workflow Requirements

### Code Quality Checks
**CRITICAL**: After every feature change or code modification, you MUST:
1. **Run linter**: Execute `npm run lint` to check for code quality issues
2. **Fix all errors**: Address any linting errors before proceeding
3. **Update linter-fixes.md**: Document any remaining warnings in `/docs/linter-fixes.md`
4. **Clean codebase goal**: Aim to maintain 0 errors, minimize warnings

### Linter Workflow
```bash
# After making changes
npm run lint

# If errors exist, fix them first
# Update docs/linter-fixes.md with current status
# Only proceed when linter is clean or warnings are documented
```

### Testing Requirements
- **Run tests after significant changes**: `npm run test` (runs once and exits)
- **Watch mode for development**: `npm run test:watch` (continuous mode)
- **Ensure build succeeds**: `npm run build`
- **Update tester-errors.md**: Document any test failures or warnings
- **Test functionality manually** when UI changes are made

## 🔄 Maintenance Guidelines

### Updating Documentation
1. **Real-time updates**: Update checkboxes as tasks are completed
2. **Status changes**: Update phase indicators (✅/🚧/❌) 
3. **Implementation notes**: Add notes about decisions made during development
4. **Completion**: Mark as "IMPLEMENTATION COMPLETE" when done

### File Organization
- Keep feature docs in `/docs/` directory
- Archive completed features to `/docs/archive/` if desired
- Reference docs from main README.md when relevant

### Cross-References
- Link related features in documentation
- Reference GitHub issues/PRs when applicable
- Include links to design mockups or external resources

## 📝 Documentation Review Checklist

Before marking any feature documentation as complete:

- [ ] All implementation steps have checkboxes
- [ ] Status indicators are up to date
- [ ] Technical considerations are documented
- [ ] Files modified are listed with descriptions
- [ ] Testing requirements are specified
- [ ] Code examples use proper formatting
- [ ] Emojis are used consistently for visual hierarchy
- [ ] Cross-references are included where relevant

---

## 🎯 Goals of This Standard

1. **Consistency**: All feature docs follow the same structure
2. **Trackability**: Clear progress indicators for all work
3. **Completeness**: Ensure nothing is forgotten during implementation
4. **Maintainability**: Easy to update and reference
5. **Collaboration**: Clear communication of requirements and progress

This standard should be followed for all future feature documentation to maintain consistency and clarity across the project.