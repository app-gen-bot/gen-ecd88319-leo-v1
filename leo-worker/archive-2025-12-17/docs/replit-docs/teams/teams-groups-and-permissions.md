# Groups and Permissions

**Source:** https://docs.replit.com/teams/identity-and-access-management/groups-and-permissions  
**Section:** teams  
**Scraped:** 2025-09-08 20:04:40

---

Identity and Access ManagementGroups and PermissionsCopy pageGroups are a way to organize team members and control what permissions they have inside of the organization. There are two types of groups available in Replit Teams: default groups and custom groups.Copy page

## ​Group types

The default groups are Admins, Members, and Guests. Every member of the organization belongs to one (and only one) of these three groups. The permissions available to these groups can be configured, but they are generally laid out where:

- Admins are the most privileged users and have access to every action available inside of Replit Teams.
- Members are able to edit Replit Apps and interact with other resources, but do not have access to sensitive actions like deleting the organization or editing billing information.
- Guests have the lowest level of access and cannot see much information about other members of the organization. This group is useful for managing external contractors or using Replit Teams for interviewing.

If finer-grained access control is required, custom groups can be created to grant additional privileges to specific sets of users.

The list of groups is available under the “Groups” option in the sidebar. Users will only see groups to which they have at least viewer access. Default groups are displayed at the top, and custom groups (if any) underneath. Each group card shows the name of the group, an icon with its color, and the number of group members.

## ​Creating a custom group

Users with at least manager access to the organization can create new custom groups. From the groups page, click the Add button in the top right corner. This will open a modal with the information needed to create the group. The group name is the only required field for Admins. Non-admins will need to select another group to which they have access that will act as an owner on their behalf.

After creating the group, the group details view will load. From here, members may be added to the group and the group permissions updated.

## ​Managing a group

The details of a group are accessed by clicking on the group card. There are three sections under the group details: members, permissions, and settings.

### ​Members

The members screen shows a list of the group members, and has functionality for adding or removing members, if the current user is permitted to do so. It is also possible to remove members from the organization.

#### ​Adding a group member

To add a member to the group, click the “Add” button in the top right corner. This action may be disabled if person being added is not part of the organization and there are not enough seats available.

New members can be searched for by username, or by email. If the new member is not part of the organization, a warning appears.

After adding the new member, they will appear in the list of group members and are immediately granted access to Replit Apps and other resources available to the group.

#### ​Removing a group member

To remove a group member, click the trash can on the right side of the member row, or open the actions menu using the triple dot button and select “Remove from group”. This will open a modal requesting confirmation of the action. Group removal behaves a little differently between default and custom groups.

For default groups, since organization members must belong to one default group, the options are to move the member to another default group, or remove them from the organization. Removing members from the organization is immediate. They will lose access to any Replit Apps that they created or had access to as part of the organization.

For custom groups, the member does not need to be transferred to another group and may simply be removed.

### ​Permissions

The group permissions section supports viewing and managing the actions that group members may take on specific resources. There are three sections: the organization, groups, and Replit Apps. The permissions available to default groups are specific to that group type, while custom groups have more flexibility over the permissions granted.

#### ​Organization permissions

Permissions at the organization level allow members to perform general actions that aren’t tied to a specific resource like a Replit App.

The roles are progressive, e.g. editors can do everything that viewers can do. There are five organization roles:

- Viewers can see basic information about the existence of the organization, including its name. Users with this level of access cannot create new Replit Apps.
- Editors can create new Replit Apps and Object Storage buckets, and see information about usage. They can also use advanced AI features and SSH.
- Managers are able to create and manage groups, add members to the organization when seats are available, remove members from the organization, and view information related to billing.
- Billing managers are able to update the organization’s billing information, including adding seats to or removing seats from the plan, and editing the payment method or billing email.
- Owners are members of the Admins group. They are able to perform all actions on the organization, including deletion of the organization itself.

The organization role available to a user depends on the group type to which the user belongs. Custom group permissions are additive. For example, a Guest who is a member of a custom group with “Manager” access will grant them those permissions. Granting a custom group “Viewer” access where one member is an Admin will have no impact for that user.

RoleAdminsMembersGuestsCustomViewerAvailableDefaultDefaultEditorDefaultAvailableAvailableManagerAvailableAvailableBilling managerAvailableAvailableOwnerDefault

#### ​Group permissions

Permissions for groups define the abilities of a group (e.g. Group A) toward another group (e.g. Group B).

These roles are progressive (e.g. managers can do everything that viewers can do). There are five roles that can be applied to these relationships:

- No access means that members of the group cannot see anything about the other group (e.g. its name or members).
- Restricted is a special level of access for Guests. It allows these users to see the group name, but not the other members, and can be useful for organizations with many external contractors, or for organizations using Replit Teams to conduct interviews.
- Viewers can see the group name and the list of group members.
- Managers can add and remove members from the group, control the group permissions, and change the group color.
- Owners can edit the group name or delete the group.

The potential roles for a group relationship are dependent on both the source and target group types. The matrix of available roles is defined below, where the rows represent the source group type and the columns the target type. The default roles are in bold.

Target →AdminsMembersGuestsCustomAdminsManagerManagerManagerOwnerMembersViewerViewer, ManagerViewer, ManagerNone, Viewer, Manager, OwnerGuestsNone, ViewerNone, ViewerRestricted, ViewerNone, Viewer, ManagerCustomNone, ViewerNone, Viewer, ManagerNone, Viewer, ManagerNone, Viewer, Manager, Owner

#### ​Replit App permissions

Permissions between groups and Replit Apps can be managed either from the group permissions interface, or from the Replit App workspace.

These roles are progressive, e.g. editors can do everything that viewers can do. There are five roles that control Replit App access:

- No access means that group members cannot see that the Replit App exists, unless they have higher permission through another group, or if the Replit App is public.
- Viewers can see the Replit App cover page, even if the Replit App is not publicly available.
- Editors have access to open the Replit App in the workspace and make changes to the code. They may also view existing deployments, interact with Object Storage, and use advanced AI features.
- Publishers can republish existing published apps. They cannot incur more cost from a published app, e.g. upgrading it to a larger machine, but they can pause / resume the published app.
- Owners can create new deployments or Neon databases. They can also edit the Replit App permissions, switch the visibility between public and private, and view and edit Replit App secrets. Owners are able to delete resources attached to the Replit App (e.g. deployments, databases, and Object Storage resources) and the Replit App itself.

While only Owners can view and update secrets in the workspace through our panes system, anyone with Editors access can execute code that will output secret values. For more information on secret visibility, see Handling Secrets in a collaborative environment.

The Replit App roles available to a group are dependent on the group type, and are defined in the matrix below:

RoleAdminsMembersGuestsCustomNoneDefaultDefaultDefaultViewerAvailableAvailableAvailableEditorAvailableAvailableAvailableDeployerAvailableAvailableAvailableOwnerDefaultAvailableAvailableAvailable

Effective June 9, 2025: By default, new apps will be private to the
creator. They can be shared with the Members group on a per-app basis.

### ​Settings

The group settings section allows eligible users to edit the group’s name and color, or delete the group. The permissions available on default groups are more limited: their names cannot be changed and they may not be deleted.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/teams/identity-and-access-management/managing-members)

[Access ManagementLearn how to control access and visibility settings for Replit Apps through the workspace interface, including group permissions and user roles.Next](https://docs.replit.com/teams/identity-and-access-management/repl-access-management)
