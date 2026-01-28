# Scheduled Deployments

**Source:** https://docs.replit.com/cloud-services/deployments/scheduled-deployments  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:29

---

Deployment TypesScheduled DeploymentsCopy pageScheduled deployments run your Replit App tasks on a schedule with minimal setup.Copy page

Define a command-line operation and a schedule, and Replit runs it automatically
in your Replit App’s environment. After completion, the operation terminates until the
next scheduled run.

Scheduled deployments, also known as scheduled jobs, work best for handling periodic tasks
such as checking status, sending notifications, and starting backups. They are not designed
for continuous or long-running tasks such as web applications.

## ​Features

Scheduled deployments include the following features:

- Automatic scheduling: Schedule your task, and Replit runs it automatically.
- Natural language scheduling: Enter a human-readable description of the schedule, and AI converts it into a cron expression, a computer-readable schedule format.
- Error alerts: Receive notifications when your scheduled task fails.
- Monitoring: View logs and monitor your scheduled deployment’s status.

## ​Usage

You can access scheduled deployments in the Deployments workspace tool.

The following sections guide you through setting up and managing your scheduled deployments.

How to access Scheduled DeploymentsFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Deployments.
Select the Scheduled option and then select Set up your published app.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Deployments” to locate the tool and select it from the results.
Select the Scheduled option and then select Set up your published app.

Scheduled Job configuration screen in the Deployments tool

### ​Machine configuration

This field lets you view the machine’s CPU, RAM, and usage cost for your scheduled deployment.

### ​Schedule fields

- Schedule description: Enter a natural language description of the schedule, such as “Every Monday and Wednesday at 10 AM” or “March 24th, 2024 at 3 PM.”
- Cron expression: Optionally, enter a computer-readable string that defines when the task should run.
- Timezone selection: Select the timezone for the schedule from the dropdown menu.

When you enter a value in the Schedule description or Cron expression field, AI translates it automatically to match.
To learn more about cron expressions, see the cron Wikipedia page.

### ​Job timeout

Enter the maximum amount of time the job can run before the scheduler terminates it. Select either “minutes” or “hours from the time unit dropdown.

Scheduled jobs may run slower than in the Replit App workspace. Test the
deployment and adjust the timeout accordingly.

### ​Build command

Enter the shell command that compiles or sets up your app before running the Run command in the Build command field.
For example, to install your Node.js app dependencies, you might add the npm install build command.

The build command time does not count toward your usage and is not counted against the job timeout.

### ​Run command

Enter the shell command that launches your task in the Run command field.
For example, to run a Python script, you might add python app.py as the run command.

The Replit scheduler executes the run command at the scheduled times.
The time it takes to run the command counts toward your usage. For more information on usage billing,
see the Scheduled Deployments section in our pricing documentation.

### ​Deployment secrets

Select Add deployment secret to add environment variables or secrets your app needs to run securely.

If your Replit App has environment variables or secrets, the Deployment tool adds them to the list automatically.

To edit the values of an environment variable select the

vertical dots and choose Edit from the menu. The Secrets manager only applies
value to the deployment and does not change environment variables defined in your
Replit App.

## ​Next steps

To learn more about deployments, see the following resources:

- Deployment Monitoring: Learn how to view logs and monitor your scheduled deployment.
- Deployment pricing: View the pricing associated with deployments.
- Pricing: View the pricing and allowances for each plan type.
- Usage Allowances: Learn about scheduled deployment usage limits and billing units.
- Create a HackerNews Slack bot: Learn how to create a Slack bot that checks a website for new content and sends you notifications on a schedule.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/reserved-vm-deployments)

[Custom DomainsUse your domain name for your Replit published apps to showcase your app from a professional, branded web address.Next](https://docs.replit.com/cloud-services/deployments/custom-domains)
