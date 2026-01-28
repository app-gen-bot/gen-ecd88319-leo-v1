# Google Authentication in Python and Flask

**Source:** https://docs.replit.com/additional-resources/google-auth-in-flask  
**Section:** additional-resources  
**Scraped:** 2025-09-08 20:12:16

---

Google Authentication in Python and FlaskCopy pageLearn how to implement Google OAuth authentication in a Flask app on Replit, including user login and Google Sheets API integration.Copy page

Allowing your users to log in to your website using their Google account has these benefits:

1. You don’t have to implement your own authentication scheme.
1. You can get users’ name and contact information easily.
1. You can use the same credentials to access users’ Google resources like Sheets and Drive.

This guide that will walk you through how to do that with Python and Flask on Replit.

First, we’ll walk through how to setup basic OAuth authentication, then cover how to use the resulting credentials to access users’ Google resources.

## ​Introduction to OAuth

Google authentication is based on the OAuth standard. The way OAuth works is as follows:

1. Somewhere on your website, you direct a user to a login page.
1. When they go to the login page, you don’t implement the login form on your website, but instead redirect to Google’s login service to login the user.
1. When Google’s login service successfully logs in the user, it redirects back to your website at a predefined URL of your choosing, say https://YOUR_DOMAIN/oauth2callback, while sending some information pertinent to the user and the login session.
1. You use the user’s login information to further obtain an access token, which is like a pass you can use to access the user’s resources, like their profile information, their spreadsheets, documents and more.

## ​OAuth: Show me the code

If you are like me, the first thing you want is working code. The code below is what you need. However, you’ll need to set up some things in your Google Cloud Console in order to get everything working. That will be covered in the next section. Create a new Replit App using the Flask template and put the following in main.py. The comments in the code explains what the individual parts do:

Copy

Ask AI

```
from flask import Flask, redirect, session, url_for, request
import google_auth_oauthlib.flow
import json
import os
import requests

app = Flask('app')
# `FLASK_SECRET_KEY` is used by sessions. You should create a random string
# and store it as secret.
app.secret_key = os.environ.get('FLASK_SECRET_KEY') or os.urandom(24)

# `GOOGLE_APIS_OAUTH_SECRET` contains the contents of a JSON file to be downloaded
# from the Google Cloud Credentials panel. See next section.
oauth_config = json.loads(os.environ['GOOGLE_OAUTH_SECRETS'])

# This sets up a configuration for the OAuth flow
oauth_flow = google_auth_oauthlib.flow.Flow.from_client_config(
    oauth_config,
    # scopes define what APIs you want to access on behave of the user once authenticated
    scopes=[
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
    ]
)

# This is entrypoint of the login page. It will redirect to the Google login service located at the
# `authorization_url`. The `redirect_uri` is actually the URI which the Google login service will use to
# redirect back to this app.
@app.route('/signin')
def signin():
    # We rewrite the URL from http to https because inside the Replit App http is used,
    # but externally it's accessed via https, and the redirect_uri has to match that
    oauth_flow.redirect_uri = url_for('oauth2callback', _external=True).replace('http://', 'https://')
    authorization_url, state = oauth_flow.authorization_url()
    session['state'] = state
    return redirect(authorization_url)

# This is the endpoint that Google login service redirects back to. It must be added to the "Authorized redirect URIs"
# in the API credentials panel within Google Cloud. It will call a Google endpoint to request
# an access token and store it in the user session. After this, the access token can be used to access
# APIs on behalf of the user.
@app.route('/oauth2callback')
def oauth2callback():
    if not session['state'] == request.args['state']:
        return 'Invalid state parameter', 400
    oauth_flow.fetch_token(authorization_response=request.url.replace('http:', 'https:'))
    session['access_token'] = oauth_flow.credentials.token
    return redirect("/")

# This is the home page of the app. It directs the user to log in if they are not already.
# It shows the user info's information if they already are.
@app.route('/')
def welcome():
    if "access_token" in session:
        user_info = get_user_info(session["access_token"])
        if user_info:
            return f"""
                Hello {user_info["given_name"]}!<br>
                Your email address is {user_info["email"]}<br>
                <a href="/logout">Log out</a>
            """
    return """
        <h1>Hello!</h1>
        <a href="/signin">Sign In via Google</a><br>
    """

# Call the userinfo API to get the user's information with a valid access token.
# This is the first example of using the access token to access an API on the user's behalf.
def get_user_info(access_token):
    response = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={
       "Authorization": f"Bearer {access_token}"
   })
    if response.status_code == 200:
        user_info = response.json()
        return user_info
    else:
        print(f"Failed to fetch user info: {response.status_code} {response.text}")
        return None

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


```

## ​Set up your OAuth App / Client

To get the above code working, you’ll need to do these things in Google Cloud.

1. Create a Google Cloud project (if you don’t already have one).
1. Configure the OAuth consent screen.
1. Create an OAuth client ID for your app.

### ​Create a Google Cloud project

If you already have a Google Cloud project you want to use for this exercise, you can skip this step.

1. Go to the Google Cloud Console
1. Click on the project selector dropbox next to the Google Cloud logo:

1. Select an existing project or Click “New Project” and create an new project.

1. If creating a new project, enter a project name, and click “Create”.

If you see your new project show up in a popup, click “Select project” to make that the active project.

### ​Configure the OAuth consent screen

Now that you have a project, you can configure the OAuth consent screen for it:

1. Go to the OAuth Consent Screen

1. Make sure the project in the project drop down is the one you want.
1. Select “External” to allow any user to log in to your app with a Google account. “Internal” will allow only people from your organization.
1. Click “Create”.
1. Enter an app name and the email of the person supporting this app (you?)

1. Enter an email address under “Developer contact information”.

1. Click “Save and continue”.
1. In the Scopes screen, you can add the APIs you want your app to have access to. You already have access to the APIs for getting basic user information.

For now, leave this as is and click “Save and continue”.
9. In Test Users, you need to add the email of the users you want to be able to test the app during its testing phase.

Click “Add users”
10. Add one or more email Google email addresses, and click “Add”.

Then click “Save and continue”.
11. Review the summary screen. You can always go back and edit any of the steps.

### ​Create an OAuth client ID for your app

This is the last part. To get OAuth working, you need to create an OAuth client ID for the app.

1. Go to Credentials.

1. Click “Create credentials”

select “OAuth client ID”.
3.  Select “Web application” for Application type. Enter a name for this client ID.

1. Now, go to your Flask Replit App. Open the shell, and enter: echo https://$REPLIT_DEV_DOMAIN/oauth2callback. The result will look something like: https://81309e9b-c4df-48e0-a2c2-0a8d3c0e3162-00-35ppsa0tcuv6v.infra-staging.replit.dev/oauth2callback. Copy this text and enter it as one of the “Authorized redirect URIs” in the bottom of the form

Later when you publish your app, you’ll want to come back here to add another entry https://YOUR_APP_DOMAIN/oauth2callback

1. Click “Create”
1. Click “Download JSON”:

1. Go to your Replit App again, open the Secrets pane. Create a secret named GOOGLE_OAUTH_SECRETS, and paste of the contents of the downloaded file
as the secret value.

Phew! That was tedious. Congratulations if you made it through! Now you can run the Flask app and log in using a test user Google account. To make your app available to any Google user, you’ll need to go back to the consent page and click “Publish App”. A verification process may be required if your app requires additional Google APIs like Sheets and Drive.

Next, we’ll cover how to integrate with a Google API like Sheets. Follow along if you want to go further.

## ​Google Sheets API Setup

In order to add a Google API integration like Google Sheets, first you need to enable the API for the app. You can browser the available APIs. As an example, we’ll use Google Sheets.

1. Go to the Google Sheets API listing page.
1. Click “Enable”.

Done! That’s all the Google Cloud setup you had to do for this part.

## ​Google Sheets Integration: Show me the code

First, in the oauth flow section of the original code, we leave everything the same, except add "https://www.googleapis.com/auth/spreadsheets.readonly" to the list of scopes:

Copy

Ask AI

```
# This sets up a configuration for the OAuth flow
oauth_flow = google_auth_oauthlib.flow.Flow.from_client_config(
    oauth_config,
    # scopes define what APIs you want to access on behave of the user once authenticated
    scopes=[
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/spreadsheets.readonly"
    ]
)

```

Now, the way you access a Google API with the googleapiclient.discovery library is to first create a Credentials object using the access token, and then use the build function to create a callable API object. For the sheets API it looks like:

Copy

Ask AI

```
credentials = google.oauth2.credentials.Credentials(token=session['access_token'])
service = build("sheets", "v4", credentials=credentials)
sheets_api = service.spreadsheets()

```

As to how to actually use the Sheets API, I’ve created a couple of helper functions:

Copy

Ask AI

```
# fetch all sheets within a Google spreadsheet
def get_sheets(sheets_api, spreadsheet_id) -> list[str]:
    result = sheets_api.get(spreadsheetId=spreadsheet_id).execute()
    return [sheet["properties"]["title"] for sheet in result["sheets"]]

# fetch the data for a given sheet within a Google spreadsheet
def get_sheet_data(sheets_api, spreadsheet_id, sheet_title) -> list[list[str]]:
    result = (
        sheets_api.values()
        .get(spreadsheetId=spreadsheet_id, range=sheet_title)
        .execute()
    )
    return result["values"]

```

With the above help, we can create a POST handler endpoint that imports a Google spreadsheet like so:

Copy

Ask AI

```
@app.route("/import_spreadsheet", methods = ['POST'])
def import_spreadsheet():
    if 'access_token' not in session:
        return redirect('/signin')
    spreadsheet_id = request.form["spreadsheet_id"]
    credentials = google.oauth2.credentials.Credentials(token=session['access_token'])
    service = build("sheets", "v4", credentials=credentials)
    sheets_api = service.spreadsheets()
    try:
        sheets = get_sheets(sheets_api, spreadsheet_id)
        data_by_sheets = {}
        for sheet in sheets:
            data = get_sheet_data(sheets_api, spreadsheet_id, sheet)
            data_by_sheets[sheet] = data
    except googleapiclient.errors.HttpError as e:
        return f"upload failure"
    dirpath = os.path.join("static", "uploads", spreadsheet_id)
    filepath = os.path.join(dirpath, "data.json")
    os.makedirs(dirpath, exist_ok=True)
    with open(filepath, "w") as file:
        json.dump(data_by_sheets, file)
    return "upload success!"

```

Here is the full working code:

Copy

Ask AI

```
from flask import Flask, redirect, session, url_for, request
import google_auth_oauthlib.flow
import json
import os
import requests
from googleapiclient.discovery import build
import googleapiclient.errors
import google.oauth2.credentials

app = Flask('app')
# `FLASK_SECRET_KEY` is used by sessions. You should create a random string
# and store it as secret.
app.secret_key = os.environ.get('FLASK_SECRET_KEY') or os.urandom(24)

# `GOOGLE_APIS_OAUTH_SECRET` contains the contents of a JSON file to be downloaded
# from the Google Cloud Credentials panel. See next section.
oauth_config = json.loads(os.environ['GOOGLE_OAUTH_SECRETS'])

# This sets up a configuration for the OAuth flow
oauth_flow = google_auth_oauthlib.flow.Flow.from_client_config(
    oauth_config,
    # scopes define what APIs you want to access on behave of the user once authenticated
    scopes=[
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/spreadsheets.readonly"
    ]
)

# This is entrypoint of the login page. It will redirect to the Google login service located at the
# `authorization_url`. The `redirect_uri` is actually the URI which the Google login service will use to
# redirect back to this app.
@app.route('/signin')
def signin():
    # We rewrite the URL from http to https because inside the Replit App http is used,
    # but externally it's accessed via https, and the redirect_uri has to match that
    oauth_flow.redirect_uri = url_for('oauth2callback', _external=True).replace('http://', 'https://')
    authorization_url, state = oauth_flow.authorization_url()
    session['state'] = state
    return redirect(authorization_url)

# This is the endpoint that Google login service redirects back to. It must be added to the "Authorized redirect URIs"
# in the API credentials panel within Google Cloud. It will call a Google endpoint to request
# an access token and store it in the user session. After this, the access token can be used to access
# APIs on behalf of the user.
@app.route('/oauth2callback')
def oauth2callback():
    if not session['state'] == request.args['state']:
        return 'Invalid state parameter', 400
    oauth_flow.fetch_token(authorization_response=request.url.replace('http:', 'https:'))
    session['access_token'] = oauth_flow.credentials.token
    return redirect("/")

# Call the userinfo API to get the user's information with a valid access token.
# This is the first example of using the access token to access an API on the user's behalf.
def get_user_info(access_token):
    response = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={
       "Authorization": f"Bearer {access_token}"
   })
    if response.status_code == 200:
        user_info = response.json()
        return user_info
    else:
        print(f"Failed to fetch user info: {response.status_code} {response.text}")
        return None

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

# fetch all sheets within a Google spreadsheet
def get_sheets(sheets_api, spreadsheet_id) -> list[str]:
    result = sheets_api.get(spreadsheetId=spreadsheet_id).execute()
    return [sheet["properties"]["title"] for sheet in result["sheets"]]

# fetch the data for a given sheet within a Google spreadsheet
def get_sheet_data(sheets_api, spreadsheet_id, sheet_title) -> list[list[str]]:
    result = (
        sheets_api.values()
        .get(spreadsheetId=spreadsheet_id, range=sheet_title)
        .execute()
    )
    return result["values"]

# Render a form to allow importing a spreadsheet
@app.route("/import_spreadsheet_form")
def import_spreadsheet_form():
    return """
    <h3>Import Spreadsheet</h3>
    <form action="/import_spreadsheet" method="POST">
        <label>Spreadsheet ID</label>
        <input type="text" name="spreadsheet_id">

        <button type="submit">Import</button>
    </form>
    """

@app.route("/import_spreadsheet", methods = ['POST'])
def import_spreadsheet():
    if 'access_token' not in session:
        return redirect('/signin')
    spreadsheet_id = request.form["spreadsheet_id"]
    credentials = google.oauth2.credentials.Credentials(token=session['access_token'])
    service = build("sheets", "v4", credentials=credentials)
    sheets_api = service.spreadsheets()
    try:
        sheets = get_sheets(sheets_api, spreadsheet_id)
        data_by_sheets = {}
        for sheet in sheets:
            data = get_sheet_data(sheets_api, spreadsheet_id, sheet)
            data_by_sheets[sheet] = data
    except googleapiclient.errors.HttpError as e:
        return f"upload failure"
    dirpath = os.path.join("static", "uploads", spreadsheet_id)
    filepath = os.path.join(dirpath, "data.json")
    os.makedirs(dirpath, exist_ok=True)
    with open(filepath, "w") as file:
        json.dump(data_by_sheets, file)
    return "upload success! Really!"

@app.route('/')
def welcome():
    if "access_token" in session:
        user_info = get_user_info(session["access_token"])
        if user_info:
            return f"""
            Hello {user_info["given_name"]}!<br>
            Your email address is {user_info["email"]}<br>
            <a href="/signin">Sign In to Google</a><br>
            <a href="/import_spreadsheet_form">Import a Sheet</a>
            """
    return """
    <h1>Welcome to Google Sheet Importer</h1>
    <a href="/signin">Sign In to Google</a><br>
    <a href="/import_spreadsheet_form">Import a Sheet</a>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

```

Remember, if you publish the app. Make sure to:

1. Added the production /oauth2callback URI for to the “Authorized redirect URIs”.
1. Go to the consent page and “Publish App”.

Hope you had a good experience, and hope you Enjoy your further advantures.

Was this page helpful?

Yes

No
