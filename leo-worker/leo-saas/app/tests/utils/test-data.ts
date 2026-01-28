/**
 * Test Data Constants
 *
 * Shared test data for Playwright E2E tests
 */

export const TEST_USERS = {
  // Main test user for auth flows
  primary: {
    email: 'playwright-test@example.com',
    password: 'TestPassword123!',
    name: 'Playwright Test User',
  },

  // Secondary user for multi-user scenarios
  secondary: {
    email: 'playwright-test-2@example.com',
    password: 'TestPassword456!',
    name: 'Playwright Test User 2',
  },
};

export const TEST_PROJECTS = {
  simple: {
    description: 'A simple todo app with user authentication',
    expectedFeatures: ['todo', 'auth', 'user'],
  },

  complex: {
    description: 'An e-commerce platform with product catalog, shopping cart, and checkout',
    expectedFeatures: ['product', 'cart', 'checkout', 'payment'],
  },
};

// Backend API URL (not frontend)
export const BACKEND_URL = 'http://localhost:5013';

export const API_ENDPOINTS = {
  health: `${BACKEND_URL}/health`,
  projects: `${BACKEND_URL}/api/projects`,
  projectById: (id: string) => `${BACKEND_URL}/api/projects/${id}`,
  deployProject: (id: string) => `${BACKEND_URL}/api/projects/${id}/deploy`,
  projectLogs: (id: string) => `${BACKEND_URL}/api/projects/${id}/logs`,
};

export const SELECTORS = {
  // Navigation
  nav: {
    logo: '[data-testid="logo"], a[href="/"]',
    loginButton: 'a[href="/login"]',
    registerButton: 'a[href="/register"]',
    dashboardLink: 'a[href="/dashboard"]',
    userMenu: '[data-testid="user-menu"]',
    logoutButton: '[data-testid="logout-button"], button:has-text("Logout")',
  },

  // Auth forms
  auth: {
    emailInput: 'input[type="email"], input[name="email"]',
    passwordInput: 'input[type="password"], input[name="password"]',
    nameInput: 'input[name="name"]',
    submitButton: 'button[type="submit"]',
    loginSubmit: 'button:has-text("Sign In"), button:has-text("Login")',
    registerSubmit: 'button:has-text("Sign Up"), button:has-text("Register")',
  },

  // Dashboard
  dashboard: {
    newProjectButton: 'button:has-text("New Project"), button:has-text("Create Project")',
    projectsList: '[data-testid="projects-list"]',
    projectCard: '[data-testid="project-card"]',
    projectDescription: 'textarea[placeholder*="describe"], textarea[name="description"]',
    generateButton: 'button:has-text("Generate"), button:has-text("Create")',
    emptyState: '[data-testid="empty-state"]',
  },

  // Project details
  project: {
    title: '[data-testid="project-title"], h1',
    status: '[data-testid="project-status"]',
    deployButton: 'button:has-text("Deploy")',
    logViewer: '[data-testid="log-viewer"]',
    downloadButton: 'button:has-text("Download")',
  },
};

export const TIMEOUTS = {
  navigation: 5000,
  apiCall: 10000,
  longOperation: 30000,
  projectGeneration: 120000, // 2 minutes for project generation
};

export const LOCAL_STORAGE_KEYS = {
  authToken: 'sb-flhrcbbdmgflzgicgeua-auth-token',
};
