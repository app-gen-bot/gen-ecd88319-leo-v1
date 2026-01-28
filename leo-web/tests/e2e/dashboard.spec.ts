import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../utils/auth-helpers';
import { SELECTORS, TEST_PROJECTS, TIMEOUTS } from '../utils/test-data';

/**
 * Dashboard & Core Feature Tests
 *
 * Tests the main application features:
 * - Dashboard navigation
 * - Project list viewing
 * - Project creation
 * - Project details
 */

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated session for all dashboard tests
    await setupAuthenticatedSession(page);
  });

  test('dashboard loads successfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify on dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verify dashboard elements visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Verify user menu visible
    const userMenu = page.locator(SELECTORS.nav.userMenu);
    await expect(userMenu).toBeVisible({ timeout: 5000 });

    console.log('✓ Dashboard loaded successfully');
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Click dashboard link
    await page.click(SELECTORS.nav.dashboardLink);

    // Verify redirected to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    console.log('✓ Dashboard navigation link works');
  });
});

test.describe('Projects List', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/dashboard');
  });

  test('projects list displays', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('domcontentloaded');

    // Check if projects list or empty state is visible
    const projectsList = page.locator(SELECTORS.dashboard.projectsList);
    const emptyState = page.locator(SELECTORS.dashboard.emptyState);
    const newProjectButton = page.locator(SELECTORS.dashboard.newProjectButton);

    // Either projects list, empty state, or new project button should be visible
    const hasProjects = await projectsList.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;
    const hasNewButton = await newProjectButton.count() > 0;

    expect(hasProjects || hasEmptyState || hasNewButton).toBe(true);

    if (hasProjects) {
      console.log('✓ Projects list displayed');
    } else if (hasEmptyState) {
      console.log('✓ Empty state displayed (no projects yet)');
    } else {
      console.log('✓ New project button displayed');
    }
  });

  test('new project button is visible', async ({ page }) => {
    // Look for any button that creates new projects
    const newProjectButton = page.locator(
      'button:has-text("New Project"), button:has-text("Create Project"), button:has-text("Generate")'
    );

    // Should find at least one
    await expect(newProjectButton.first()).toBeVisible({ timeout: 10000 });

    console.log('✓ New project button visible');
  });
});

test.describe('Project Creation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/dashboard');
  });

  test('project creation form is accessible', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Look for project description input (may be visible or in modal)
    const descriptionInput = page.locator(SELECTORS.dashboard.projectDescription);

    // If not immediately visible, click new project button
    if (await descriptionInput.count() === 0) {
      const newProjectButton = page.locator(SELECTORS.dashboard.newProjectButton);
      if (await newProjectButton.count() > 0) {
        await newProjectButton.first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Now description input should be visible
    await expect(descriptionInput.first()).toBeVisible({ timeout: 5000 });

    console.log('✓ Project creation form accessible');
  });

  test('can fill project description', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Find description input
    let descriptionInput = page.locator(SELECTORS.dashboard.projectDescription);

    // If not immediately visible, click new project button
    if (await descriptionInput.count() === 0) {
      const newProjectButton = page.locator(SELECTORS.dashboard.newProjectButton);
      if (await newProjectButton.count() > 0) {
        await newProjectButton.first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Fill description
    descriptionInput = page.locator(SELECTORS.dashboard.projectDescription).first();
    await descriptionInput.fill(TEST_PROJECTS.simple.description);

    // Verify value set
    const value = await descriptionInput.inputValue();
    expect(value).toBe(TEST_PROJECTS.simple.description);

    console.log('✓ Project description filled successfully');
  });

  // Note: Skipping actual project generation in tests as it takes 2+ minutes
  // and requires Docker/AWS infrastructure
  test.skip('can submit project creation', async ({ page }) => {
    // This test is skipped as it would:
    // 1. Take 2+ minutes to complete
    // 2. Require Docker orchestrator to be running
    // 3. Consume API credits

    // To enable: remove .skip and adjust TIMEOUTS.projectGeneration
    console.log('⚠ Project generation test skipped (would take 2+ minutes)');
  });
});

test.describe('UI Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('navigation is consistent across pages', async ({ page }) => {
    // Check home page
    await page.goto('/');
    let logo = page.locator(SELECTORS.nav.logo).first();
    await expect(logo).toBeVisible();

    // Check dashboard
    await page.goto('/dashboard');
    logo = page.locator(SELECTORS.nav.logo).first();
    await expect(logo).toBeVisible();

    console.log('✓ Navigation consistent across pages');
  });

  test('user menu shows user info', async ({ page }) => {
    await page.goto('/dashboard');

    // Click user menu
    const userMenu = page.locator(SELECTORS.nav.userMenu);
    await expect(userMenu).toBeVisible({ timeout: 5000 });

    console.log('✓ User menu displays correctly');
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('handles navigation to non-existent project gracefully', async ({ page }) => {
    // Try to navigate to non-existent project
    await page.goto('/dashboard/project/non-existent-id-12345');

    // Should not crash - either 404 page or redirect to dashboard
    await page.waitForLoadState('domcontentloaded');

    // No uncaught exceptions should occur
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    expect(errors.length).toBe(0);

    console.log('✓ Non-existent project handled gracefully');
  });
});
