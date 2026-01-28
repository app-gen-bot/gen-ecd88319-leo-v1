# auth API

**Source:** https://docs.replit.com/extensions/api/auth  
**Section:** extensions  
**Scraped:** 2025-09-08 20:28:00

---

API Referenceauth APICopy pageLearn how to authenticate users securely in your Replit extensions using the auth API module. Get and verify JWT tokens for user authentication.Copy page

# ​auth API experimental

The auth api module allows you to securely authenticate a Replit user if they use your extension.

## ​Usage

Copy

Ask AI

```
import { experimental } from '@replit/extensions';
const { auth } = experimental;

```

## ​Methods

### ​auth.getAuthToken

Returns a unique JWT token that can be used to verify that an extension has been loaded on Replit by a particular user

Copy

Ask AI

```
getAuthToken(): Promise<string>

```

### ​auth.verifyAuthToken

Verifies a provided JWT token and returns the decoded token.

Copy

Ask AI

```
verifyAuthToken(token: string): Promise<{ payload: any, protectedHeader: any }>

```

### ​auth.authenticate

Performs authentication and returns the user and installation information

Copy

Ask AI

```
authenticate(): Promise<AuthenticateResult>

```

## ​Types

### ​AuthenticatedUser

PropertyTypeidnumber

### ​AuthenticateResult

PropertyTypeinstallationAuthenticatedInstallationuserAuthenticatedUser

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/init)

[Background Script APILearn how to use background scripts to run persistent code in your Replit extension from startup until the workspace closes.Next](https://docs.replit.com/extensions/api/background)
