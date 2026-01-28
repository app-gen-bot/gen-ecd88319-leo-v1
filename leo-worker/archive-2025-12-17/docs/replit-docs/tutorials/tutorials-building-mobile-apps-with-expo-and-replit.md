# Building Mobile Apps with Expo and Replit

**Source:** https://docs.replit.com/tutorials/expo-on-replit  
**Section:** tutorials  
**Scraped:** 2025-09-08 20:17:57

---

Agent & AssistantBuilding Mobile Apps with Expo and ReplitCopy pageReplit is the fastest way to create and publish cross-platform mobile apps using Expo, without any setup or configuration.Copy page

[Matt PalmerHead of Developer Relations](https://youtube.com/@mattpalmer)

Replit currently supports Expo development through the Expo Template and building with Assistant. Expo development is not supported with Agent at the moment.

Apps are the new websites, and everyone should be able to create them. By combining Replit’s browser-based development environment with Expo, mobile app creation is now as simple as building a website.

This tutorial will guide you through creating a mobile app using Replit and Expo, from setting up your environment to publishing your app to your device.

Watch Replit’s two-part video series to learn how to create and publish a mobile app using Replit and Expo.

## ​Part 1: Create a mobile app in five minutes

Learn how to create a native iPhone/Android app using Replit and Expo in just five minutes - perfect for beginners.

### ​Getting started with Replit and Expo

1

Prerequisites

Before getting started, you’ll need:

- A Replit account (free)
- Expo Go app installed on your mobile device
- An Expo EAS account (free)

For publishing to App Stores later, you’ll need:

- An Apple Developer account ($99/year) for iOS
- A Google Play Developer account ($25 one-time) for Android

2

Remix the Template

Start by visiting the Expo Template on Replit and selecting “Remix” to create your own copy. This creates a complete copy of the Template in your Replit account, including all the files, configurations, and dependencies.

3

Run the Template

Select the “Run” button in your Workspace. The Console will display a QR code that links the Expo Go app to your Replit project.

4

Preview on your device

Open the Expo Go app on your phone and scan the QR code displayed in your Workspace. This will load your app directly on your phone. It may take a minute or two for the project to compile.

Expo uses React Native to help you build apps for iOS, Android, and the web from a single codebase. This means you can build an app once and have it available on all platforms.

The democratization of mobile development through Replit and Expo makes app creation accessible to everyone, not just professional developers.

### ​Customizing your app with Assistant

1

Configure Assistant for Expo

To help Assistant understand your Expo project better, you can create a custom prompt:

1. Select the settings icon in the Assistant panel
1. Go to “Assistant prompt”
1. Create a prompt that specifies this is an Expo project for building React Native applications

2

Use natural language to build your app

With Assistant, you can describe what you want your app to do, and it will modify the code for you. For example, you might ask: “Create an app that shows me a random image of a cat every time I press a button.”

3

Iterate on mobile

One of the most powerful features is the ability to continue developing on your mobile device:

1. Open the Replit Mobile App
1. Find your project
1. Use Assistant to make changes and improvements
1. See updates appear in real-time

## ​Part 2: Publish your mobile app

Learn how to deploy your Replit Expo app to iOS in under 10 minutes - from development to installation on your iPhone.

### ​Publishing your app to your device

While this guide focuses on iOS deployment, the same Replit and Expo steps apply to Android development. For Android, follow the Expo Android deployment guide and Google Play Console process.

1

Prerequisites

Before publishing, you’ll need:

- Your Replit App from Part 1
- An Apple Developer account ($99/year) if publishing to iOS
- An iPhone (for iOS deployment)
- An Expo account

Note: After setting up your Apple Developer account, you may need to wait 16-24 hours for Apple to approve your profile.

2

Initialize EAS

EAS (Expo Application Services) acts as the interface between your build and Expo, as well as the App Store.

1. Stop your app if it’s running
1. From the dropdown menu in your Workspace, select “EAS init”
1. Log in to your Expo account when prompted
1. Create a new project or select an existing one

This step authenticates your application with your Expo account.

3

Run EAS update

This initialization step helps configure your project and link it to your Apple Developer account.

1. From the dropdown menu, select “EAS update”
1. Wait for the Metro bundler to start and complete the export process

You’ll know this step is successful when you see that bundles have been uploaded and a branch has been created.

4

Build for iOS

Now it’s time to create a preview build for your iOS device.

1. From the dropdown menu, select “EAS publish preview iOS”
1. Enter an iOS bundle identifier (e.g., com.yourname.yourappname)
1. Log in to your App Store Connect account when prompted
1. Select your individual developer team
1. Generate the device distribution certificates when asked

Learn more about iOS certificates and provisioning profiles.

5

Register your device

To install development apps on your iPhone, you need to register your device.

1. When prompted, select “website” to register your device
1. Scan the QR code that appears with your iPhone
1. Download the development profile when prompted
1. Go to Settings on your iPhone
1. Select “Profile Downloaded” at the top
1. Install the profile and enter your passcode when prompted
1. Go back to your Workspace and press any key to continue

6

Wait for the build

Expo will now build your app, which takes about 10-15 minutes depending on the complexity of your application.

1. The build will be queued
1. You can check progress in your Expo dashboard under the “Builds” tab
1. Once complete, a new QR code will appear for installing the app

7

Install the app on your device

When the build is complete, install the app on your iPhone.

1. Scan the installation QR code with your iPhone
1. Select “Install” when prompted
1. The app will begin installing on your home screen

8

Enable developer mode

Before you can open the app, you need to enable developer mode on your iPhone.

1. Go to Settings > Privacy & Security
1. Scroll to the bottom and find “Developer Mode”
1. Toggle it on
1. Restart your device when prompted
1. After restarting, you can open and use your app!

## ​What you’ve accomplished

By following this tutorial, you now have a real, native mobile app on your device. Most developers would need days or weeks to achieve this, but you’ve done it in about an hour.

Next stepsAfter completing this tutorial, you can:
Continue refining your app with more features
Add authentication and data storage
Implement native device features like camera or location
Submit your app to the App Store for public distribution
Create an Android version using similar steps

### ​Common issues and solutions

App won't connect to Expo Go
Ensure your phone and computer are on the same Wi-Fi network
Try using “Tunnel” connection mode instead of “LAN”
Check if your firewall is blocking connections
See Expo’s troubleshooting guide

Changes not reflecting in app
Try reloading the app (shake device and select “Reload”)
Ensure you’ve saved your changes in your Workspace
Check the Console for any errors
Review Expo’s development mode documentation

Build fails on EAS
Verify your app.json configuration
Check if all dependencies are compatible
Ensure you have the correct permissions set up
Review any error messages in the build logs
See EAS Build troubleshooting

### ​Conclusion

With Replit and Expo, building mobile apps has never been easier or faster. You can go from idea to app in a matter of hours, not weeks or months. The combination of browser-based development and cross-platform mobile framework removes traditional barriers to entry for mobile development.

For more detailed information, check out:

- Expo documentation
- React Native documentation
- Apple App Store guidelines
- Google Play Store guidelines
- Replit documentation

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/tutorials/build-a-notion-powered-website)

[Create a cat image generatorBuild a fun image generator in 5 minutes using Replit's AI tools. Perfect for beginners exploring no-code development.Next](https://docs.replit.com/getting-started/quickstarts/no-code-cat-image-generator)
