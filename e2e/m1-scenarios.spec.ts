import { test, expect } from '@playwright/test';

test.describe('M1-WP1: Authentication', () => {
  test('M1-WP1-1: Signup Success', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to signup mode
    await page.click('text="계정이 없으신가요? 회원가입"');
    
    // Generate random email
    const email = `test-${Date.now()}@example.com`;
    
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Test User');
    
    await page.click('[data-testid="submit-button"]');
    
    // Should redirect to cases list
    await expect(page).toHaveURL('/cases');
    await expect(page.getByText('내 케이스가 없습니다')).toBeVisible();
  });

  test('M1-WP1-2: Duplicate Email Signup', async ({ page }) => {
    // Prerequisite: Need an existing user. 
    // For E2E without DB reset, we might rely on a known email or creating one first.
    // Let's create one first.
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `duplicate-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Existing User');
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL('/cases');
    
    // Logout
    // We need a logout button or helper. I'll just hit /auth/logout endpoint via form if UI has it, or clear cookies.
    // In WP1-6, I implemented logout. Let's check if UI has logout button.
    // src/app/cases/page.tsx has a logout form placeholder but maybe I didn't implement the button UI in the code block.
    // Let's assume we clear cookies to logout for test.
    await page.context().clearCookies();
    
    // Try to signup again with same email
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Duplicate User');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.getByText('이미 가입된 이메일입니다')).toBeVisible();
  });
});

test.describe('M1-WP2: Case Management', () => {
  // Helper to login
  async function login(page) {
    await page.goto('/login');
    // Assume we have a user or create one.
    // Ideally we use a fresh user per test or a seeded user.
    // For simplicity here, I'll create a user.
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `case-user-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Case User');
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL('/cases');
  }

  test('M1-WP2-1/2: Create Case Success', async ({ page }) => {
    await login(page);
    
    await page.click('[data-testid="create-case-button"]');
    await expect(page).toHaveURL('/cases/new');
    
    await page.fill('[data-testid="patient-name-input"]', 'Grandpa Kim');
    await page.fill('[data-testid="hospital-name-input"]', 'Seoul Hospital');
    await page.fill('input[name="diagnosis"]', 'Cold');
    
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    await page.fill('[data-testid="start-date-input"]', today);
    await page.fill('[data-testid="end-date-input"]', nextWeek);
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    
    await page.click('[data-testid="save-case-button"]');
    
    // Should redirect to detail
    await expect(page).toHaveURL(/\/cases\/.+/);
    await expect(page.getByText('Grandpa Kim')).toBeVisible();
    await expect(page.getByText('보호자 동의 대기')).toBeVisible();
  });
});

test.describe('M1-WP3: Agreement', () => {
  test('M1-WP3-1/2/3: Agreement Flow', async ({ page }) => {
    // Setup: Create case first
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `agree-user-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Agree User');
    await page.click('[data-testid="submit-button"]');
    
    // Create Case
    await page.click('[data-testid="create-case-button"]');
    await page.fill('[data-testid="patient-name-input"]', 'Patient Lee');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-07');
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    await page.click('[data-testid="save-case-button"]');
    
    // Check Link Inactive (WP3-3)
    await expect(page.getByText('계약 동의 후 링크가 생성됩니다')).toBeVisible();
    await expect(page.getByText('링크 복사')).not.toBeVisible();
    
    // Go to Agreement
    await page.click('[data-testid="agreement-button"]');
    await expect(page).toHaveURL(/\/cases\/.+\/agreement/);
    
    // Check Validation (WP3-4)
    await page.click('[data-testid="submit-agreement-button"]');
    await expect(page.getByText('동의 전 체크박스를 선택해 주세요')).toBeVisible();
    
    // Success Flow
    await page.click('[data-testid="agreement-checkbox"]');
    await page.click('[data-testid="submit-agreement-button"]');
    
    // Back to Detail
    await expect(page).toHaveURL(/\/cases\/.+/);
    // Status Change
    await expect(page.getByText('간병인 연결 대기')).toBeVisible();
    // Link Visible
    await expect(page.getByText('링크 복사')).toBeVisible();
  });
});

