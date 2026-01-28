# Build from Scratch

**Source:** https://docs.replit.com/getting-started/quickstarts/from-scratch  
**Section:** getting-started  
**Scraped:** 2025-09-08 20:21:47

---

QuickstartsBuild from ScratchCopy pageLearn how to create a Replit App from scratch. Choose your language, frameworks, and databases.Copy page

## ​Create your app from a Template

⏰ Estimated time: 15 minutes

Learn how to create your Replit App from a Template in this guide. A Template is a set of ready-made
setup and configuration files that get you coding faster.

This tutorial demonstrates how to build a web app using a Replit Template for Express.js, a popular
backend JavaScript framework. Templates provide ready-made project configuration files to get you
coding faster, but exclude application logic to let you build your own ideas from scratch.

For tutorials on building apps in other ways, see Quickstart Guides.

When you complete the tutorial, your app should resemble the following image:

1

Create an App

Navigate to the Home screen and select Create App:

2

Choose a Template

Select the Choose a Template tab and enter “Express.js” in the search field to locate the corresponding Template as shown in the following image:

Set the App’s title in the Title field and make sure Private is selected. You can modify these values later.

Select Create App to proceed.

3

Modify the app using Assistant

Navigate to the Assistant tab.

Assistant is Replit’s AI-powered tool that specializes in building smaller changes to your app.

Enter the following prompt in the text area and submit it to modify a specific file:

Copy

Ask AI

```
Update the endpoint in index.js to say "Hello, Replit!" followed by a random cheerful emoji.

```

You can optionally refer to a specific filename by preceding it with the

`@`

character.

Select Apply all to accept changes or Preview code changes to view them.

After applying the changes, you should see the updated message in the Preview tab as shown in the following image:

4

Modify the code directly

Navigate to the Files tab to access your Replit App’s files.

Select index.js to open a file editor tab.

Locate the endpoint and change the message from “Hello, Replit!” to “Aloha, Replit!”

If you’re unsure where to edit, replace the endpoint with the following code:

Copy

Ask AI

```
    app.get('/', (req, res) => {
        const emojis = ['😊', '🎉', '✨', '🌟', '💫', '🌈', '🎨', '🚀'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        res.send(`<h1>Aloha, Replit! ${randomEmoji}</h1>`);
    });

```

Switch to the Preview tab and select the refresh button .

After the browser reloads, the page should resemble the following image:

## ​Explore

Try the tasks in the following sections to build your knowledge of Replit.

### ​Add a dependency using Assistant

Follow these steps to add the morgan package, which lets you configure request logging for your Express.js server:

1

Craft a prompt

From the All Tools tab or search box, locate and select Assistant.
Assistant is an AI chatbot that can modify your code to add new features or fix errors.

Enter the following prompt in the text area and submit it:

Copy

Ask AI

```
Add the morgan HTTP request logger

```

After analyzing the request and existing code, Assistant prompts you to view or accept its changes as shown in the following dialog:

Select Apply All to add the dependency and update the configuration.

2

Verify the installation

Navigate to the Dependencies tab.

The dependencies list should include the morgan package as shown in the following image:

### ​Add a dependency manually

You can edit the package manager configuration files or use the Dependencies tool to manage the frameworks and libraries your app uses.

1

Open the Dependencies tab

To access the tool, open the All Tools tab or search box, locate and select the Dependencies tab as shown in the following image:

2

Add a package

In the Imports tab, select Add new package to open a dialog. Search for and add the “express-rate-limit” package as shown in the following image:

Alternatively, select Open package.json to open package.json in an editor tab, where you can add or edit dependencies.

### ​Try Assistant’s recommendations

In addition to adding or modifying features in your app, Assistant can provide suggestions or ideas to extend its functionality.
Follow these steps to request a feature recommendation and implement it using Assistant:

1

Ask Assistant for recommendations

Navigate to the Assistant tab.

Enter the following prompt in the text area and submit it:

Copy

Ask AI

```
What features should I consider next?

```

Assistant might respond with the options shown in the following image:

2

Request a feature

Enter the following prompt in the text area and submit it:

Copy

Ask AI

```
Add API endpoints that let me modify the message

```

Assistant might respond with the implementation described in the following image:

Select Apply all to make the code changes.

3

Test the changes

Test the API endpoints by navigating to the Shell tab and running the shell commands recommended by Assistant.

Alternatively, ask Assistant to test the endpoints. In the response, you should see action buttons such as Run and Run in Shell
as shown in the following image:

Select these to execute the commands to retrieve the current message and update it.

Verify changes to the message by navigating to the Preview tab and selecting Refresh in the address toolbar.

### ​Customize the workflow

Replit Apps include a workflow, a customizable sequence of steps that execute when you select Run.
Follow these steps to set up a new workflow using Assistant.

1

Customize the workflow

The Express.js Template includes a workflow that runs a command to start the Express.js server.
However, the server requires a restart to view the latest changes to the files it serves which can
inconvenience development.

To avoid this repetitive task, you can ask Assistant to perform the following tasks:

- Install the nodemon package which automatically restarts the Express.js server when it detects file changes
- Update the workflow to manage the Express.js server using nodemon.

To request this change, navigate to the Assistant tab and enter the following prompt:

Copy

Ask AI

```
Install nodemon and configure the app to automatically restart the Express server whenever I make changes

```

Assistant’s response should resemble the following image:

Select Install to add the dependencies, and Apply All to update the configuration.

2

Test the changes

To confirm the workflow updates, select the downward arrow next to the Run or Stop button and select Manage Workflows as shown in the following image:

The name of the workflow generated by the Assistant might vary.

Select the Dev workflow to view the details, which should resemble the following image:

To ensure your App runs using the selected workflow, select Stop and then Run.

Try making a change to the message returned by the endpoint. After your update, you should see the updated message in the Preview tab.

## ​Continue your journey

Now that you’ve completed this tutorial, you’re ready to explore more possibilities with your Replit App.
Try the following next steps to enhance your skills:

- Browse the Replit Templates on the Templates page.
- Start a Replit App using the Blank Repl Template which omits language and framework setup.
- Share your completed Replit App as a Template by following the steps in the Make your Replit App Public guide.
- Learn more about Assistant’s capabilities from the Replit Assistant documentation.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/getting-started/quickstarts/ask-ai)

[Import from GitHubLearn how to import GitHub repositories into Replit using rapid import or guided import methods.Next](https://docs.replit.com/getting-started/quickstarts/import-from-github)
