AI App Generator SaaS – High‑Level Design Spec

1. Purpose

This document specifies what the SaaS does and only the minimum necessary how to communicate the intended architecture and UX to an app‑generation system. It intentionally avoids low‑level infrastructure detail.

The SaaS generates full applications for users, shows build progress, and previews the resulting app live in the browser.

⸻

2. User Types

2.1 Customer Users (Primary)
	•	Goal: confidence, clarity, and results
	•	Do not want raw logs
	•	See:
	•	High‑level build progress (steps)
	•	Feature completion states
	•	Screenshots or live preview when ready

2.2 Internal Developer Users (Dogfooding)
	•	Goal: debugging and insight
	•	Do want raw logs
	•	See:
	•	Full console output
	•	Timestamps and ordering
	•	Same live preview as customers

⸻

3. Core Concepts

3.1 SaaS Orchestrator
	•	Runs as a single container initially
	•	Responsibilities:
	•	API server
	•	Auth & permissions
	•	App container lifecycle
	•	Event routing
	•	WebSocket fan‑out
	•	Preview URL routing

3.2 Generated App Containers
	•	One container per generated app
	•	Isolated and ephemeral
	•	Responsibilities:
	•	Run the app generator
	•	Emit events (logs, step changes)
	•	Optionally expose a web server for preview

⸻

4. Event Model (Unifying Abstraction)

All build activity is represented as an append‑only event stream per app.

4.1 Event Types (examples)
	•	STEP_STARTED
	•	STEP_COMPLETED
	•	STEP_FAILED
	•	FEATURE_STARTED
	•	FEATURE_COMPLETED
	•	LOG (stdout / stderr)
	•	APP_READY

Events are the single source of truth.

⸻

5. UI Model

5.1 Two‑Panel Layout (Browser)

+---------------------------+---------------------------+
| Left Panel                | Right Panel               |
|                           |                           |
| Progress / Console        | App Preview               |
|                           | (iframe or screenshots)   |
+---------------------------+---------------------------+

5.2 Left Panel – Process View

Customer Users
	•	Step list with states:
	•	Not started
	•	In progress
	•	Complete
	•	Failed
	•	Optional feature checklist
	•	Friendly error messages

Internal Developers
	•	Raw console output
	•	Ordered, timestamped
	•	Replayable

Both views are derived from the same event stream.

⸻

5.3 Right Panel – Artifact View

Shows what exists so far, not how it was built.

Supported modes:
	1.	Placeholder / empty state
	2.	Periodic screenshots (early stages)
	3.	Live interactive app (iframe)

The panel updates based on milestone events, not log lines.

⸻

6. Streaming & Routing Model

6.1 Browser Connection
	•	One persistent connection per browser session (WebSocket or SSE)
	•	Multiple apps multiplexed logically

6.2 App Selection
	•	User may generate and observe multiple apps concurrently
	•	Only one app is active in the UI at a time
	•	Switching apps:
	•	Changes which event stream is rendered
	•	Changes preview URL in iframe
	•	Does not pause background apps

⸻

7. Preview Routing (High Level)
	•	Each app is assigned a stable preview URL
	•	The SaaS routes that URL to the correct app container
	•	Browser iframe loads the preview like a normal website

The browser does not connect directly to containers.

⸻

8. Permissions & Visibility
	•	Internal developers:
	•	Can see all event types, including logs
	•	Customer users:
	•	See only projected state (steps, features, milestones)
	•	Never see raw logs by default

⸻

9. Key Design Principles (Non‑Negotiable)
	1.	One event stream, multiple views
	2.	Logs are internal; progress is customer‑facing
	3.	Left panel explains the process
	4.	Right panel shows the result
	5.	Apps are independent; user focus is a cursor

⸻

10. Explicit Non‑Goals (for v1)
	•	No per‑app Kafka or complex streaming infra
	•	No infinite log retention
	•	No tight coupling between logs and preview
	•	No multi‑container SaaS deployment initially

⸻

11. Success Criteria
	•	Users can generate apps and understand progress without reading logs
	•	Internal developers can fully debug generation issues
	•	Users can switch between multiple apps without disruption
	•	Preview panel reliably reflects the current state of the app

⸻
