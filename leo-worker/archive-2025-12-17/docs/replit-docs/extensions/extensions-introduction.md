# Introduction

**Source:** https://docs.replit.com/extensions/development/react/introduction  
**Section:** extensions  
**Scraped:** 2025-09-08 20:25:35

---

ReactIntroductionCopy pageLearn how to build Replit extensions using React with our official package, hooks, and components for a streamlined development experience.Copy page

Aside from the original API Client, we have a React-specific package which eliminates the need for extension developers to do a lot of boilerplate setup when using React for Extension development.

The package comes with a set of hooks and components that combine to make a blazingly fast and seamless developer experience.

- NPM Package
- GitHub Repository

## ​Installation

Copy

Ask AI

```
npm install @replit/extensions-react
yarn add @replit/extensions-react
pnpm add @replit/extensions-react

```

## ​Usage

Fork the React Extension Template to get started.  Alternatively, you can start from scratch by wrapping your application with the HandshakeProvider component imported from @replit/extensions-react.

Copy

Ask AI

```
import { HandshakeProvider } from '@replit/extensions-react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <HandshakeProvider>
    <App />
  </HandshakeProvider>
)

```

In the App function, check the handshake status with the useReplit hook.

Copy

Ask AI

```
import { useReplit } from '@replit/extensions-react';

function App() {
  const { status, error, replit } = useReplit();

  if(status === "loading") {
    return <div>Loading...</div>
  }

  if(status === "error") {
    return <div>An error occurred: {error?.message}</div>
  }

  return <div>
    Extension is Ready!
  </div>
}

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/development/full-stack)

[useReplitThe `useReplit()` hook establishes the handshake between the Replit and the extension and passes the API wrapper for usage inside a React component.Next](https://docs.replit.com/extensions/development/react/hooks/useReplit)
