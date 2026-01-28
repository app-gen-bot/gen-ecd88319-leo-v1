# Leonardo Agent Workflow

Adapted from Replit's approach, Leonardo combines the Plan Stage into a single document generation.

## Plan Stage (Single Document Output)

Leonardo generates all three steps in one comprehensive `plan.md` document:

### Step 1: Understanding
- **Initial Understanding**: Agent processes user request
- **Project Initialization**: Defines project name and structure
- **Tech Stack Selection**: Chooses appropriate technologies
- **Initial Description**: Creates full application description

### Step 2: Initial Version
- **Feature Breakdown**: Lists core features for initial version:
  - Create new todo items
  - Mark tasks as complete/incomplete
  - Edit existing todo items
  - Delete todo items
  - Filter tasks (all/active/completed)

### Step 3: Feature List
- **Complete Feature List**: All features organized by Initial Version vs Later
- **Sample Data Structure**: Defines data models and structures

## Preview Stage (Screenshots 4-5)

### Step 4: HTML Streaming (Screenshot 4 - 15:36:30)
- **Live HTML Preview**: Agent streams actual HTML content to iframe
- **Visual Design Reference**: Complete UI rendered as design reference
- **Branding Elements**: "TodoList" title with tagline "Stay organized, get things done"
- **Core UI Components**:
  - Task counters: "3 total tasks", "1 completed"
  - Input field: "Add a new task..."
  - Task list with checkboxes
- **Timing**: "Working — 54s elapsed"

### Step 5: Complete Preview (Screenshot 5 - 15:37:28)
- **Full Interface**: Complete HTML preview with all interactions visible
- **Functional Elements**:
  - "Add Task" button (blue, prominent)
  - Filter tabs: "All Tasks", "Active", "Completed" 
  - Task list with realistic sample data:
    - "Complete project documentation" (unchecked)
    - "Review client feedback" (checked, completed yesterday)
    - "Prepare presentation for Monday meeting" (unchecked)
  - Edit/delete icons for each task
- **Future Features**: "Later" section shows planned enhancements:
  - Add task categories and tags
  - Implement due dates and reminders
  - Add task priority levels
  - Enable task sharing and collaboration
- **Approval Gate**: "Review the plan & visual preview" with "Approve plan & start" button
- **Total Time**: Complete Plan + Preview stages took ~3 minutes

## Build Stage
- **Entry Point**: User clicks "Approve plan & start" after reviewing HTML preview
- **Code Generation**: Actual application code is generated based on approved plan and preview
- **Implementation**: HTML preview serves as visual specification for code generation

## Key Patterns Observed

1. **Three-Stage Process**: Plan → Preview → Build with clear separation
2. **HTML Streaming**: Agent streams actual HTML for iframe preview as design reference
3. **Visual-First Approval**: Users approve based on visual preview, not abstract descriptions
4. **Progressive Refinement**: Plan develops through Understanding → Initial Version → Feature List
5. **User Checkpoints**: Multiple approval points before code generation
6. **Feature Prioritization**: "Initial version" vs "Later" features clearly separated
7. **Rapid Visual Prototyping**: HTML preview generated in ~1 minute
8. **Tech Stack Upfront**: Full-stack decisions made in Understanding phase
9. **Realistic Sample Data**: Preview uses contextual, believable content
10. **Design as Specification**: HTML preview becomes the visual spec for Build stage