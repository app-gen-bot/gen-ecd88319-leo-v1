# Replit App Embed

**Source:** https://docs.replit.com/replit-app/app-embed  
**Section:** replit-app  
**Scraped:** 2025-09-08 20:24:17

---

Replit AppsReplit App EmbedCopy pageEmbedding a Replit App in your website or documentation allows you to display a read-only view of your code, meaning viewers can see but not edit the code. This feature is particularly useful for showcasing examples, tutorials, or code snippets directly within your content.Copy page

### ​Running and deploying

To interact with the Replit App, such as running the code and seeing its output, users must fork it. Forking creates a personal copy of the Replit App in their workspace, where they can run and edit the code. For a more integrated experience, you can deploy your Replit App and use an iframe to embed the deployed application from replit.app directly into your site.

### ​How to embed a Replit App

To embed a public Replit App, append the ?embed=true query parameter to the Replit App’s URL. This modification converts the URL into an embeddable link. Below is an example demonstrating how to embed a Replit App using an iframe in HTML:

Copy

Ask AI

```
<iframe src="YOUR Replit App LINK?embed=true" width="600" height="400"></iframe>

```

Replace YOUR Replit App LINK with the actual link to your Replit App, for example, https://replit.com/@user/repl-name.

Here’s an example of an embedded Replit App:

### ​Customizing the theme

You can customize the appearance of the embedded Replit App by setting the theme. Add theme=light or theme=dark at the end of the URL to choose between a light or dark theme. For instance, to embed a Replit App with a light theme:

Copy

Ask AI

```
<iframe src="YOUR Replit App LINK?embed=true&theme=light" width="600" height="400"></iframe>

```

Example with a light theme:

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replit-app/configuration)

[Developer FrameworksIf your Replit App can be used as a good starting point for other project, you might want to submit it as a developer framework! Let's learn what a Replit developer framework is and how to make a good one.Next](https://docs.replit.com/replit-workspace/templates)
