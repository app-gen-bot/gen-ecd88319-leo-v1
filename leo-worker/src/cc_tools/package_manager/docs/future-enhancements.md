# Package Manager Tool - Future Enhancements

## Tool Steering and Guidance Features

The package_manager tool should guide agents toward using the most appropriate specialized tools through helpful error messages and suggestions.

### Backlog Feature: Smart Tool Redirection

#### 1. ShadCN Component Detection
When agents attempt to install ShadCN-related packages, the tool should detect this and suggest using the specialized `shadcn` tool instead.

**Example Detection Patterns:**
- Package names: `@radix-ui/*`, `class-variance-authority`, `lucide-react`, `tailwind-merge`, `clsx`
- Command patterns: Installing UI component dependencies

**Suggested Response:**
```
❌ Package installation rejected: ShadCN-related dependency detected

💡 Use the 'shadcn' tool instead:
   - For components: Use shadcn add_component command
   - For UI libraries: ShadCN tool automatically manages these dependencies
   
   The shadcn tool provides proper component installation with validation.
```

#### 2. Build Tool Detection
When agents attempt to install build-related packages or run build commands, redirect to the `build_test` tool.

**Example Detection Patterns:**
- Commands: `npm run build`, `npm run dev`, `npm run lint`
- Package names: Build tools, testing frameworks

**Suggested Response:**
```
❌ Build command rejected: Use specialized build tool

💡 Use the 'build_test' tool instead:
   - For builds: build_test verify
   - For development server: build_test start-server
   - For testing: build_test handles all build operations
```

#### 3. Enhanced Package Validation Messages
When packages are rejected from the approved list, provide helpful alternatives and explanations.

**Current Behavior:** Simple rejection message
**Enhanced Behavior:** 
```
❌ Package 'moment' is not in the approved list

💡 Suggested alternatives:
   - Use 'date-fns' (approved) - Modern, tree-shakable date library
   - Use native JavaScript Date API for simple operations
   - Use 'dayjs' (approved) - Lightweight moment.js alternative

📖 Package rejected because: Large bundle size, better alternatives available
```

#### 4. Agent Workflow Guidance
Provide context-aware suggestions based on common agent workflow patterns.

**Examples:**
- If multiple related packages are requested: Suggest checking if a single tool can handle the requirement
- If deprecated packages are requested: Suggest modern alternatives
- If packages with known issues are requested: Provide warnings and alternatives

### Implementation Strategy

#### Phase 1: Detection Logic
- Add pattern matching for ShadCN-related packages
- Add command detection for build operations
- Create mapping of common packages to appropriate tools

#### Phase 2: Enhanced Error Messages
- Implement rich error messages with suggestions
- Add alternative package suggestions to approved_packages.json
- Create guidance templates for different rejection reasons

#### Phase 3: Smart Suggestions
- Add context awareness for agent workflows
- Implement package relationship detection
- Add proactive suggestions for better tool choices

### Design Principles

1. **Helpful, Not Blocking**: Guide agents toward better choices rather than just rejecting requests
2. **Educational**: Help agents understand why certain approaches are preferred
3. **Actionable**: Always provide specific next steps or alternatives
4. **Consistent**: Use consistent messaging patterns across all tool guidance

### Benefits

- **Reduces Agent Confusion**: Clear guidance on which tool to use for specific tasks
- **Improves Workflow Efficiency**: Agents learn to use the right tool from the start
- **Maintains Security**: Steering toward specialized tools maintains security boundaries
- **Educational**: Agents learn better patterns through helpful error messages

---

**Status**: Backlog feature for future implementation
**Priority**: Medium - Would improve agent workflow guidance
**Dependencies**: Current secure package_manager implementation