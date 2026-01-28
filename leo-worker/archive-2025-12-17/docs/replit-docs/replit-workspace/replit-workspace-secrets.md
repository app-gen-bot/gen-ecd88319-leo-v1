# Secrets

**Source:** https://docs.replit.com/replit-workspace/workspace-features/secrets  
**Section:** replit-workspace  
**Scraped:** 2025-09-08 20:05:36

---

FeaturesSecretsCopy pageThe Secrets workspace tool lets you securely store sensitive information your app needs as encrypted environment variables.Copy page

The Secrets tool stores and encrypts secrets, your Replit App’s sensitive information, such as API keys, authentication tokens, and database connection strings.

When you add a secret, the tool automatically encrypts the data and makes it available to your Replit App as an environment variable.
This approach lets you eliminate hard-coding secrets in your code and reduce the risk of exposing them.

Hard-coding secrets in your codebase can lead to accidental exposure in the following scenarios:

- Sharing your code with others through a public Replit App or copy-paste
- Checking your code into version control in a public repository
- Live streaming or screen sharing your code

Use the Secrets tool to confidently share your code without worrying about exposing credentials.

Secrets workspace tool

## ​Features

Secrets include the following features:

- End-to-end encryption: Automatically protect your data using AES-256 encryption at rest and TLS encryption in transit
- App-level secrets: Store and manage secrets that are specific to a Replit App
- Account-level secrets: Store and manage secrets that you can make available across all your Replit Apps
- Environment variable access: Access your secrets from your code using environment variables
- Collaborative access: Share secrets with collaborators and team members

## ​Usage

Secrets are available for all deployment types except Static Deployments.

You can access Secrets in the Secrets workspace tool.

How to access SecretsFrom the left Tool dock:
Select  All tools to see a list of workspace tools.
Select  Secrets.
From the Search bar:
Select the  magnifying glass at the top to open the search tool
Type “Secrets” to locate the tool and select it from the results.

### ​Manage App Secrets

You can manage your app-level secrets in the App Secrets tab in the Secrets pane.
This tab displays a list of all secrets associated with your Replit App.

Add App SecretsTo add a secret:
Select New Secret.
Enter a Key, the name of the secret, and a Value, the secret itself.
Select Add Secret to save the entry.

Edit App SecretsTo edit a secret:
Select the  vertical dots menu next to the secret.
Select Edit from the contextual menu.
Update the text in the Key or Value field and select Update Secret to save changes or Cancel to discard changes.
You can also modify the entire list of App Secrets by selecting Edit as JSON or Edit as .env at the bottom of the tab.

View App SecretsTo view a secret, select the  eye icon next to the secret.To hide the secret, select the  eye with slash icon.

Delete App SecretsTo delete a secret, select the  vertical dots menu next to the secret and select Delete.

### ​Manage Account Secrets

You can manage your account-level secrets in the Account Secrets tab in the Secrets pane.
This tab displays a list of only secrets associated with your Replit account.

Add Account SecretsTo add an account-level secret:
Navigate to the Account Secrets tab.
Select  Manage Account.
Select New Secret to add a secret.
Enter a Key, the name of the secret, and a Value, the secret itself.
Select Save to save the entry.

Edit Account SecretsTo edit a secret:
Select the  pencil icon next to the secret.
Update the text in the Key or Value field and select Save to save changes or Cancel to discard changes.

View Account SecretsTo view a secret, select the  eye icon next to the secret.To hide the secret, select the  eye with slash icon.

Link Account SecretsTo use an account-level secret in a Replit App, you must link it to the app.
To link an account-level secret:
Navigate to the App Secrets tab.
Select the checkbox to the left of the secret.
Select Link to this App.
To unlink a secret:
Navigate to the App Secrets tab.
Select the  vertical dots menu next to the secret.
Select Unlink.

Delete Account Secrets
Select the  pencil icon next to the secret.
Select Delete.

### ​Access secrets in your code

Python

JavaScript

Java

C#

Go

Ruby

Copy

Ask AI

```
import os
print(os.getenv("MY_SECRET"))

```

### ​Managing secrets visibility

Secrets visibility depends on your access to a Replit App and whether you authored it.

You can use one of the options to share your Replit App:

- Multiplayer: Invite Replit users to collaborate in real-time
- Cover page: Show a preview of your Replit App with the option to remix it
- Remix: Make your individual or organization’s Replit App public so others can create their version

The following table shows secret name and value visibility in the different scenarios:

Access MethodWhoCan See NamesCan See ValuesMultiplayerMultiplayer collaborator✓✓MultiplayerOrganization member (Owner role)✓✓MultiplayerOrganization member (Non-owner)✓Cover PageAny visitorRemixOwner/collaborator remixing own Replit App✓✓RemixNon-owner/collaborator remixing Replit App✓RemixAnyone remixing from cover page✓Organization RemixOrganization member with Owner role✓✓Organization RemixOrganization member without Owner role✓

Organization members without the Owner role cannot view secret values in a Replit App, but can access their values by printing the environment variables.

## ​Database and storage related secrets

When you add Replit’s database or object storage, the workspace automatically creates the following secrets:

SecretDescriptionDATABASE_URLSQL database connection stringPGHOSTPostgreSQL hostnamePGUSERPostgreSQL usernamePGPASSWORDPostgreSQL passwordPGDATABASEPostgreSQL database namePGPORTPostgreSQL port

To view all environment variables in your Replit App, run printenv in the Shell workspace tool or print them from your code.

## ​Predefined environment variables

Replit automatically sets the following environment variables that you can access from your app:

Environment VariableDescriptionREPLIT_DOMAINSComma-separated list of all domains associated with your Replit AppREPLIT_USERUsername of the current editor, which may vary in Multiplayer sessionsREPLIT_DEPLOYMENTSet to 1 if the code is running in a published app, unset otherwiseREPLIT_DEV_DOMAINDevelopment URL on the replit.dev domain, which is different from the Deployment URL

These are not listed in the Secrets tool, but you can access them in your code using the os.environ object or running printenv in the Shell.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replit-workspace/replit-auth)

[Security ScannerSecurity Scanner helps you identify and fix potential security vulnerabilities in your application before publishing.Next](https://docs.replit.com/replit-workspace/workspace-features/security-scanner)
