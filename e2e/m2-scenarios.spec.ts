import { test, expect } from '@playwright/test';

test.describe('M2-WP1/2: Caregiver Entry & Agreement', () => {
  let token = '';

  // Setup: Guardian creates a case first to get a token
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `guardian-m2-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Guardian M2');
    await page.click('[data-testid="submit-button"]');
    
    await page.click('[data-testid="create-case-button"]');
    await page.fill('[data-testid="patient-name-input"]', 'Patient M2');
    
    // Set dates to include today
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    
    await page.fill('[data-testid="start-date-input"]', today);
    await page.fill('[data-testid="end-date-input"]', nextWeek);
    await page.fill('[data-testid="daily-wage-input"]', '150000');
    await page.click('[data-testid="save-case-button"]');
    
    // Agree
    await page.click('[data-testid="agreement-button"]');
    await page.click('[data-testid="agreement-checkbox"]');
    await page.click('[data-testid="submit-agreement-button"]');
    
    // Get Token from Copy Link Button value (or by some other means)
    // Since copy button is client side and we can't easily read clipboard in headless, 
    // we can read the input value.
    await expect(page.getByText('링크 복사')).toBeVisible();
    const linkUrl = await page.inputValue('input[readonly]'); 
    // linkUrl like "http://localhost:3000/enter/abc123token..."
    // Extract token
    token = linkUrl.split('/enter/')[1];
    
    await context.close();
  });

  test('M2-WP1-1: Valid Token Entry', async ({ page }) => {
    await page.goto(`/caregiver/${token}`);
    await expect(page.getByText('간병인 매칭 동의')).toBeVisible();
    await expect(page.getByText('Patient M2')).toBeVisible();
  });

  test('M2-WP1-2: Invalid Token Entry', async ({ page }) => {
    await page.goto('/caregiver/invalid-token-123');
    await expect(page.getByText('유효하지 않은 링크입니다')).toBeVisible();
  });

  test('M2-WP2-1: Agreement Flow', async ({ page }) => {
    await page.goto(`/caregiver/${token}`);
    
    await page.fill('[data-testid="caregiver-name-input"]', 'Caregiver Kim');
    await page.fill('[data-testid="caregiver-phone-input"]', '010-1234-5678');
    await page.fill('[data-testid="caregiver-birth-input"]', '800101');
    await page.fill('[data-testid="caregiver-address-input"]', 'Seoul Gangnam');
    await page.fill('[data-testid="caregiver-bank-input"]', 'KakaoBank');
    await page.fill('[data-testid="caregiver-account-input"]', '3333-01-000000');
    
    await page.click('[data-testid="caregiver-agree-checkbox"]');
    await page.click('[data-testid="caregiver-submit-button"]');
    
    // Should redirect to logs
    await expect(page).toHaveURL(/\/logs$/);
    await expect(page.getByText('간병일지 목록')).toBeVisible();
  });

  test('M2-WP2-3: Re-entry after Agreement', async ({ page }) => {
    // Should redirect or show "already agreed"
    await page.goto(`/caregiver/${token}`);
    // M2 logic: shows "already agreed" page with link to logs
    await expect(page.getByText('이미 동의 완료된 간병입니다')).toBeVisible();
    await page.click('text="간병일지 작성하러 가기"');
    await expect(page).toHaveURL(/\/logs$/);
  });
});

test.describe('M2-WP3: Care Log', () => {
  let token = '';
  // Need a token that is already agreed. 
  // We can reuse previous test's token if we run in serial or setup again.
  // For robustness, let's setup a new one.
  
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // ... (Similar setup code as above, omitting for brevity if possible, but Playwright isolation needs full setup usually)
    await page.goto('/login');
    await page.click('text="계정이 없으신가요? 회원가입"');
    const email = `guardian-m2-log-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('input[name="fullName"]', 'Guardian Log');
    await page.click('[data-testid="submit-button"]');
    
    await page.click('[data-testid="create-case-button"]');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="patient-name-input"]', 'Patient Log');
    await page.fill('[data-testid="start-date-input"]', today);
    await page.fill('[data-testid="end-date-input"]', today); // 1 day case
    await page.fill('[data-testid="daily-wage-input"]', '100000');
    await page.click('[data-testid="save-case-button"]');
    
    await page.click('[data-testid="agreement-button"]');
    await page.click('[data-testid="agreement-checkbox"]');
    await page.click('[data-testid="submit-agreement-button"]');
    
    const linkUrl = await page.inputValue('input[readonly]'); 
    token = linkUrl.split('/enter/')[1];
    
    // Caregiver Agree
    await page.goto(`/caregiver/${token}`);
    await page.fill('[data-testid="caregiver-name-input"]', 'Caregiver Lee');
    await page.fill('[data-testid="caregiver-phone-input"]', '010-1111-2222');
    await page.fill('[data-testid="caregiver-birth-input"]', '900101');
    await page.fill('[data-testid="caregiver-address-input"]', 'Busan');
    await page.fill('[data-testid="caregiver-bank-input"]', 'Shinhan');
    await page.fill('[data-testid="caregiver-account-input"]', '110-000-000000');
    await page.click('[data-testid="caregiver-agree-checkbox"]');
    await page.click('[data-testid="caregiver-submit-button"]');
    
    await context.close();
  });

  test('M2-WP3-1/2: Create Log', async ({ page }) => {
    await page.goto(`/caregiver/${token}/logs`);
    
    await page.click('[data-testid="today-log-button"]');
    
    await page.check('[data-testid="checklist-meal"]');
    await page.check('[data-testid="checklist-medication"]');
    await page.fill('[data-testid="log-memo-input"]', 'Patient ate well.');
    
    await page.click('[data-testid="save-log-button"]');
    
    // Should redirect back to list
    await expect(page).toHaveURL(/\/logs$/);
    await expect(page.getByText('작성완료')).toBeVisible();
  });
  
  test('M2-WP4-2: Invalid Date Access', async ({ page }) => {
      // Access a future date outside range
      const futureDate = '2099-01-01';
      await page.goto(`/caregiver/${token}/logs/${futureDate}`);
      await expect(page.getByText('유효하지 않은 날짜입니다')).toBeVisible();
  });
});

