# data API

**Source:** https://docs.replit.com/extensions/api/data  
**Section:** extensions  
**Scraped:** 2025-09-08 20:27:41

---

API Referencedata APICopy pageAccess Replit’s GraphQL API to retrieve user information, Replit App metadata, and other platform data through the Extensions API.Copy page

The data API allows you to get information and metadata exposed from Replit’s GraphQL API.

## ​Usage

Copy

Ask AI

```
import { data } from '@replit/extensions';

```

## ​Methods

### ​data.currentUser

Fetches the current user via graphql

Copy

Ask AI

```
currentUser(args: CurrentUserDataInclusion): Promise<{ user: CurrentUser }>

```

### ​data.userById

Fetches a user by their id via graphql

Copy

Ask AI

```
userById(args: { id: number } & UserDataInclusion): Promise<{ user: User }>

```

### ​data.userByUsername

Fetches a user by their username via graphql

Copy

Ask AI

```
userByUsername(args: { username: string } & UserDataInclusion): Promise<{ userByUsername: User }>

```

### ​data.currentRepl

Fetches the current Replit App via graphql

Copy

Ask AI

```
currentRepl(args: ReplDataInclusion): Promise<{ repl: Repl }>

```

### ​data.replById

Fetches a Replit App by its ID via graphql

Copy

Ask AI

```
replById(args: { id: string } & ReplDataInclusion): Promise<{ repl: Repl }>

```

### ​data.replByUrl

Fetches a Replit App by its URL using GraphQL

Copy

Ask AI

```
replByUrl(args: { url: string } & ReplDataInclusion): Promise<{ repl: Repl }>

```

## ​Types

### ​CurrentUser

Extended values for the current user

PropertyTypebio?stringdisplayName?stringfirstName?stringfollowCount?numberfollowerCount?numberfullName?stringidnumberimagestringisUserHacker?booleanisUserPro?booleanlastName?stringroles?UserRole[]socials?UserSocial[]url?stringusernamestring

### ​CurrentUserDataInclusion

Options for the currentUser query

PropertyTypeincludePlan?booleanincludeRoles?booleanincludeSocialData?boolean

### ​EditorPreferences

Editor Preferences

PropertyType__typenamestringcodeIntelligencebooleancodeSuggestionbooleanfontSizenumberindentIsSpacesbooleanindentSizenumberkeyboardHandlerstringminimapDisplaystringmultiselectModifierKeystringwrappingboolean

### ​Replit App

A Replit App

PropertyTypecommentCount?numbercomments?ReplCommentConnectiondescriptionstringiconUrl?stringidstringimageUrl?stringisPrivatebooleanlikeCount?numbermultiplayers?User[]owner?ReplOwnerpublicForkCount?numberrunCount?numberslugstringtags?Tag[]timeCreatedstringtitlestringurlstring

### ​ReplComment

A Replit App Comment

PropertyTypebodystringidnumberuserUser

### ​ReplCommentConnection

An array of ReplComments as items

PropertyTypeitemsReplComment[]

### ​ReplDataInclusion

Options for replit app queries

PropertyTypeincludeComments?booleanincludeMultiplayers?booleanincludeOwner?booleanincludeSocialData?boolean

### ​ReplOwner

A Replit App Owner, can be either a User or a Team

PropertyType__typenamestringdescription?stringidnumberimagestringusernamestring

### ​Tag

A Replit App tag

PropertyTypeidstringisOfficialboolean

### ​User

A Replit user

PropertyTypebio?stringdisplayName?stringfirstName?stringfollowCount?numberfollowerCount?numberfullName?stringidnumberimagestringisUserHacker?booleanisUserPro?booleanlastName?stringroles?UserRole[]socials?UserSocial[]url?stringusernamestring

### ​UserDataInclusion

Options for user queries

PropertyTypeincludePlan?booleanincludeRoles?booleanincludeSocialData?boolean

### ​UserRole

A user role

PropertyTypeidnumberkeystringnamestringtaglinestring

### ​UserSocial

A user social media link

PropertyTypeidnumbertypeUserSocialTypeurlstring

### ​UserSocialType

An enumerated type of social media links

PropertyType

### ​UserSocialType

An enumerated type of social media links

Copy

Ask AI

```
discord = 'discord'
facebook = 'facebook'
github = 'github'
linkedin = 'linkedin'
twitch = 'twitch'
twitter = 'twitter'
website = 'website'
youtube = 'youtube'

```

### ​CurrentUserQueryOutput

A graphql response for the currentUser query

Copy

Ask AI

```
GraphResponse<{
  user: CurrentUser;
}>

```

### ​GraphResponse<T>

A graphql response

Copy

Ask AI

```
Promise<T | never>

```

### ​ReplQueryOutput

A graphql response for the repl query

Copy

Ask AI

```
GraphResponse<{
  repl: Repl;
}>

```

### ​UserByUsernameQueryOutput

A graphql response for the userByUsername query

Copy

Ask AI

```
GraphResponse<{
  userByUsername: User;
}>

```

### ​UserQueryOutput

A graphql response for the user query

Copy

Ask AI

```
GraphResponse<{
  user: User;
}>

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/commands)

[Debug APILearn how to use the debug API module to log data, warnings, and errors to the Extension Devtools in Replit extensions.Next](https://docs.replit.com/extensions/api/debug)
