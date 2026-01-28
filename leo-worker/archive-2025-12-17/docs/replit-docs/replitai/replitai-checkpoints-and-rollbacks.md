# Checkpoints and Rollbacks

**Source:** https://docs.replit.com/replitai/checkpoints-and-rollbacks  
**Section:** replitai  
**Scraped:** 2025-09-08 20:05:22

---

FeaturesCheckpoints and RollbacksCopy pageLearn how checkpoints automatically save your work and how rollbacks let you undo changes.Copy page

With Replit, you never have to worry about losing your work.

Replit’s checkpoint and rollback system provides comprehensive version control and state management for your entire development environment.

When you use Replit Agent or Assistant, checkpoints automatically capture your complete project state. This includes not just your code changes, but workspace contents, AI conversation context, and connected databases.

## ​What are checkpoints?

A checkpoint is a complete snapshot of your Replit App state created automatically by Agent and Assistant at key development milestones. Unlike traditional version control that only tracks code changes, Replit checkpoints capture your entire development context.

Think of checkpoints as save points in a video game - you can always go back to a working version of your app.

### ​Complete state capture

Each checkpoint preserves:

- Workspace contents: All files, directories, installed packages, and project configuration
- AI conversation context: The complete conversation history and context that led to current state
- Database states: Connected databases and their data at the time of checkpoint creation
- Environment configuration: Runtime settings, secrets (references), and publishing configurations
- Agent memory: The AI’s understanding of your project architecture, preferences, and patterns

This comprehensive approach means you can confidently experiment with changes, knowing you can restore not just your code, but your entire development context.

## ​How rollbacks work

Rollback functionality allows you to restore your Replit App to any previous checkpoint state with a single click. This is far more powerful than traditional Git revert operations.

### ​What gets rolled back

When you perform a rollback, Replit restores:

1. Complete workspace state: All files return to their exact state at the selected checkpoint
1. AI conversation context: Agent and Assistant conversations are restored to the point of the checkpoint, maintaining context continuity
1. Database contents: Connected databases are restored to their state at checkpoint creation
1. Project configuration: Environment variables, dependencies, and runtime configurations
1. Development environment: Tool configurations and workspace settings

When you use the rollback feature, you restore the Replit App to a previous state. This removes all changes made after that point, including code edits and database changes.

### ​Alternative rollback options

For specific components, you also have targeted rollback options:

- Database rollbacks: You can roll back databases independently from the database pane, giving you granular control over data restoration without affecting your entire workspace

### ​Rollback safety

Rollbacks are designed to be safe and predictable:

- Non-destructive preview: Some interfaces allow you to preview checkpoint states before rolling back
- Clear boundaries: Each checkpoint represents a logical development milestone
- Conversation continuity: AI context is preserved, so you can continue building from the restored state
- Immediate effect: Rollbacks apply instantly across all connected services

## ​Checkpoint creation

Checkpoints are created automatically by Replit’s AI tools at strategic moments during development.

### ​Agent checkpoints

Replit Agent creates checkpoints when:

- Feature completion: After successfully implementing a requested feature or functionality
- Major milestones: When significant progress is made on complex tasks
- Stable states: After testing and validation of implemented changes
- Error recovery: Before attempting fixes for critical issues

### ​Assistant checkpoints

Replit Assistant creates checkpoints when:

- Edit requests: After applying approved changes to your codebase
- Multi-file modifications: When changes span multiple files or components
- Package updates: After installing or updating dependencies
- Configuration changes: When modifying project settings or structure

### ​Checkpoint characteristics

Every checkpoint includes:

- AI-generated descriptions: Clear, descriptive summaries of what was accomplished
- Timestamp information: Precise creation time for easy identification
- Change scope: Indication of files, features, or systems modified
- Billing information: For Agent, transparent cost tracking per checkpoint

## ​Using checkpoints and rollbacks

### ​Finding checkpoints

Checkpoints appear in multiple locations throughout your Replit workspace:

Agent tab: View all Agent-created checkpoints with descriptions and rollback options
Assistant tab: Access Assistant-generated checkpoints and undo/restore functionality
Git pane: See checkpoints as Git commits with full version control integration
History view: In Agent chat, click the history icon  to access a complete timeline of all checkpoints and their progression

### ​Performing rollbacks

The rollback process varies slightly depending on where you initiate it:

#### ​From Agent tab

1

Navigate to Agent

Open the Agent tab in your workspace to view all Agent-created checkpoints.

2

Select checkpoint

Locate the checkpoint you want to restore and select Rollback to here.

3

Confirm rollback

Review the rollback warning and confirm to restore your app to the selected state.

4

Verify restoration

Check that your workspace, databases, and AI context match the restored checkpoint state.

#### ​From Assistant tab

1

Navigate to Assistant

Open the Assistant tab to view Assistant-created checkpoints and edit history.

2

Undo changes

Select Undo these changes to revert the most recent Assistant modifications.

3

Restore checkpoint

Use Restore checkpoint to return to a specific Assistant-generated state.

4

Verify restoration

Confirm your app matches the expected state before continuing development.

### ​Best practices

Use checkpoints strategically:

- Test your app after each major checkpoint to ensure stability
- Create manual Git commits for long-term version tracking alongside automatic checkpoints
- Review checkpoint descriptions to understand what changed

Rollback considerations:

- Always verify the scope of changes before rolling back
- Consider the impact on connected databases and external integrations
- Communicate rollbacks to collaborators to maintain team awareness

Iterative development:

- Build incrementally to take advantage of frequent checkpoints
- Use rollbacks to explore different implementation approaches safely
- Leverage AI context preservation to continue conversations after rollbacks

## ​Integration with version control

Checkpoints work seamlessly with Replit’s broader version control ecosystem:

### ​Git integration

- Git commit generation: Each checkpoint creates a corresponding Git commit
- Branch compatibility: Checkpoints respect branch structure and merging workflows
- Remote sync: GitHub integration maintains checkpoint synchronization
- Command line access: Full Git functionality remains available alongside checkpoints

### ​Collaboration features

- Team visibility: Checkpoints are visible to all project collaborators
- Merge conflict prevention: Checkpoint timing reduces likelihood of conflicts
- Shared context: AI conversation context helps team members understand changes
- Real-time updates: Collaborators see checkpoint creation in real-time

## ​Advanced features

### ​Checkpoint previews

Some interfaces support checkpoint preview functionality:

- Visual comparison: See your app’s appearance at different checkpoint states
- Non-destructive exploration: Preview without actually rolling back
- Progress tracking: Understand how your app evolved over time
- Iteration comparison: Compare different implementation approaches

### ​Cross-session rollbacks

For advanced builders and team administrators:

- Extended history: Access checkpoints across multiple development sessions
- Administrative control: Team admins can perform rollbacks across user sessions
- Audit trails: Complete history of checkpoint creation and rollback actions

## ​Use cases

### ​Experimental development

Checkpoints enable fearless experimentation:

- Try new features knowing you can easily revert
- Test different architectural approaches
- Explore alternative UI designs or user flows
- Implement complex integrations with safety nets

### ​Debugging and recovery

When issues arise, checkpoints provide reliable recovery:

- Roll back to working states when bugs are introduced
- Isolate problems by comparing checkpoint states
- Restore database integrity after data corruption
- Recover from accidental deletions or modifications

### ​Learning and iteration

Checkpoints support educational development:

- Compare different implementation strategies
- Learn from AI decision-making process through checkpoint progression
- Build understanding by exploring how features evolved
- Practice new techniques with rollback safety

## ​Next steps

To learn more about related Replit features, explore:

- Replit Agent: Learn about AI-powered app development and checkpoint creation
- Replit Assistant: Discover targeted editing capabilities and Assistant checkpoints
- Version Control: Understand Git integration and broader version control options
- File History: Explore granular file-level change tracking
- Effective Prompting: Master techniques for checkpoint-driven development

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replitai/plan-mode)

[Dynamic IntelligenceEnhance Agent with Dynamic Intelligence—a collection of advanced features including Extended Thinking and High Power mode. Get first-try correct results on complex builds when precision matters most.Next](https://docs.replit.com/replitai/dynamic-intelligence)
