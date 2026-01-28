# Static Deployments

**Source:** https://docs.replit.com/cloud-services/deployments/static-deployments  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:12

---

Deployment TypesStatic DeploymentsCopy pageStatic Deployments publish your static websites and frontend apps to a cost-effective cloud server.Copy page

Static Deployments host your Replit App’s static files, such as HTML, CSS, and JavaScript
on a cloud server. The server automatically uses caching and scaling strategies to deliver
your content quickly and economically.

Static Deployments are ideal for the following use cases:

- Marketing landing pages
- Portfolio websites
- Product and API documentation sites

Static Deployments are not compatible with Replit Apps created using Agent.
Agent automatically creates full-stack apps that require a backend server. For
Agent-generated apps, use one of the following deployment types: - Autoscale
Deployment - Reserved VM
Deployment

## ​Features

Static Deployments include the following features:

- Cost-effective hosting: Pay only for the amount of data your website serves.
- HTTP routing options: Configure response headers, URL rewrites, and redirects.
- Custom domains: Configure a custom domain or use a <app-name>.replit.app URL to access your app.
- Custom error pages: Create and serve a custom 404 error page.
- Monitoring: View logs and monitor your published app’s status.

## ​Usage

You can access Static Deployments in the Deployments workspace tool.

How to access Static DeploymentsFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Deployments.
Select the Static option and then select Set up your published app.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Deployments” to locate the tool and select it from the results.
Select the Static option and then select Set up your published app.

### ​Primary domain

Specify the subdomain part of the hostname for your published app. After you publish, you can access your published app at https://<subdomain>.replit.app.

To learn how to use a custom domain, see Custom Domains.

### ​Private deployment

The private published app feature is available for Teams and Enterprise plans
only.

Private published apps grant permission to your app only to members of your team or organization.
This control lets you toggle whether to make your published app private.

To learn how to set up a private deployment, see Private Deployments.

### ​Public directory

Specify the base directory path in your Replit App that contains the static files you want to serve publicly.
After you deploy, the cloud host serves all pages and assets in that directory.

The default value, /, is the root directory of your Replit App.

### ​Build command

Specify a build command to run in your Replit App’s shell when you create your Deployment.

For example, if you generate a static site using Hugo,
you might use the command hugo --minify to generate the files and optimize asset file sizes.

### ​Deployment secrets

Select Add deployment secret to add environment variables or secrets your build command needs to run securely.

For example, if your site generator requires an API key to create your static site, you might pass it
API_KEY=<your secret name>.

## ​Next steps

- Static Deployment Configuration: Configure HTTP headers, a custom 404 page, and URL rewrites
- Deployment Monitoring: View logs and monitor your scheduled deployment
- Deployment pricing: View the pricing associated with deployments
- Pricing: View the pricing and allowances for each plan type
- Usage Allowances: Learn about scheduled deployment usage limits and billing units

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/autoscale-deployments)

[Reserved VM DeploymentsReserved VM Deployments publish your Replit App to an always-on cloud server.Next](https://docs.replit.com/cloud-services/deployments/reserved-vm-deployments)
