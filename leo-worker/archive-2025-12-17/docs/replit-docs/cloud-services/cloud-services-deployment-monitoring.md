# Deployment Monitoring

**Source:** https://docs.replit.com/cloud-services/deployments/monitoring-a-deployment  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:24

---

Advanced ConfigurationDeployment MonitoringCopy pageThe Deployments tool provides real-time insights for your published Replit Apps.Copy page

Published app monitoring lets you track performance metrics, modify settings, and ensure your published apps run optimally.

## ​Features

- Real-time tracking: View published app status, analytics, and configuration details
- Performance analytics: Monitor page views, response times, and user engagement metrics
- Configuration management: Update commands, secrets, and published app options with just a few clicks

## ​Usage

You can access monitoring tools in the Deployments tab.

How to access DeploymentsFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select Deployments  Deployments.
Select Overview at the top.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Deployments” to locate the tool and select it from the results.
Select Overview at the top.

### ​Overview tab

The Overview tab lets you keep track of your published app’s status and configuration. It provides the following details:

- Status: Status of the Replit published app, providing insights into the various stages of the process.
- Domain: URL where you can access your Replit App
- Deployment Type: Autoscale, Reserved VM, Static, or Scheduled

Deployment Overview tab

You can perform the following actions from the Overview tab:

- Republish: Overwrite your current published app with a new snapshot and published app options. You can monitor the status of this published app in this tab.
- Edit Commands and Secrets: Modify the public directory, build command, and published app secrets.
- View publish logs: Access the logs for your published app.
- View published app: Open your published app in a new browser tab.
- QR code: Generate a QR code that you can scan with your mobile device to access the published app.
- Manage: View or update the published app’s settings.
- See all usage: View the Usage billing page.

### ​Logs tab

The Logs tab provides real-time logs for your published app. You can filter logs by the following categories:

- Errors only: View only error logs
- Search: Enter a phrase to search for in the logs
- Date: Select a date range

Deployment Logs tab

### ​Resources tab

The Resources tab provides a detailed view of your published app’s resource usage. It includes the following information:

- CPU Utilization: Percentage of CPU usage over time
- Memory Utilization: Percentage of memory usage over time

Deployment Resources tab

### ​Analytics tab

Analytics are available for Autoscale, Static, and Reserved VM Deployments.

The Analytics tab shows statistics regarding visits to web pages in your published app.
You can customize the time period using the date selector at the top.
The analytics metrics include the following:

- Page Views: Number of HTTP requests your Replit App receives per hour
- Top URLs: Most frequently visited URL paths
- Top Referrers: Traffic sources directing users to your website
- HTTP Statuses: HTTP response codes served by your Replit App
- Request Durations: Server-side load times
- Top Browsers: Browser usage among your users
- Top Devices: Operating systems and devices used to access your Replit App
- Top Countries: Geographic distribution of your users

### ​Schedule tab

Schedules are available only for Scheduled Deployments.

The Schedule tab lets you view the published app’s run history, and includes the following information:

- Time since the last run
- Date and time the run started
- Amount of time the run took
- Run status

You can perform the following actions in the Schedule tab:

- View logs: Select the  view logs icon next to the entry to view log messages.
- Cancel run: Select the  cancel icon next to the entry to stop a run in progress.
- Start a run: Select Run Now to manually start a run without altering the schedule.
- Refresh: Use the  refresh icon to update the run history.

### ​Settings tab

The Settings tab includes the following published app configuration settings:

- Resource usage: View the machine’s CPU, RAM, and usage cost for your published app.
- Domains: Link a custom domain using the Link a domain button.
- Pause: Temporarily stop your published app. This action makes your published app inaccessible, but billing continues.
- Change deployment type: Switch between different Deployment types. For example, if you initially chose Static Deployment, you can change it to reserved VM Deployments.
- Shut Down: Delete your published app and stop its billing cycle. Select Shut down to permanently stop your current published app.

## ​Next steps

- Mobile app: Publish Replit Apps from your mobile device
- Deployments: Learn more about Replit Deployment types
- Deployment pricing: View the pricing for all Deployment types

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/domain-purchasing)

[Private DeploymentsControl access to your published app without any code configuration.Next](https://docs.replit.com/cloud-services/deployments/private-deployments)
