#!/usr/bin/env node

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base CSS styles matching design system
const baseStyles = `
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;

  /* Chapel Bliss Custom Variables */
  --chapel-rose: 330 81% 60%;
  --chapel-blush: 350 70% 88%;
  --chapel-champagne: 45 62% 85%;
  --chapel-gold: 43 96% 56%;
  --chapel-sage: 120 25% 65%;
  --chapel-cream: 45 44% 96%;
  --chapel-charcoal: 220 13% 18%;
  
  /* Booking States */
  --booking-available: 142 76% 36%;
  --booking-pending: 45 93% 47%;
  --booking-confirmed: 142 69% 58%;
  --booking-unavailable: 0 65% 51%;
  
  /* Emotional Colors */
  --emotion-romance: 330 81% 60%;
  --emotion-trust: 221 83% 53%;
  --emotion-celebration: 43 96% 56%;
  --emotion-elegance: 259 94% 51%;
  
  /* Chapel Bliss Gradients */
  --romantic-gradient: linear-gradient(135deg, hsl(330 81% 60%) 0%, hsl(43 96% 56%) 100%);
  --elegant-gradient: linear-gradient(135deg, hsl(259 94% 51%) 0%, hsl(330 81% 60%) 100%);
  --trust-gradient: linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(142 76% 36%) 100%);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;

  /* Chapel Bliss Dark Mode Variables */
  --chapel-rose: 330 65% 45%;
  --chapel-blush: 350 50% 25%;
  --chapel-champagne: 45 40% 30%;
  --chapel-gold: 43 80% 45%;
  --chapel-sage: 120 20% 40%;
  --chapel-cream: 45 20% 15%;
  --chapel-charcoal: 220 20% 85%;
  
  /* Dark Mode Booking States */
  --booking-available: 142 60% 45%;
  --booking-pending: 45 75% 55%;
  --booking-confirmed: 142 55% 65%;
  --booking-unavailable: 0 55% 60%;
  
  /* Dark Mode Emotional Colors */
  --emotion-romance: 330 65% 45%;
  --emotion-trust: 221 70% 60%;
  --emotion-celebration: 43 80% 45%;
  --emotion-elegance: 259 80% 60%;
  
  /* Dark Mode Gradients */
  --romantic-gradient: linear-gradient(135deg, hsl(330 65% 45%) 0%, hsl(43 80% 45%) 100%);
  --elegant-gradient: linear-gradient(135deg, hsl(259 80% 60%) 0%, hsl(330 65% 45%) 100%);
  --trust-gradient: linear-gradient(135deg, hsl(221 70% 60%) 0%, hsl(142 60% 45%) 100%);
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Chapel Bliss Base Styles */
.chapel-romantic-gradient {
  background: var(--romantic-gradient);
}

.chapel-elegant-gradient {
  background: var(--elegant-gradient);
}

.chapel-trust-gradient {
  background: var(--trust-gradient);
}

.chapel-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
}

/* Typography styles for Chapel Bliss */
.chapel-display {
  font-family: "Playfair Display", serif;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.chapel-romantic {
  font-family: "Dancing Script", cursive;
  font-weight: 400;
}

/* Smooth transitions for romantic feel */
.chapel-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Elegant focus styles */
.chapel-focus:focus {
  outline: 2px solid hsl(var(--chapel-rose));
  outline-offset: 2px;
}

/* Generous spacing for luxury feel */
.chapel-spacing {
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .chapel-spacing {
    padding: 2rem;
  }
}

/* Utility classes for chapel colors */
.bg-chapel-rose { background-color: hsl(var(--chapel-rose)); }
.text-chapel-rose { color: hsl(var(--chapel-rose)); }
.border-chapel-rose { border-color: hsl(var(--chapel-rose)); }
.bg-chapel-blush { background-color: hsl(var(--chapel-blush)); }
.text-chapel-blush { color: hsl(var(--chapel-blush)); }
.bg-chapel-champagne { background-color: hsl(var(--chapel-champagne)); }
.text-chapel-champagne { color: hsl(var(--chapel-champagne)); }
.bg-chapel-gold { background-color: hsl(var(--chapel-gold)); }
.text-chapel-gold { color: hsl(var(--chapel-gold)); }
.border-chapel-gold { border-color: hsl(var(--chapel-gold)); }
.bg-chapel-sage { background-color: hsl(var(--chapel-sage)); }
.text-chapel-sage { color: hsl(var(--chapel-sage)); }
.bg-chapel-cream { background-color: hsl(var(--chapel-cream)); }
.text-chapel-cream { color: hsl(var(--chapel-cream)); }
.bg-chapel-charcoal { background-color: hsl(var(--chapel-charcoal)); }
.text-chapel-charcoal { color: hsl(var(--chapel-charcoal)); }

/* Booking state utilities */
.bg-booking-available { background-color: hsl(var(--booking-available)); }
.text-booking-available { color: hsl(var(--booking-available)); }
.bg-booking-pending { background-color: hsl(var(--booking-pending)); }
.text-booking-pending { color: hsl(var(--booking-pending)); }
.bg-booking-confirmed { background-color: hsl(var(--booking-confirmed)); }
.text-booking-confirmed { color: hsl(var(--booking-confirmed)); }
.bg-booking-unavailable { background-color: hsl(var(--booking-unavailable)); }
.text-booking-unavailable { color: hsl(var(--booking-unavailable)); }

/* Emotional color utilities */
.bg-emotion-romance { background-color: hsl(var(--emotion-romance)); }
.text-emotion-romance { color: hsl(var(--emotion-romance)); }
.bg-emotion-trust { background-color: hsl(var(--emotion-trust)); }
.text-emotion-trust { color: hsl(var(--emotion-trust)); }
.bg-emotion-celebration { background-color: hsl(var(--emotion-celebration)); }
.text-emotion-celebration { color: hsl(var(--emotion-celebration)); }
.bg-emotion-elegance { background-color: hsl(var(--emotion-elegance)); }
.text-emotion-elegance { color: hsl(var(--emotion-elegance)); }

/* Gradient utility classes */
.bg-gradient-to-br { 
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); 
}
.from-chapel-cream { --tw-gradient-from: hsl(var(--chapel-cream)); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, hsla(var(--chapel-cream) / 0)); }
.via-white { --tw-gradient-stops: var(--tw-gradient-from), white, var(--tw-gradient-to, hsla(white / 0)); }
.to-chapel-blush { --tw-gradient-to: hsl(var(--chapel-blush)); }
.from-chapel-rose { --tw-gradient-from: hsl(var(--chapel-rose)); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, hsla(var(--chapel-rose) / 0)); }
.to-chapel-gold { --tw-gradient-to: hsl(var(--chapel-gold)); }
.bg-gradient-to-r { 
  background-image: linear-gradient(to right, var(--tw-gradient-stops)); 
}
`;

// Basic event delegation for interactive previews
const interactivityScript = `
document.addEventListener('click', function(e) {
  const target = e.target.closest('[data-event]');
  if (!target) return;

  const [event, handler] = target.dataset.event.split(':');
  
  if (event === 'click') {
    switch (handler) {
      case 'toggleTask':
        toggleTask(target.dataset.taskId);
        break;
      case 'addTask':
        console.log('Add task clicked');
        break;
      default:
        console.log('Handler not implemented:', handler);
    }
  }
});

function toggleTask(taskId) {
  console.log('Toggle task:', taskId);
  // Basic task toggle implementation
  const taskElement = document.querySelector(\`[data-task-id="\${taskId}"]\`);
  if (taskElement) {
    const checkbox = taskElement.querySelector('button[data-event="click:toggleTask"]');
    const title = taskElement.querySelector('[data-task-title]');
    
    if (checkbox && title) {
      if (checkbox.classList.contains('bg-accent')) {
        checkbox.classList.remove('bg-accent', 'border-accent');
        checkbox.classList.add('border-muted-foreground');
        title.classList.remove('line-through', 'text-muted-foreground');
        title.classList.add('text-foreground');
      } else {
        checkbox.classList.add('bg-accent', 'border-accent');
        checkbox.classList.remove('border-muted-foreground');
        title.classList.add('line-through', 'text-muted-foreground');
        title.classList.remove('text-foreground');
      }
    }
  }
}
`;

async function renderComponent(componentFile) {
  try {
    // For now, we'll create a simple example component
    // In the full implementation, this would import and render the actual component
    const sampleComponent = React.createElement('div', {
      className: 'min-h-screen p-8 bg-background'
    }, 
      React.createElement('div', { 
        className: 'max-w-2xl mx-auto' 
      },
        React.createElement('div', {
          className: 'rounded-xl border bg-card text-card-foreground shadow p-6'
        },
          React.createElement('div', {
            className: 'flex flex-col space-y-1.5 mb-6'
          },
            React.createElement('h3', {
              className: 'font-semibold leading-none tracking-tight text-2xl'
            }, 'TodoList'),
            React.createElement('p', {
              className: 'text-sm text-muted-foreground'
            }, 'Stay organized, get things done')
          ),
          React.createElement('div', {
            className: 'flex gap-2 mb-6'
          },
            React.createElement('input', {
              type: 'text',
              placeholder: 'Add a new task...',
              className: 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            }),
            React.createElement('button', {
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2',
              'data-event': 'click:addTask'
            }, 'Add Task')
          ),
          React.createElement('div', {
            className: 'space-y-2'
          },
            // Sample task items
            React.createElement('div', {
              className: 'rounded-lg border bg-card p-3 flex items-center gap-3',
              'data-task-id': 'task-1'
            },
              React.createElement('button', {
                className: 'w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center',
                'data-event': 'click:toggleTask',
                'data-task-id': 'task-1'
              }),
              React.createElement('span', {
                className: 'flex-1 text-foreground',
                'data-task-title': true
              }, 'Complete project documentation')
            ),
            React.createElement('div', {
              className: 'rounded-lg border bg-card p-3 flex items-center gap-3',
              'data-task-id': 'task-2'
            },
              React.createElement('button', {
                className: 'w-5 h-5 rounded-full border bg-accent border-accent flex items-center justify-center',
                'data-event': 'click:toggleTask',
                'data-task-id': 'task-2'
              },
                React.createElement('span', {
                  className: 'text-accent-foreground text-xs'
                }, '✓')
              ),
              React.createElement('span', {
                className: 'flex-1 text-muted-foreground line-through',
                'data-task-title': true
              }, 'Review client feedback')
            )
          )
        )
      )
    );

    const staticHTML = renderToStaticMarkup(sampleComponent);

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TodoList Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${baseStyles}
        body {
            pointer-events: none;
            zoom: 0.75;
        }
    </style>
</head>
<body>
    ${staticHTML}
    <script>
        ${interactivityScript}
    </script>
</body>
</html>`;

    return fullHTML;
  } catch (error) {
    console.error('Error rendering component:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const html = await renderComponent('preview-app.tsx');
    console.log(html);
  } catch (error) {
    console.error('Rendering failed:', error);
    process.exit(1);
  }
}

main();