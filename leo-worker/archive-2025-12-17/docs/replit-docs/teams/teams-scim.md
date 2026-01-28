# SCIM

**Source:** https://docs.replit.com/teams/identity-and-access-management/scim  
**Section:** teams  
**Scraped:** 2025-09-08 20:04:51

---

Identity and Access ManagementSCIMCopy pageLearn how to set up and manage SCIM to simplify provisioning and managing user roles within your Replit Enterprise Team.Copy page

## ​Introduction

SCIM is available exclusively for Enterprise customers. Contact our sales team at sales@replit.com to enable this feature for your organization.

System for Cross-domain Identity Management (SCIM) is a standardized protocol that automates user provisioning and deprovisioning between your enterprise identity provider (IdP) and Replit.

The SCIM integration is built on the WorkOS platform, ensuring enterprise-grade reliability and security.

## ​Key Features

## Automated User Management

Automatically provision and deprovision users based on your IdP’s directory

## Role Synchronization

Keep user roles and permissions in sync with your organizational structure

## Bulk Operations

Efficiently manage large teams with bulk user operations

## Major IdP Support

Direct integration with Azure AD, Okta, and other leading identity providers

## ​Benefits

SCIM integration provides several advantages for Enterprise teams:

- Enhanced Security: Leverage your existing identity management systems for robust access control
- Simplified Administration: Automatically manage team members through your identity provider
- Efficient Onboarding: Seamlessly provision large teams without manual intervention
- Consistent Access Control: Maintain uniform access policies across your organization

## ​Getting Started

1

Contact Sales

Reach out to our sales team at sales@replit.com to enable SCIM for your Enterprise organization

2

Configure Your IdP

Your IT admin will receive a link to the SCIM onboarding portal, which provides step-by-step instructions specific to your identity provider for synchronizing your user directory

3

Test Integration

Verify the connection by provisioning a test user

4

Go Live

Begin using SCIM for automated user management

## ​Best Practices

- Document role allocations for existing Replit users before enabling SCIM
- Configure groups for each Replit role, keeping in mind that users without a group will default to the Viewer role
- Test your configuration by provisioning a small group of users before enabling bulk provisioning
- Document your SCIM configuration for future reference

## ​FAQs

### ​What happens to users who already have accounts on replit.com before SCIM was setup?

When SCIM is enabled, existing users are handled in two ways:

1. Users provisioned through SCIM:

Their roles will be updated to match those provided by your IdP
These users can only be added, removed, or have their roles changed through your IdP
To ensure permissions remain synchronized, admins will no longer be able to edit roles or invite new users within Replit
1. Users not provisioned through SCIM:

These users remain unchanged and are considered “legacy” users
We do not automatically revoke access, to prevent accidental deprovisioning
Legacy users can be removed through the Replit interface by organization admins if needed

After implementing SCIM, all users provisioned through your IdP must be managed through your identity provider to maintain synchronization. Only legacy users (those not provisioned through SCIM) can be deprovisioned directly in Replit.

### ​What roles can be provisioned with SCIM?

SCIM users can be assigned to three roles:

- Admin: Full access to organization settings and resources
- Member: Standard access to create and edit Replit Apps
- Viewer: Read-only access to published applications

We recommend using dedicated groups for each role. During the SCIM onboarding process, you can configure the mapping between your IdP groups and Replit roles. For example, you might map your “Engineering” group to the Member role and your “Stakeholders” group to the Viewer role.

For detailed information about role permissions, see Groups & Permissions. To learn more about viewer access, see Viewer Seats.

### ​What if I need to edit the role mapping later?

Organization admins can edit SCIM configuration at any time by navigating to Organization Settings > Authentication > SCIM. Here you can access the SCIM portal to update group mappings and manage your integration settings.

## ​Related Resources

[SAML SSOLearn about SAML single sign-on integration](https://docs.replit.com/teams/identity-and-access-management/saml)

[Groups & PermissionsUnderstand how to manage user roles and access](https://docs.replit.com/teams/identity-and-access-management/groups-and-permissions)

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/teams/identity-and-access-management/saml)

[Viewer SeatsLearn how to set up and manage viewer seats for your Replit Team.Next](https://docs.replit.com/teams/identity-and-access-management/viewer-seats)
