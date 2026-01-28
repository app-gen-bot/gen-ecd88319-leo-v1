# Custom Domains

**Source:** https://docs.replit.com/cloud-services/deployments/custom-domains  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:50

---

Advanced ConfigurationCustom DomainsCopy pageUse your domain name for your Replit published apps to showcase your app from a professional, branded web address.Copy page

Custom domains let you assign your domain name, such as www.my-incredible-app.com to your Replit published app.
While Replit provides a free subdomain in the format <your-live-app-subdomain-name>.replit.app, using
a custom domain lets you create a more memorable address.

A custom domain name can help brand recognition and trust with your app’s users.

Watch the following video for a quick overview of setting up Custom Domains:

## ​Features

Custom Domains are available for the following Deployment types:

- Autoscale
- Reserved VM
- Static

The following table compares Replit’s subdomains with custom domains:

FeatureReplit SubdomainCustom DomainHostname customizationSubdomain onlyAny domain that you ownDNS update timeInstantUp to 48 hoursSecurity Certificates (TLS/SSL)Provided by ReplitProvided by ReplitPriceFreePay your domain provider

## ​Usage

How to access Custom Domains
After publishing your app, navigate to the  Deployments tab.
Select the  Settings tab.
Select Link a domain or Manually connect from another registrar as shown in the following screenshot.

Follow the steps below to set up your custom domain:

You might experience setup issues if you have one of the following: - Multiple
A records for the same domain name that point to different servers. - A
and AAAA records co-exist for the same domain since Replit only supports A
records. - Cloudflare proxied domain records since Replit cannot automatically
renew security certificates for that type.

1

Add your custom domain

Enter your custom domain name in the text field. You can use a registered domain or include a subdomain.

For example, hat-tip.cc is the registered domain and my.hat-tip.cc includes subdomain my.

2

Add the DNS records to your domain registrar

Replit generates DNS records that you must provide to your domain registrar.
A domain registrar is the service that manages your domain name, such as GoDaddy or Namecheap.

Copy the A and TXT record values from Replit and paste them into your domain registrar’s
DNS management section. If your domain registrar does not support @ as a hostname, use your registered domain name.

3

Optional: Add a subdomain

To add a subdomain to your published app, add a new A record with the same IP address
in your provider’s DNS management section.
For example, if you want to add my-subdomain.hat-tip.cc, you must:

- Copy the A and TXT record values from Replit to your registrar
- Add a new A record with a hostname value of my-subdomain using the same IP address as your primary domain

4

Wait for DNS propagation to complete

After adding the records, you must wait for them to propagate online.
This can take between a few minutes and 48 hours.

When the propagation completes, your Domains tab should show the “Verified” status next to the domain name as shown below:

Load the domain in your browser to verify that it works.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/scheduled-deployments)

[Domain PurchasingPurchase and connect domains for your Replit published apps directly within the platform to make your apps accessible with custom URLs.Next](https://docs.replit.com/cloud-services/deployments/domain-purchasing)
