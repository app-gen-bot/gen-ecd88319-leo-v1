# Domain Purchasing

**Source:** https://docs.replit.com/cloud-services/deployments/domain-purchasing  
**Section:** cloud-services  
**Scraped:** 2025-09-08 20:10:18

---

Advanced ConfigurationDomain PurchasingCopy pagePurchase and connect domains for your Replit published apps directly within the platform to make your apps accessible with custom URLs.Copy page

Turn your apps into live, professional websites with custom domain names.

Domain Purchasing lets you search, buy, and connect domains for your Replit published apps—all from within the platform. Go from published app to professional web presence in minutes.

That means you can buy a site, like my-app.com, and have it automatically point to your app.

Domain Purchasing is available as an early beta feature. We’re eager to hear
your feedback on how we can improve the experience!

## ​Features

Domain Purchasing streamlines the process of giving your apps professional web addresses. Instead of juggling multiple services, you can complete your entire web presence setup within Replit.

Key capabilities include:

- Domain search and availability: Check domain availability across popular extensions like .com, .ai, and more
- One-click purchasing: Buy domains directly through Replit using your account’s default payment method
- Automatic configuration: Your domain instantly points to your Replit app without manual DNS setup
- WHOIS privacy protection: Your personal information stays private in public domain records—included by default with every domain purchase
- Custom DNS records: Add custom A, TXT, and MX records to configure email providers and other services
- Instant publishing: Your app becomes accessible at your custom domain immediately after purchase
- Automatic renewals: Domains renew automatically so your apps stay published without interruption

## ​Usage

### ​Purchasing domains

1. Publish your app and navigate to the  Publishing tab
1. Select the Domains tab
1. Choose Buy a domain to start the search process
1. Enter your desired domain name in the search bar
1. Review available options across different extensions
1. Select your preferred domain and complete the purchase

When you purchase a domain, it automatically configures to point to your Replit app. Your app becomes accessible at the custom domain instantly, with no additional setup required.

You will be billed for the domain purchase through your Replit account, deducted from your account balance then applied to your usage.

### ​Managing purchased domains

Your domains integrate seamlessly with your published apps:

- Automatic renewals: Domains renew automatically to keep your apps published
- Integrated billing: Domain costs appear on your Replit billing alongside other services
- Transfer support: Move domains between Replit accounts or to external registrars when needed

### ​Custom DNS records

For domains purchased through Replit, you can add custom DNS records to configure additional services like email providers. The following DNS record types are supported:

- A records: Point your domain or subdomain to a specific IP address
- TXT records: Add text-based verification records for services like email authentication (SPF, DKIM, DMARC)
- MX records: MX (Mail Exchange) records tell email servers where to deliver email for your domain. Setting up MX records allows you to use your custom domain for email addresses like hello@yourdomain.com.

To manage DNS records for your purchased domain:

1. Navigate to the Domains tab in your Publishing
1. Find the domain you want to configure
1. Select the Edit  icon
1. Choose Add DNS Record
1. Enter the record type, name, value, and TTL as required by your service provider

This short video walks through finding the management page for your domain DNS records:

DNS changes can take up to 48 hours to propagate globally. Your app will
continue to work normally during this propagation period.

### ​Supported deployment types

Domain Purchasing works with these Deployment types:

- Autoscale Deployments
- Reserved VM Deployments
- Static Deployments

Currently, you can purchase domains for your personal account published apps. Domain purchasing for Replit Teams is coming soon.

## ​FAQ

How much does it cost?Domain purchasing includes two costs:
Registration fee: The initial cost for one year of domain ownership (two years for .ai domains)
Renewal price: Automatically charged after the initial registration period
Replit doesn’t charge additional fees for domain purchases. Domain registration fees are non-refundable.

How do I renew my domain?Replit automatically renews your domain to keep your app accessible. If you
prefer not to renew, contact Replit Support during the beta period.

What if I want to leave Replit?You can transfer your domain to another registrar by contacting Replit
Support. ICANN rules require a 60-day waiting period after purchase before
domains can be transferred to external registrars.

Can I transfer domains between Replit accounts?Yes, contact Replit Support to transfer domains between Replit accounts. This
process doesn’t require the 60-day waiting period.

Can I buy domains for my organization?Domain Purchasing for Replit Teams and Enterprise plans is coming after the
initial beta period.

Can I add custom DNS records to my domain?Yes! You can add custom DNS records to domains purchased through Replit. Currently supported record types include:
A records: Point your domain or subdomain to specific IP addresses
TXT records: Add text-based verification records for email authentication and other services
MX records: Configure mail servers to handle email for your domain
Navigate to the Domains tab in your Publishing to configure these records. For detailed instructions on setting up MX records for email, see the Custom DNS records section above.

What domain extensions are supported?We support all common top-level domains (TLDs). We cannot support TLDs with
special geographic or other restrictions.

What is WHOIS privacy protection?When you register a domain, your contact information (name, address, phone number, and email) is normally published in a public database called WHOIS that anyone can search. WHOIS privacy protection replaces your personal details with generic information from the registrar, keeping your information private while still meeting legal requirements.All domains purchased through Replit include WHOIS privacy protection by default at no extra cost. This means your personal information stays hidden from spammers, marketers, and anyone else who might search for domain owner details.

What if I already have a domain?To connect an existing domain to your Replit app, see our Custom Domains documentation.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/cloud-services/deployments/custom-domains)

[Deployment MonitoringThe Deployments tool provides real-time insights for your published Replit Apps.Next](https://docs.replit.com/cloud-services/deployments/monitoring-a-deployment)
