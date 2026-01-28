// MSW Browser Setup

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the worker instance
export const worker = setupWorker(...handlers);

// Optional: Add request logging in development
if (process.env.NODE_ENV === 'development') {
  worker.events.on('request:start', ({ request }) => {
    console.log('MSW intercepted:', request.method, request.url);
  });
  
  worker.events.on('response:mocked', ({ request, response }) => {
    console.log(
      'MSW responded:',
      request.method,
      request.url,
      response.status,
      response.statusText
    );
  });
}

// Start options
export const workerOptions = {
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
  onUnhandledRequest: 'bypass' as const,
};