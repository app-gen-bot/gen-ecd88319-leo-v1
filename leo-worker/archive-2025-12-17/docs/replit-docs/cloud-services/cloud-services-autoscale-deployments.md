# Autoscale Deployments

**Source:** https://docs.replit.com/cloud-services/deployments/autoscale-deployments  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:11:01

---

Deployment TypesAutoscale DeploymentsCopy pageAutoscale Deployments publish your Replit App to cloud servers that adjust automatically to handle your app’s traffic and workload.Copy page

Autoscale Deployments run on cloud computing resources that scale up and down to efficiently handle the
network traffic and workload of your Replit App. When your app is busy, autoscaling adds servers to
manage the load. When your app is idle, it reduces the number to as low as zero to save you money.

Autoscale Deployments are ideal for the following use cases:

- Web applications that handle variable workloads and traffic such as ecommerce sites
- APIs and services

## ​Features

Autoscale Deployment include the following features:

- Automatic resource scaling: Automatically adjusts resources based on traffic patterns to optimize costs.
- Custom domains: Configure a custom domain or use a <app-name>.replit.app URL to access your app.
- Configurable limits: Set the maximum number of instances your published app can scale to.
- Flexible machine power: Choose the CPU and RAM configuration that meets your app’s needs.
- Monitoring: View logs and monitor your published app’s status.

## ​Usage

You can access Autoscale Deployment in the Publishing workspace tool.

How to access Autoscale DeploymentFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Publishing.
Select the Autoscale option and then select Set up your published app.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Publishing” to locate the tool and select it from the results.
Select the Autoscale option and then select Set up your published app.

Autoscale configuration screen in the Publishing tool

## ​Machine power

Select Edit to view and set the machine power options. Use the sliders to select the CPU and RAM configuration
for each published app server instance.

View the compute unit cost for the configuration in the Total per machine row.
A compute unit is a measurement of cloud computing resources based on the memory and CPU configuration of the machine.

To learn more about calculating the cost based on Compute Units, see Compute Units.

## ​Max number of machines

Use the slider to adjust the maximum number of machines. This number is the upper limit of server
instances the autoscaling feature can assign when it determines your app is busy.

The bottom row shows the equivalent compute units, calculated by the following formula:

Number of machines * compute units per machine

## ​Next steps

- Deployment Monitoring: Learn how to view logs and monitor your scheduled deployment.
- Deployment pricing: View the pricing associated with deployments.
- Pricing: View the pricing and allowances for each plan type.
- Usage Allowances: Learn about scheduled deployment usage limits and billing units.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/category/replit-deployments)

[Static DeploymentsStatic Deployments publish your static websites and frontend apps to a cost-effective cloud server.Next](https://docs.replit.com/cloud-services/deployments/static-deployments)
