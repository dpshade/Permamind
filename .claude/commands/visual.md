# Visual - Visual Development Workflow

A visual feedback-driven development workflow for UI/UX features and visual components.

## Workflow Overview

Execute development with continuous visual validation:

### Phase 1: 💻 WRITE CODE
**Implement visual features**

- Use TodoWrite to plan visual implementation tasks
- Follow existing UI patterns and component structure
- Implement responsive design considerations
- Focus on user experience and accessibility
- Use existing design system components

### Phase 2: 📸 SCREENSHOT RESULT
**Capture visual output for validation**

- Run the application or component
- Take screenshots of different states/views
- Capture responsive breakpoints if relevant
- Document visual bugs or inconsistencies
- Save screenshots for comparison

### Phase 3: 🔄 ITERATE
**Refine based on visual feedback**

- Analyze screenshots for improvements needed
- Compare with design requirements/mockups
- Fix visual bugs and inconsistencies
- Enhance styling and user experience
- Repeat cycle until visually acceptable

## Command Usage

```
/visual <ui_feature_description>
```

## Detailed Workflow Steps

### 1. Visual Planning
- Understand design requirements and mockups
- Identify existing UI components to reuse
- Plan responsive behavior and breakpoints
- Create todos for visual implementation tasks

### 2. Initial Implementation  
- Write HTML/JSX structure
- Add CSS/styling (Tailwind, styled-components, etc.)
- Implement basic functionality
- Ensure accessibility standards

### 3. Visual Capture
- Start development server
- Navigate to relevant views/components
- Take screenshots of different states:
  - Default state
  - Loading states
  - Error states
  - Interactive states (hover, focus, active)
  - Mobile/tablet/desktop breakpoints

### 4. Visual Analysis
- Compare screenshots with requirements
- Identify spacing, alignment, color issues
- Check typography and visual hierarchy
- Validate responsive behavior
- Note accessibility concerns

### 5. Iterative Refinement
- Fix identified visual issues
- Enhance styling and polish
- Test cross-browser compatibility
- Validate on different devices
- Repeat screenshot → analyze → refine cycle

## Best Practices

- Take screenshots at key development milestones
- Use consistent viewport sizes for comparison
- Document visual decisions and rationale
- Test on multiple browsers/devices when possible
- Follow existing design system patterns
- Consider dark mode and accessibility
- Keep visual documentation updated
- Use browser dev tools for responsive testing

## Screenshot Guidelines

- Capture full page and focused component views
- Include relevant browser UI (address bar, etc.) when needed
- Use consistent lighting and display settings
- Name screenshots descriptively with timestamps
- Save in organized folder structure
- Include before/after comparisons when iterating

## Example Workflow

1. **Write Code**: Implement dashboard card component
2. **Screenshot**: Capture card in different container sizes
3. **Iterate**: Fix spacing and alignment issues
4. **Screenshot**: Capture improved version
5. **Iterate**: Add hover states and animations
6. **Screenshot**: Document final polished component

## Integration Notes

- Use with `/prime` for design system context
- Combine with `/epcc` for systematic approach
- Works well with component-driven development
- Essential for responsive design validation
- Useful for design review and stakeholder feedback

## Tools and Setup

- Ensure development server can be started
- Have screenshot tools ready (built-in browser, external tools)
- Set up responsive testing environment
- Configure browser dev tools for consistent capture
- Organize screenshot storage location

$ARGUMENTS