# Reserved VM Deployments

**Source:** https://docs.replit.com/cloud-services/deployments/reserved-vm-deployments  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:38

---

Deployment TypesReserved VM DeploymentsCopy pageReserved VM Deployments publish your Replit App to an always-on cloud server.Copy page

A Reserved VM deployment runs on a virtual machine (VM) which provides dedicated computing resources for
your app. This deployment type offers predictable costs and performance without interruptions.

They are ideal for the following use cases:

- Memory-intensive background tasks
- Chat app bots that must stay connected
- Always-on API servers

## ​Features

Reserved VM Deployments include the following features:

- Dedicated resources: Get consistent app performance on reserved compute resources.
- Custom domains: Configure a custom domain or use a <app-name>.replit.app URL to access your app.
- Computing resource options: Choose the VM option that meets your app’s performance needs.
- Configurable port mappings: Define which ports your app exposes to the internet.
- Monitoring: View logs and monitor your published app’s status.

## ​Usage

You can access Reserved VM Deployments in the Deployments workspace tool.

How to access Reserved VM DeploymentsFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Deployments.
Select the Reserved VM option and then select Set up your published app.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Deployments” to locate the tool and select it from the results.
Select the Reserved VM option and then select Set up your published app.

Reserved VM configuration screen in the Deployments tool

### ​Machine configuration

Select the CPU and RAM configuration for the machine that hosts your deployment. You can view the option’s cost next to the selected machine size.

### ​Primary domain

Specify the subdomain part of the hostname for your published app. After you publish, you can access your published app at https://<subdomain>.replit.app.

To learn how to use a custom domain, see Custom Domains.

### ​Private deployment

The private published app feature is available for Teams and Enterprise plans
only.

Private published apps grant permission to your app only to members of your team or organization.
This control lets you toggle whether to make your published app private.

To learn how to set up a private deployment, see Private Deployments.

### ​Build command

Enter the shell command that compiles or sets up your app before running the Run command in the Build command field.
For example, to optimize your JavaScript app for a production environment using Vite, you might add the vite build command.

### ​Run command

Enter the shell command that launches your task in the Run command field. This command should be similar to the one
you use for your workflow. For example, to start a Flask app called “myApp”, you might add the flask --app myApp run command.

### ​Published app secrets

Select Add published app secret to add environment variables or secrets your app needs to run securely.

If your Replit App has environment variables or secrets, the Deployment tool adds them to the list automatically.

### ​App type options

Select one of the following options:

- Web server: Select this option if publishing a web app or an app that users can connect to on the internet.
- Background worker: Select this option if your app does not listen on a port or start a server.

When you select Web Server, you can customize which ports to expose by performing the following actions:

1. Expand the Port configuration section.
1. Select Networking pane to configure to open the Networking tab, where you can manage the port mappings.

For more information on configuring ports, see Ports.

## ​Next steps

To learn more about publishing, see the following resources:

- Published App Monitoring: Learn how to view logs and monitor your scheduled deployment.
- Publishing pricing: View the pricing associated with publishing.
- Pricing: View the pricing and allowances for each plan type.
- Usage Allowances: Learn about scheduled deployment usage limits and billing units.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/static-deployments)

[Scheduled DeploymentsScheduled deployments run your Replit App tasks on a schedule with minimal setup.Next](https://docs.replit.com/cloud-services/deployments/scheduled-deployments)
