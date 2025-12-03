import { test, expect } from '@playwright/test';

test.describe('M3 Scenarios: Payment & PDF', () => {
  let caseId = '';
  let token = '';

  // Setup: Guardian creates case + Agreement
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `guardian-m3-test-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Guardian M3 Test');
    await page.click('[data-testid="submit-button"]');
    
    await page.click('[data-testid="create-case-button"]');
    await page.fill('[data-testid="patient-name-input"]', 'Patient M3 Test');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date-input"]', today);
    await page.fill('[data-testid="end-date-input"]', today);
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    await page.click('[data-testid="save-case-button"]');
    
    const url = page.url();
    caseId = url.split('/cases/')[1];

    await page.click('[data-testid="agreement-button"]');
    await page.click('[data-testid="agreement-checkbox"]');
    await page.click('[data-testid="submit-agreement-button"]');
    
    const linkUrl = await page.inputValue('input[readonly]'); 
    token = linkUrl.split('/enter/')[1];
    
    await context.close();
  });

  // Re-login helper
  async function login(page) {
      // Note: Ideally we use session storage state. 
      // Here we assume we know the credentials from beforeAll? 
      // Actually, sharing variables like `email` from beforeAll to test is tricky if tests run in parallel workers.
      // But `fullyParallel: true` in config.
      // So each test should probably setup its own data or we disable parallel for this file.
      // `test.describe.configure({ mode: 'serial' });`
  }

  test.describe.configure({ mode: 'serial' }); // Run sequentially to share state logic if needed, but better to use storageState.

  test('M3-WP1-3: Payment Missing State & M3-WP4-2/3: PDF Fail', async ({ page }) => {
    // Login with same user? 
    // Actually, let's just create a new user/case for this specific test to be safe and isolated.
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `guardian-m3-fail-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Guardian Fail');
    await page.click('[data-testid="submit-button"]');
    
    await page.click('[data-testid="create-case-button"]');
    await page.fill('[data-testid="patient-name-input"]', 'Patient Fail');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-01-01');
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    await page.click('[data-testid="save-case-button"]');
    
    // Check M3-WP1-3: Payment Missing
    await expect(page.getByText('지급 정보 미입력')).toBeVisible();
    
    // M3-WP4-2/3: Try PDF Generate (Should fail/not visible or error)
    // Button might not be visible if status is not IN_PROGRESS.
    // Need agreement -> IN_PROGRESS
    await page.click('[data-testid="agreement-button"]');
    await page.click('[data-testid="agreement-checkbox"]');
    await page.click('[data-testid="submit-agreement-button"]');
    
    // Need Caregiver Agreement for IN_PROGRESS
    const linkUrl = await page.inputValue('input[readonly]');
    const token = linkUrl.split('/enter/')[1];
    
    const cgContext = await page.context().browser().newContext();
    const cgPage = await cgContext.newPage();
    await cgPage.goto(linkUrl);
    await cgPage.fill('[data-testid="caregiver-name-input"]', 'CG');
    await cgPage.fill('[data-testid="caregiver-phone-input"]', '010-0000');
    await cgPage.fill('[data-testid="caregiver-birth-input"]', '900101');
    await cgPage.fill('[data-testid="caregiver-address-input"]', 'Addr');
    await cgPage.fill('[data-testid="caregiver-bank-input"]', 'Bank');
    await cgPage.fill('[data-testid="caregiver-account-input"]', '123');
    await cgPage.click('[data-testid="caregiver-agree-checkbox"]');
    await cgPage.click('[data-testid="caregiver-submit-button"]');
    await cgPage.close();
    
    await page.reload();
    // Now IN_PROGRESS, button visible
    await expect(page.getByTestId('generate-pdf-button')).toBeVisible();
    
    // Click -> Fail (No Payment, No Logs)
    await page.click('[data-testid="generate-pdf-button"]');
    await expect(page.getByText('작성된 간병일지가 없습니다')).toBeVisible();
    await expect(page.getByText('지급 정보가 입력되지 않았습니다')).toBeVisible();
  });

  test('M3-WP1-1/2: Payment Insert & Update', async ({ page }) => {
    // Setup User/Case
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `guardian-m3-pay-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Guardian Pay');
    await page.click('[data-testid="submit-button"]');
    
    await page.click('[data-testid="create-case-button"]');
    await page.fill('[data-testid="patient-name-input"]', 'Patient Pay');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date-input"]', today);
    await page.fill('[data-testid="end-date-input"]', today);
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    await page.click('[data-testid="save-case-button"]');
    
    // WP1-1: Insert
    await page.click('text="입력하기"');
    await page.fill('[data-testid="payment-amount-input"]', '100000');
    await page.fill('[data-testid="payment-date-input"]', today);
    await page.click('[data-testid="save-payment-button"]');
    
    await expect(page.getByText('지급 정보 입력됨')).toBeVisible();
    await expect(page.getByText('100,000원')).toBeVisible();
    
    // WP1-2: Update
    await page.click('text="수정하기"');
    await page.fill('[data-testid="payment-amount-input"]', '200000');
    await page.click('[data-testid="save-payment-button"]');
    
    await expect(page.getByText('200,000원')).toBeVisible();
  });
});

