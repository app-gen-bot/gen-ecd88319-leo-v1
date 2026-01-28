# SAML

**Source:** https://docs.replit.com/teams/identity-and-access-management/saml  
**Section:** teams  
**Scraped:** 2025-09-08 20:24:10

---

Identity and Access ManagementSAMLCopy pageLearn how to set up and manage SAML single sign-on authentication for your Replit Enterprise Team, including domain configuration and Identity Provider setup.Copy page

## ​Introduction

Only organizations with an Enterprise plan are able to use SAML SSO. Contact us to get started with Enterprise.

SAML SSO allows you to use your Identity Provider to authenticate users logging into replit.com. Your Organization’s users will be directed to your Identity Provider to authenticate, and your Identity Provider will provide an response back to Replit verifying the user’s identity, which Replit uses to log the user into replit.com.

Setting up SAML requires communication with the Replit team. Once you’re familiar with what’s required below, contact us to get started.

## ​Set up SAML SSO

### ​Choose your email domains

You can claim multiple email domains and subdomains for your Organization. Any user that attempts to sign up with an email domain that matches your claimed domain will be required to use SAML SSO. Your claimed domains should match what your Identity Provider will report for your users. If you use email domain aliases, you should provide them to Replit as well to prevent your users from signing up without using SAML.

For example, if your company uses email domains matching acmeco.com, foo.acmeco.com, and acmebiz.com you should provide all of these to Replit.

Replit must be able to verify that your organization owns these domains. If you need to add additional domains in the future you can contact us at support@replit.com.

### ​Setup Replit in your Identity provider

Create a new application or service in your Identity Provider using the following

- Service Provider (SP) Entity ID: Your Replit representative will provide this.
- SSO URL: https://replit.com/__/auth/handler

### ​Replit enables your SAML SSO

Once you’ve setup Replit in your Identity Provider, please provide your Replit representative with the following:

- Identity Provider (IdP) entity ID: This identifies your IdP to Replit
- IdP SSO URL: This is the URL Replit will send users to when authenticating with your IdP
- Signature Certificate: An X509 certificate that Replit uses to verify authentication responses from your IdP.

Once we have confirmed setup completion, your Organization is ready to use SAML SSO.

## ​Using SAML SSO

Signing up in with SAML will not automatically invite users to your organization. For automated user management and bulk operations, see SCIM instead.

Once SAML SSO is configured, your users can log in to replit.com using the “Continue with SSO” button.

## ​FAQ

### ​What happens to users who already have accounts on replit.com before SAML SSO was setup?

SAML SSO is opt-in for existing users, meaning they can continue to use their existing authentication methods (email or social login). They will not be automatically added to your Organization.

### ​Are users automatically deprovisioned in Replit when my IdP removes access?

No, SAML SSO only handles authentication. For automated user provisioning and deprovisioning, you can use SCIM integration, which is available for Enterprise customers. SCIM allows you to sync your IdP’s directory to automatically manage user roles and provisioning.

### ​Are Organization seats automatically consumed when users are given access in our IdP?

No, seats are only consumed once a user accepts the invitation to your Organization.

## ​Related Resources

[SCIMLearn about automating user management with SCIM integration](https://docs.replit.com/teams/identity-and-access-management/scim)

[Groups & PermissionsUnderstand how to manage user roles and access](https://docs.replit.com/teams/identity-and-access-management/groups-and-permissions)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/teams/identity-and-access-management/repl-access-management)

[SCIMLearn how to set up and manage SCIM to simplify provisioning and managing user roles within your Replit Enterprise Team.Next](https://docs.replit.com/teams/identity-and-access-management/scim)
