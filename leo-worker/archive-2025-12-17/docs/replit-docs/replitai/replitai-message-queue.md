# Message Queue

**Source:** https://docs.replit.com/replitai/message-queue  
**Section:** replitai  
**Scraped:** 2025-09-08 20:19:07

---

FeaturesMessage QueueCopy pageSchedule follow-up tasks for Replit Agent while it’s working. Queue messages to be executed in order after each Agent work loop completion.Copy page

The Message Queue is a new way of interacting with Replit Agent while it’s working.
Instead of interrupting ongoing work, you can schedule follow-up tasks that will be executed in
order after every completion of an Agent work loop.

## ​How it works

When the Agent is actively handling a request, you can schedule a follow-up task by adding
messages to the Queue. These tasks or requests will be processed in order after every completion of
an Agent work loop. The queue is automatically cleared when Agent finishes all tasks.

All message options are available with the Queue, such as Visual Editor,
file attachments, and Dynamic Intelligence.

Queued messages will only be processed automatically while you have an active
workspace connected to the Agent (either on desktop or mobile).

## ​Using the Message Queue

### ​When the Queue appears

The Message Queue appears automatically as a drawer above the chat input when you submit a message
while Agent is working. It closes once all queued messages are processed.

### ​Managing queued messages

When the queue drawer is open, you can:

- Edit messages: Click the edit icon to modify a queued message before it’s processed
- Delete messages: Remove unwanted tasks from the queue
- Reorder items: Drag and drop to change the execution order of queued messages
- Add more messages: Continue adding new tasks to the queue via the chat input

### ​Immediate interruption

If you need to interrupt Agent and send a message immediately, you can use the Pause button
in the status bar. This will stop the current Agent work loop and allow you to send an immediate
message, bypassing any queued messages (if any exist).

## ​Best practices

### ​When to use the Message Queue

- Multi-step workflows: Queue a series of related tasks that build upon each other
- Batch operations: Group similar requests together for efficient processing
- Follow-up requests: Add clarifications or additional requirements after the initial task
- Non-urgent tasks: Queue lower-priority requests while Agent works on critical tasks

### ​When to use immediate interruption

- Urgent changes: When you need to stop current work immediately
- Critical errors: If you notice an issue that needs immediate attention
- Change of direction: When you want to completely change what Agent is working on

## ​Queue behavior

- Ordered execution: Messages are processed in the order they were added to the queue
- Work loop completion: Each queued message is processed after Agent completes its current work loop
- Context preservation: Agent maintains context between queued messages in the same conversation

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replitai/integrations)

[replit.md`replit.md` is a special file that customizes Agent's behavior in your project. Define your preferences, coding style, and project context to help Agent build exactly what you want.Next](https://docs.replit.com/replitai/replit-dot-md)
