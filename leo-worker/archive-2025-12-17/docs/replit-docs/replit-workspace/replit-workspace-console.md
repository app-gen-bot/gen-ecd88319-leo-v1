# Console

**Source:** https://docs.replit.com/replit-workspace/workspace-features/console  
**Section:** replit-workspace  
**Scraped:** 2025-09-08 20:20:07

---

FeaturesConsoleCopy pageConsole shows the output of running your Replit App code, informing you of activity and errors.Copy page

Console lets you monitor and review logs printed by your running Replit App in real time.
You can use information from current and past runs to understand your app’s behavior,
troubleshoot errors, and optimize performance.

When debugging using Agent, include console logs in your prompt to provide context.

## ​Features

Console provides the following tools to help you understand your app’s behavior:

- Real time logging: View your app’s output as it happens
- AI assistance: Receive suggestions to fix errors reported in the logs
- Run history: Show logs from prior runs to track changes

## ​Usage

You can access the Console tool directly in your Replit App workspace.

How to access ConsoleFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Console.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Console” to locate the tool and select it from the results.

Each time you use the Run button in your Replit App, Console displays a new entry that includes the following information:

- The Command that executed your code
- Timestamp information
- Standard output and error logs

The following screenshot shows the npm run dev command used to start the app and log messages from the run:

Client-side logs, such as those generated from HTML, CSS, and JS code, appear only in the Developer tools in the Preview tool.

### ​AI-powered debugging

When you encounter errors or other information in the logs that you want to understand, select the
Ask Assistant button at the top of the entry. This automatically opens the Assistant tab and
submits the log content to Assistant for analysis.

### ​Log entry commands

Console provides the following tools to manage your logs:

- Show Only Latest: Toggle this control to the on position to display only the most recent run.
- Collapse entry: Select the  downward arrow to the left of the command name to hide the logs.
- Clear past runs: Select this to delete logs of prior runs. This action is irreversible.

### ​Network availability

You can control the development version of your app’s availability online.

To stop serving requests to the development URL, select the  globe with slash icon
on the right side of the network information line.

To enable it, select the  globe icon.

To view your development URL, select the {...}.replit.dev text in the location bar.

Your app remains accessible in the Preview tool even when set to stop serving requests to the development URL.

### ​Stop a workflow command

You can stop a running workflow command from the Console workspace tool.

Select the square button on the right side of the line that contains your Replit App run command to terminate it.

To restart your app, use the workflow Run button at the top of your workspace.

## ​Next steps

To learn more about related Workspace tools see the following resources:

- Preview: Explore the Preview tool for testing your application and viewing console output
- Assistant: Learn about Assistant for code help and error resolution
- Shell: Learn how to use the command-line interface in your workspace.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/category/workspace-features)

[Dependency ManagementReplit supports a variety of languages and dependency management systems through the Dependencies tool. This section will cover the different types of dependencies and how to manage them in your Replit App.Next](https://docs.replit.com/replit-workspace/dependency-management)
