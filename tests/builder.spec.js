import { test, expect } from '@playwright/test';

test.describe('YENZE Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder.html');
  });

  test('should load builder interface', async ({ page }) => {
    await expect(page.locator('#canvas')).toBeVisible();
    await expect(page.locator('#elements-panel')).toBeVisible();
    await expect(page.locator('#properties-panel')).toBeVisible();
  });

  test('should add element to canvas', async ({ page }) => {
    await page.click('[data-element="div"]');
    const canvas = page.locator('#canvas');
    const elements = await canvas.locator('div').count();
    expect(elements).toBeGreaterThan(0);
  });

  test('should undo/redo actions', async ({ page }) => {
    // Add element
    await page.click('[data-element="div"]');

    // Undo with keyboard
    await page.keyboard.press('Control+z');

    // Check element removed
    const canvas = page.locator('#canvas');
    const elements = await canvas.locator('div').count();
    expect(elements).toBe(0);

    // Redo
    await page.keyboard.press('Control+Shift+z');
    const elementsAfterRedo = await canvas.locator('div').count();
    expect(elementsAfterRedo).toBeGreaterThan(0);
  });

  test('should switch between responsive views', async ({ page }) => {
    await page.click('[data-device="mobile"]');
    const canvas = page.locator('#canvas');
    await expect(canvas).toHaveClass(/mobile/);

    await page.click('[data-device="tablet"]');
    await expect(canvas).toHaveClass(/tablet/);

    await page.click('[data-device="desktop"]');
    await expect(canvas).toHaveClass(/desktop/);
  });

  test('should save project', async ({ page }) => {
    // Login first
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to builder
    await page.goto('/builder.html');

    // Add content
    await page.click('[data-element="div"]');

    // Save
    await page.click('#save-btn');

    // Check for success message
    await expect(page.locator('.notification')).toContainText('Saved successfully');
  });

  test('should publish project', async ({ page }) => {
    // Login required
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/builder.html');

    // Add content
    await page.click('[data-element="hero"]');

    // Publish
    await page.click('#publish-btn');

    // Select plan (assuming FREE)
    await page.click('[data-plan="free"]');

    // Check for success
    await expect(page.locator('.success-modal')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard.html');
  });

  test('should display user projects', async ({ page }) => {
    await expect(page.locator('.projects-grid')).toBeVisible();
  });

  test('should create new project', async ({ page }) => {
    await page.click('#new-project-btn');
    await page.fill('[name="project-name"]', 'Test Project');
    await page.click('[data-action="create"]');

    await expect(page.locator('.project-card')).toContainText('Test Project');
  });

  test('should display analytics', async ({ page }) => {
    await page.click('[data-section="analytics"]');
    await expect(page.locator('#analytics-chart')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    await page.goto('/login.html');
    await page.click('#signup-tab');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should handle login errors', async ({ page }) => {
    await page.goto('/login.html');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('builder should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/builder.html');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle 100 elements without lag', async ({ page }) => {
    await page.goto('/builder.html');

    // Add 100 elements
    for (let i = 0; i < 100; i++) {
      await page.click('[data-element="div"]');
    }

    // Check responsiveness
    const startTime = Date.now();
    await page.click('#properties-panel');
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });
});
