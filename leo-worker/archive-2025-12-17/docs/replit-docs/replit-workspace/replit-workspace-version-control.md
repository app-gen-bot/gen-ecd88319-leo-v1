# Version control

**Source:** https://docs.replit.com/replit-workspace/workspace-features/version-control  
**Section:** replit-workspace  
**Scraped:** 2025-09-08 20:19:40

---

Version ControlVersion controlCopy pageTrack changes, collaborate with others, and manage your code’s evolution using Replit’s integrated version control tools.Copy page

Version control on Replit enables you to track, manage, and collaborate on your codebase with confidence. With built-in Git integration and GitHub connectivity, you can:

- Track code changes and maintain a history of your development work
- Collaborate with team members without code conflicts or lost work
- Import, modify, and push code between Replit and GitHub
- Work with branches to experiment with new features safely

## ​What is version control?

Version control is a system that records changes to files over time, allowing you to recall specific versions later. On Replit, version control is powered by Git—the industry-standard tool for tracking code changes—with a user-friendly visual interface that eliminates the need for command-line knowledge.

### ​How version control works on Replit

All four version control options interact with the same underlying Git repository:

1. Agent Checkpoints create commits automatically at important milestones when building with Replit Agent. Learn more about checkpoints and rollbacks.
1. Git Pane provides visual access to the complete Git repository
1. Git CLI offers command-line access to all Git functionality
1. File History tracks granular changes within individual files

Choose the interface that best matches your needs, with the confidence that everything is backed by Git’s robust version control system.

FeatureAgent CheckpointsGit CommitsFile HistoryCreationAutomatic at logical pointsManual or scheduledAutomatic for user editsGranularityFeature-level changesAny change sizeCharacter-level changesDescriptionAI-generated summariesUser-written messagesAutomatic timestampsRollbackOne-click restoreRequires Git knowledgeOne-click restoreGit capabilitiesFull Git capabilitiesFull Git capabilitiesNo Git capabilitiesGitHub syncFull GitHub sync capabilitiesFull GitHub sync capabilitiesNo GitHub sync

## ​Getting started

Access version control in your Replit App by adding the Git tool to your workspace:

1. Navigate to the Tools section in your Replit App
1. Select the + sign to add new tools
1. Select Git from the list of available tools

To import existing projects from GitHub, see Import from GitHub.

## ​Version control options

Replit’s version control is powered by Git at its core. You have multiple ways to interact with and benefit from version control:

### ​Automatic version control

Agent CheckpointsAutomatic snapshots created during AI-assisted development with Replit Agent.Best for: Development with Replit AgentKey capabilities:
Automatic creation at logical milestones
One-click rollback
Feature-level snapshots
Progress tracking
No setup required
Visual timeline of development progress
Agent checkpoints are stored in Git and can be accessed through the Git Pane or Git CLI. You can also visualize all your checkpoints using the History feature, which provides:
Chronological checkpoint visualization
Detailed checkpoint descriptions
Direct access to checkpoint states
One-click rollback to any checkpoint

File HistoryPer-file version tracking with automatic saving for user edits.Best for: Quick recovery of recent file changesKey capabilities:
Single file focus
Character-level changes
Visual comparison
30-day history
Playback feature
While File History provides its own interface, the underlying changes are part of Git’s history. Learn more about File History.

### ​Git-based interfaces

Git PaneA visual interface for Git operations that makes version control accessible without command-line knowledge.Best for: Most projects requiring GitHub integration and visual workflowKey capabilities:
Repository-wide tracking
Branch management
Visual diff viewing
One-click GitHub sync
Team collaboration
For detailed instructions on using the Git pane, see Using the Git pane.

Git CLIFull command-line access to Git through the Shell for advanced operations.Best for: Power users who need complete Git functionalityKey capabilities:
Full Git command set
Advanced branching strategies
Custom workflows
Script automation
Complete repository control
For common Git commands and usage, see Using the Git pane.

## ​Key features

- Visual Git interface: Manage repositories, commits, and branches without typing Git commands
- GitHub integration: Connect to GitHub repositories for backup and collaboration
- Import from GitHub: Turn any GitHub repository into a Replit App with a few clicks
- Branch management: Create, switch between, and merge branches directly in your workspace
- Conflict resolution: Identify and resolve merge conflicts with visual assistance

## ​Use cases

Tracking your personal projects

Track changes to your code as you develop, allowing you to revert to previous versions if needed. The Git pane shows your changes visually, making it easy to commit meaningful updates.

Collaborating with a team

Work with multiple developers on the same codebase without overwriting each other’s changes. Create branches for new features, then merge them back when ready. Learn more about collaboration tools.

## ​Agent checkpoints

When building applications with Replit Agent, you benefit from an additional layer of version control through checkpoints. Checkpoints automatically capture the comprehensive state of your project—including workspace contents, AI conversation context, and connected databases—at key moments during AI-assisted development.

### ​How checkpoints work

Agent checkpoints function as comprehensive snapshots of your entire Replit App state:

- Automatic creation: Agent creates checkpoints at logical points during development
- Complete state capture: Each checkpoint preserves workspace contents, AI memory, and database states
- Implementation plans: Before making changes, Agent presents a plan for your review
- Complex task tracking: Multiple checkpoints may be created for larger tasks

### ​Benefits for AI-assisted development

Agent checkpoints provide unique advantages when building with AI:

- Safety net: Experiment confidently knowing you can easily restore previous states across your entire development environment
- Progress tracking: See exactly how Agent built your application step by step
- Logical milestones: Checkpoints represent complete features rather than arbitrary save points
- Instant rollback: Return to any previous state with a single click, including database and AI context restoration

For detailed information about what checkpoints capture and comprehensive rollback capabilities, see Checkpoints and Rollbacks.

While Agent checkpoints are powerful for development with AI, consider using Git commits for long-term version tracking and collaboration, especially when working with external repositories.

## ​Next steps

To learn more about version control on Replit, see the following resources:

- Using the Git pane: Master Replit’s visual Git interface
- Import from GitHub: Turn GitHub repositories into Replit Apps
- Collaboration tools: Work with others on shared projects
- File History: Explore file-level version history
- Replit Agent: Learn more about AI-assisted development

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replit-workspace/ssh)

[Using the Git paneThe Git pane streamlines version control directly in your workspace, making code tracking, branch management, and collaboration seamless.Next](https://docs.replit.com/replit-workspace/workspace-features/git-interface)
