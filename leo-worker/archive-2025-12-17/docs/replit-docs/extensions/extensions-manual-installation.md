# Manual Installation

**Source:** https://docs.replit.com/extensions/development/installation  
**Section:** extensions  
**Scraped:** 2025-09-08 20:13:49

---

DevelopmentManual InstallationCopy pageLearn how to install and initialize the Replit Extensions API client using script tags or npm packages for your project.Copy page

While we recommend using our templates to get started, you can also install the API client manually.

### ​As a <script> import

Start using the Extensions API client by inserting this code into the <head> tag of your HTML:

Copy

Ask AI

```
<script src="https://unpkg.com/@replit/extensions@1.8.0/dist/index.global.js"></script>

```

Start using the API client by creating a new <script> tag and using the pre-defined replit variable.

Copy

Ask AI

```
<script>
  async function main() {
    await replit.init();

    ...
  }

  window.addEventListener('load', main);
</script>

```

### ​As an npm package

Install the client with your preferred package manager, and use the import statement to start using it.

Copy

Ask AI

```
npm install @replit/extensions
yarn add @replit/extensions
pnpm add @replit/extensions

```

After installing the API client, use the import statement to start using it.

Copy

Ask AI

```
import {
  fs,
  data,
  ...
} from '@replit/extensions';

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/devtools)

[Full-StackLearn how to build a full-stack extension by creating a separate backend API server to handle requests from your extension client on Replit.Next](https://docs.replit.com/extensions/development/full-stack)
