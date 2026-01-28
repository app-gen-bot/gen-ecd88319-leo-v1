# Vibe coding 101: from idea to published app

**Source:** https://docs.replit.com/tutorials/vibe-coding-101  
**Section:** tutorials  
**Scraped:** 2025-09-08 20:03:55

---

Vibe Coding & PromptingVibe coding 101: from idea to published appCopy pageLearn how to go from an idea to a published application using Replit Agent and Assistant, featuring an interactive map visualization project.Copy page

[Matt PalmerHead of Developer Relations](https://youtube.com/@mattpalmer)

This tutorial walks you through the “vibe coding” process on Replit—taking an idea from concept to a fully published application. This tutorial will build an interactive map visualization of San Francisco parks, pulling in external data and using modern frameworks. You’ll see how to leverage Replit Agent for initial development and Replit Assistant for refinements and debugging.

## ​The vibe coding philosophy

Vibe coding is less about writing every line of code and more about guiding AI tools with your vision and domain knowledge. It’s an iterative process of prompting, reviewing, and refining.

Key takeaways from the video:

- Conceptualize First: Start with a clear idea of what you want to build. Visualizing the end product helps, especially when prompting AI.
- Domain Knowledge is Power: Knowing relevant frameworks (like Leaflet.js for maps) or data sources (like OpenStreetMap) significantly improves AI-generated results.
- Iterative Development: Expect to debug and refine. AI tools are powerful, but they’re collaborators, not magic wands.

## ​Project: San Francisco parks map

The goal is to build an interactive map displaying parks and public spaces in San Francisco.

Problem Statement: The goal is an interactive map to discover parks and public spaces in San Francisco.
Solution: An interactive tool using Leaflet.js and OpenStreetMap data.
Key lessons:

- Prompting AI effectively.
- Processing external data.
- Debugging and handling errors.

## ​Building with Replit Agent

Replit Agent can scaffold entire projects, set up environments, and generate initial code.

1

Crafting the Initial Prompt

A good prompt is specific. We tell Agent:

- The goal: “Help me create a minimalist maps app to visualize San Francisco’s parks.”
- Key technologies: “You should use leaflet for map visualization and fetch data from OpenStreetMap.”
- Specific data types from OpenStreetMap (after research): Natural formations (woods, beaches, islets, cave entrances) and leisure locations (parks, gardens).

Copy

Ask AI

```
Help me create a minimalist maps app to visualize San Francisco’s parks. You should use leaflet for map visualization and fetch data from OpenStreetMap. Include the following OpenStreetMap data types for San Francisco: natural formations (woods, beaches, islet, cave entrance) and leisure (park, gardens).
```

To learn more about how to write effective prompts, check out this article.

2

Attaching a Mockup

Visual aids help Agent understand the desired layout and features. A simple sketch or mockup can be attached directly to the prompt.

3

Agent's Process

1. Plan Creation: Agent outlines the steps it will take. Review and approve this plan.
1. Visual Preview: Agent streams a visual preview of the app’s UI.
1. Environment Setup: Agent configures the development environment, installing necessary languages and packages—no manual setup required.
1. Building the App: Agent writes the code for the front end and back end.
1. Checkpoints: Agent creates checkpoints (Git commits) so you can roll back if something goes wrong.

4

Debugging with Agent

Errors happen. Use the browser’s DevTools (specifically the Console and Network tabs) to find error messages.

- Observe: The map loaded, but no data points appeared.
- Investigate: The console showed an error: “Failed to fetch map features error cannot read properties of undefined reading natural.”
- Inform Agent: Paste the error message directly into the chat with Agent. Agent will attempt to debug and fix the issue.

In the video, Agent identified an issue with parsing the Overpass API response and added robust error handling, which resolved the problem.

## ​Refining with Replit Assistant

Once Agent builds the MVP, switch to Replit Assistant for smaller, more targeted edits and refinements. Assistant is generally faster for these tasks.

Improving Map StylingThe initial map was functional but could look better.
Prompt to Assistant: “Can you use a more minimalist carto style for OpenStreetMap? Carto lite.”This relies on knowing that “Carto lite” is a known theme for Leaflet maps.

Adding Dark ModeA common refinement is adding a dark mode.
Prompt to Assistant: “Can you add a dark mode to my app and use, carto dark for the map in the dark mode?”Assistant will:
Read files for context.
Make changes to necessary files (e.g., theme providers, styles).
Restart the app to apply changes.

Iterative Debugging with AssistantAdding dark mode involved several iterations:
Initial implementation had a toggle that worked for the map but then disappeared.
Feedback: “The toggle theme button works for the map, but it disappears when clicked. The theme toggle should be in the side nav and the theme should be applied to the side nav.”
Issues with multiple toggle buttons and incorrect component references (side nav vs. sidebar).
Feedback & Guidance: “Now there are two toggle themes. One controls the map, the other controls the side nav. Make them into one in the side. Now and update the CSS.”
When Assistant made an incorrect assumption (e.g. SideNav component), explicitly pointing it to the correct file (@Sidebar) helps.
Final fix to ensure the dark mode toggle in the sidebar correctly toggled the map theme to Carto Dark.
Feedback: “Now the dark mode toggle in @Sidebar does not toggle the map to carto dark.”
This process highlights the “conversation” aspect of vibe coding. Be descriptive and guide the AI.

## ​Publishing your application

Replit makes publishing straightforward.

1. Select the Publish button.
1. Agent suggests a publishing configuration (e.g., app name, build and run commands). Review and confirm.
1. If your app uses API keys or other sensitive information, store them in Secrets. Agent will use these securely.
1. Select Publish. Replit bundles your app and makes it live on the web.

Your published app will have a public URL (e.g., park-mapper.replit.app). Changes made in your development environment won’t affect the published version until you click Republish.

## ​Recap and next steps

This tutorial went from an idea to a published interactive map application without writing a single line of code manually. Replit Agent was used for the heavy lifting and Replit Assistant for refinements, leveraging domain knowledge and an iterative debugging process.

Potential Next Steps for the Park Mapper App:

- Add a database to store park data persistently (avoiding re-fetch on every load).
- Allow users to save or favorite parks.
- Implement advanced filtering.
- Improve styling and add custom icons for map markers.
- Enhance mobile responsiveness (e.g., ensuring filters are accessible on mobile).

Vibe coding is about iterating, experimenting, and guiding AI to bring your ideas to life. Don’t be afraid of errors; they are part of the process!

Was this page helpful?

Yes

No

[Efficient promptingLearn principles and see examples for writing effective prompts when using AI development tools like Replit Agent and Assistant.Next](https://docs.replit.com/tutorials/effective-prompting)
