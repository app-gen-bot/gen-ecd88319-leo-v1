# Deployment pricing

**Source:** https://docs.replit.com/billing/deployment-pricing  
**Section:** billing  
**Scraped:** 2025-09-08 20:12:00

---

BillingDeployment pricingCopy pageFlexible deployment pricing that scales with your app’s needs. Pay only for what you use with transparent, credit-based billing.Copy page

Replit’s deployment pricing is designed to scale with your app’s needs. Choose from usage-based billing that charges only when your app serves requests, or predictable flat-rate options for consistent workloads.

## ​How billing works

All deployment costs are deducted from your monthly credits. You only pay usage-based fees after your monthly credits are fully used.

- Core Plan: Includes  in monthly credits
- Teams Plan: Includes  in monthly credits per member

Credits apply automatically to all deployment costs. Unused credits don’t roll over to the next month. Learn more about usage-based billing.

For a hands-on understanding of deployment costs, explore our interactive pricing calculator.

## ​Deployment types

Choose the deployment type that best fits your app’s traffic patterns and resource needs.

Autoscale DeploymentsUsage-based billing that scales automatically with demandPerfect for apps with variable traffic. Pay only when your app serves requests—nothing when idle.Best for: Web apps, APIs, and services with unpredictable traffic patternsLearn more about Autoscale Deployments

Reserved VM DeploymentsPredictable monthly costs with dedicated resourcesGuaranteed compute resources that run continuously. Choose shared or dedicated VMs based on your performance needs.Best for: Production apps with steady traffic or guaranteed resource requirementsLearn more about Reserved VM Deployments

Scheduled DeploymentsCost-effective for background tasks and automationRun code on a schedule without maintaining persistent infrastructure.Best for: Background jobs, data processing, and automated tasksLearn more about Scheduled Deployments

Static DeploymentsMinimal costs for static content with global distributionPublish static sites with CDN distribution and pay only for data transfer.Best for: Documentation sites, portfolios, and single-page applicationsLearn more about Static Deployments

## ​Understanding request-based billing

With Autoscale Deployments, you only pay when your app is actively working. When no one visits your app, you pay nothing.

Autoscale Deployments use request-based billing—you’re charged only when your app serves traffic. Here’s how it works:

1. App starts up when the first request arrives (if idle)
1. Processes the request using compute resources
1. Goes idle after 15 minutes of inactivity

Billing time: Often just 1-2 seconds per request, even for complex apps.

### ​Request-based Billing Timeline

When no one visits your app, you pay nothing. When your app is busy, you pay for the compute resources used.

Here’s a timeline of what happens when someone visits your app:

Request-based Billing Timeline

Instance

Running

Requests

Billable

Started

Stopped

First, the server starts up. Then, it processes the requests. Finally, it goes idle. You only pay for CPU and memory during request processing.

When multiple requests arrive simultaneously (like the stacked blue bars), they share the same compute resources.

Your billing time extends to cover all concurrent requests, but you don’t pay separately for each—just for the total time the server is working.

The gaps between green bars represent cost savings during idle time. At the end of the session, the server shuts down.

### ​Compute units explained

Compute units measure the computational work your app performs:

- CPU time: Processing power used (1 CPU second = 18 compute units)
- Memory time: RAM consumed (1 GB-second = 2 compute units)
- Duration: How long your app works on each request

## ​Pricing breakdown

Autoscale DeploymentsPay only when your app serves requests. Automatically scales based on demand.ComponentPriceBase fee (per month)Compute units (per million units)Requests (per million requests)

Scheduled DeploymentsExecute background tasks and scheduled jobs.ComponentPriceBase fee (per month)Compute units (per million units)Scheduler

Reserved VM DeploymentsDedicated compute resources with predictable monthly costs.​Shared VMsConfigurationPrice (per month)0.25 vCPU / 1GB RAM0.5 vCPU / 2GB RAM​Dedicated VMsConfigurationPrice (per month)1 vCPU / 4GB RAM2 vCPU / 8GB RAM4 vCPU / 16GB RAM

Static DeploymentsHost static sites with global CDN distribution.ComponentPriceHostingFreeData transfer (per GB)

## ​Cost examples by app type

These examples show realistic costs for different types of applications.

Personal blogTraffic: 50 visitors/day, 3 page views each = 4,500 requests/monthComponentUsageCostBase feeMonthlyCompute units13,500 units~$0.04Requests4,500~$0.01Total~$1.05

Small business websiteTraffic: 500 visitors/day, 5 page views each = 75,000 requests/monthComponentUsageCostBase feeMonthlyCompute units600,000 units~$1.92Requests75,000~$0.15Total~$3.07

API serviceTraffic: 10,000 API calls/day = 300,000 requests/monthComponentUsageCostBase feeMonthlyCompute units3.96M units~$12.67Requests300,000~$0.60Total~$14.27

Background processing jobUsage: Daily data processing with Scheduled DeploymentsComponentUsageCostScheduled deploymentBase feeCompute units50,000 units~$0.16Total~$1.16

## ​Monitor and control costs

[Set spending controlsConfigure spending alerts and budgets to prevent unexpected charges.](https://docs.replit.com/billing/managing-spend)

[Monitor usageTrack real-time consumption and costs in your Usage dashboard.](https://replit.com/usage)

[Learn about AI billingUnderstand how Agent and Assistant affect your bill.](https://docs.replit.com/billing/ai-billing)

[Monitor deploymentsView logs, track performance, and monitor deployment status.](https://docs.replit.com/cloud-services/deployments/monitoring-a-deployment)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/billing/ai-billing)

[App StorageLearn how Replit charges for App Storage.Next](https://docs.replit.com/billing/object-storage-billing)
