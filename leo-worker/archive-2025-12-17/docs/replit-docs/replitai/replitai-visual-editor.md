# Visual Editor

**Source:** https://docs.replit.com/replitai/visual-editor  
**Section:** replitai  
**Scraped:** 2025-09-08 20:18:47

---

FeaturesVisual EditorCopy pageReplit’s Visual Editor empowers you to make direct visual edits to your app’s UI in the preview, with seamless source code updates.Copy page

## ​Features

The Visual Editor lets you:

- Select elements in your app’s preview for editing
- Edit text directly from the preview if it’s a string in your source code
- Update images by swapping URLs or uploading your own files
- Adjust styles using intuitive controls for properties like padding, text color, and background color
- Instantly preview styling & changes
- Save those changes by updating the source code instantly

## ​Usage

Activate the Visual Editor from the Agent chat.

1. Select an Element: Click any element in your app’s preview to start editing.
1. Edit Element: Directly edit text if it’s a string in your source code, right from the preview. Or use the editor pane in the chat to update more properties like padding, margin, color, etc.
1. Preview Changes: Changes are previewed live in the preview.
1. Save: Hit save to update the source code instantly. If it’s a simple change, your edits will directly update the source code without consuming AI credits. If there’s uncertainty or hidden complexity involved in the edit, Visual Editor seamlessly sends targeted metadata to Agent for accurate assistance.

The Visual Editor is currently available only on web browsers. It is not supported on mobile or desktop applications.

## ​Example Use Cases

The Visual Editor is useful for a variety of UI modifications:

- Text Edits in Preview: Click, type, done. Edit text directly in the Preview tool.
- Perfect Color Updates: Use the color picker to adjust text and backgrounds.

Try alternative input methods, such as typing a color name like ‘purple’ in the input field, or the eyedropper to pick a color from anywhere on your screen.
- Style Changes Across Elements: Adjust padding, margins, and more.
- Image Updates: Select images to swap URLs or upload your own with instant previews.

## ​Tips & guidelines for effective use

- Select the most precise element possible for your intended change
- Selecting an element rendered in a loop or used in multiple places will highlight and update all instances of it
- Updating text of composite elements which are made up of multiple sub elements is disabled in Visual Editor, but you can ask Agent to make changes like this in chat
- Clicking on the top left label will take you to the element in the source code
- Escape key can be used to dismiss the Visual Editor when inside the preview

### ​Upgrading from Element Selector to Visual Editor

When you open an app that has Element Selector available, you’ll see an automatic upgrade prompt to switch to the new Visual Editor.

If you want to upgrade manually, you can do so in any Agent-created JavaScript App by opening the Shell pane and running the following command:

Copy

Ask AI

```
npm i @replit/vite-plugin-cartographer@latest

```

Once you’ve installed the plugin, you can restart your app to start using the new Visual Editor.

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/replitai/replit-dot-md)

[Web SearchAgent searches the web and fetches current information to build apps with up-to-date information, latest documentation, and accurate details from across the internet.Next](https://docs.replit.com/replitai/web-search)
