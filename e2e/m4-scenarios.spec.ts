import { test, expect } from '@playwright/test';

test.describe('M4: Representative Scenarios (Integrated QA)', () => {
  
  test('M4-WP1-1: Full Flow (Guardian Join -> Caregiver -> Payment -> PDF)', async ({ page, browser }) => {
    let token = '';
    let caseId = '';

    await test.step('1. Guardian Join & Create Case', async () => {
      await page.goto('/login');
      await page.click('text="계정이 없으신가요? 회원가입"');
      const email = `guardian-m4-full-${Date.now()}@example.com`;
      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('input[name="fullName"]', 'Guardian M4 Full');
      await page.click('[data-testid="submit-button"]');

      await page.click('[data-testid="create-case-button"]');
      await page.fill('[data-testid="patient-name-input"]', 'Patient M4 Full');
      const today = new Date().toISOString().split('T')[0];
      await page.fill('[data-testid="start-date-input"]', today);
      await page.fill('[data-testid="end-date-input"]', today);
      await page.fill('[data-testid="daily-wage-input"]', '100000');
      await page.click('[data-testid="save-case-button"]');

      await expect(page).toHaveURL(/\/cases\/.+/);
      caseId = page.url().split('/cases/')[1];
    });

    await test.step('2. Guardian Agreement & Get Token', async () => {
      await page.click('[data-testid="agreement-button"]');
      await page.click('[data-testid="agreement-checkbox"]');
      await page.click('[data-testid="submit-agreement-button"]');

      const linkUrl = await page.inputValue('input[readonly]');
      token = linkUrl.split('/enter/')[1];
      expect(token).toBeTruthy();
    });

    await test.step('3. Caregiver Join & Log (via Token)', async () => {
      const cgContext = await browser.newContext();
      const cgPage = await cgContext.newPage();
      await cgPage.goto(`/caregiver/${token}`); // Direct entry

      await cgPage.fill('[data-testid="caregiver-name-input"]', 'CG M4 Full');
      await cgPage.fill('[data-testid="caregiver-phone-input"]', '010-1111-2222');
      await cgPage.fill('[data-testid="caregiver-birth-input"]', '900101');
      await cgPage.fill('[data-testid="caregiver-address-input"]', 'Full City');
      await cgPage.fill('[data-testid="caregiver-bank-input"]', 'Full Bank');
      await cgPage.fill('[data-testid="caregiver-account-input"]', '123-456');
      await cgPage.click('[data-testid="caregiver-agree-checkbox"]');
      await cgPage.click('[data-testid="caregiver-submit-button"]');

      // Write Log
      await cgPage.click('[data-testid="today-log-button"]');
      await cgPage.fill('[data-testid="log-memo-input"]', 'M4 Full Log');
      await cgPage.click('[data-testid="save-log-button"]');
      
      await cgContext.close();
    });

    await test.step('4. Guardian Payment', async () => {
      // Guardian page is still active. Reload to see status updates if any, or navigate.
      await page.reload();
      
      // Go to Payment page
      await page.click('[data-testid="payment-link"]');

      await page.fill('[data-testid="payment-amount-input"]', '100000');
      await page.fill('[data-testid="payment-date-input"]', new Date().toISOString().split('T')[0]);
      await page.click('[data-testid="save-payment-button"]');

      await expect(page).toHaveURL(/\/cases\/.+/);
      await expect(page.getByText('지급 정보 입력됨')).toBeVisible(); // Verify status or badge
    });

    await test.step('5. PDF Generation', async () => {
      const downloadPromise = page.waitForEvent('download');
      
      // The button might be disabled if conditions aren't met, but we fulfilled them.
      await page.click('[data-testid="generate-pdf-button"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('care_documents_');
    });
  });

  test('M3-WP4-2/3: PDF Generation Failure Conditions', async ({ page, browser }) => {
      // Create a case but SKIP log or payment to verify error
      await page.goto('/login');
      await page.click('text="계정이 없으신가요? 회원가입"');
      const email = `guardian-pdf-fail-${Date.now()}@example.com`;
      await page.fill('[data-testid="email-input"]', email);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('input[name="fullName"]', 'Guardian PDF Fail');
      await page.click('[data-testid="submit-button"]');

      await page.click('[data-testid="create-case-button"]');
      await page.fill('[data-testid="patient-name-input"]', 'Patient Fail');
      const today = new Date().toISOString().split('T')[0];
      await page.fill('[data-testid="start-date-input"]', today);
      await page.fill('[data-testid="end-date-input"]', today);
      await page.fill('[data-testid="daily-wage-input"]', '100000');
      await page.click('[data-testid="save-case-button"]');

      // Agree
      await page.click('[data-testid="agreement-button"]');
      await page.click('[data-testid="agreement-checkbox"]');
      await page.click('[data-testid="submit-agreement-button"]');

      // Get Token
      const linkUrl = await page.inputValue('input[readonly]');
      const token = linkUrl.split('/enter/')[1];

      // Caregiver Joins (but DOES NOT WRITE LOG)
      const cgContext = await browser.newContext();
      const cgPage = await cgContext.newPage();
      await cgPage.goto(`/caregiver/${token}`);
      await cgPage.fill('[data-testid="caregiver-name-input"]', 'CG Fail');
      await cgPage.fill('[data-testid="caregiver-phone-input"]', '010-0000-0000');
      await cgPage.fill('[data-testid="caregiver-birth-input"]', '900101');
      await cgPage.fill('[data-testid="caregiver-address-input"]', 'Fail City');
      await cgPage.fill('[data-testid="caregiver-bank-input"]', 'Fail Bank');
      await cgPage.fill('[data-testid="caregiver-account-input"]', '0000');
      await cgPage.click('[data-testid="caregiver-agree-checkbox"]');
      await cgPage.click('[data-testid="caregiver-submit-button"]');
      await cgContext.close();

      // Back to Guardian
      await page.reload();

      // Try PDF (Fail: No Log, No Payment)
      await page.click('[data-testid="generate-pdf-button"]');
      await expect(page.getByText('작성된 간병일지가 없습니다')).toBeVisible();
      await expect(page.getByText('지급 정보가 입력되지 않았습니다')).toBeVisible();
  });

  test('M4-WP3-1: Privacy Policy Access', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText('개인정보 처리방침')).toBeVisible();
    // Verify key content exist
    await expect(page.getByText('목적')).toBeVisible();
    await expect(page.getByText('5년')).toBeVisible(); // Retention period
  });

});

test.describe('M4: Edge Scenarios (Period Management)', () => {
    test.describe.configure({ mode: 'serial' });
    
    let guardianPage;
    let guardianContext;
    let token;

    test.beforeAll(async ({ browser }) => {
        guardianContext = await browser.newContext();
        guardianPage = await guardianContext.newPage();
        const email = `guardian-m4-edge-${Date.now()}@example.com`;
        
        // Setup: Guardian with Long Case
        await guardianPage.goto('/login');
        await guardianPage.click('text="계정이 없으신가요? 회원가입"');
        await guardianPage.fill('[data-testid="email-input"]', email);
        await guardianPage.fill('[data-testid="password-input"]', 'password123');
        await guardianPage.fill('input[name="fullName"]', 'Guardian M4 Edge');
        await guardianPage.click('[data-testid="submit-button"]');
        
        await guardianPage.click('[data-testid="create-case-button"]');
        await guardianPage.fill('[data-testid="patient-name-input"]', 'Patient M4 Edge');
        
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        await guardianPage.fill('[data-testid="start-date-input"]', today);
        await guardianPage.fill('[data-testid="end-date-input"]', nextMonth.toISOString().split('T')[0]);
        await guardianPage.fill('[data-testid="daily-wage-input"]', '100000');
        await guardianPage.click('[data-testid="save-case-button"]');
        
        await guardianPage.click('[data-testid="agreement-button"]');
        await guardianPage.click('[data-testid="agreement-checkbox"]');
        await guardianPage.click('[data-testid="submit-agreement-button"]');
        
        const linkUrl = await guardianPage.inputValue('input[readonly]');
        token = linkUrl.split('/enter/')[1];
    });

    test.afterAll(async () => {
        await guardianContext.close();
    });

    test('M4-WP1-2: Early End Scenario', async ({ browser }) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        await guardianPage.reload(); 
        await guardianPage.click('[data-testid="early-end-button"]');
        await guardianPage.fill('[data-testid="period-date-input"]', tomorrowStr);
        await guardianPage.click('[data-testid="save-period-button"]');
        
        await expect(guardianPage.getByText(tomorrowStr)).toBeVisible();
        
        // Verification as Caregiver
        const cgContext = await browser.newContext();
        const cgPage = await cgContext.newPage();
        await cgPage.goto(`/caregiver/${token}`);
        // Need to agree first to see logs? Yes.
        await cgPage.fill('[data-testid="caregiver-name-input"]', 'CG Edge');
        await cgPage.fill('[data-testid="caregiver-phone-input"]', '010-9999-9999');
        await cgPage.fill('[data-testid="caregiver-birth-input"]', '900101');
        await cgPage.fill('[data-testid="caregiver-address-input"]', 'Edge City');
        await cgPage.fill('[data-testid="caregiver-bank-input"]', 'Edge Bank');
        await cgPage.fill('[data-testid="caregiver-account-input"]', '1234');
        await cgPage.click('[data-testid="caregiver-agree-checkbox"]');
        await cgPage.click('[data-testid="caregiver-submit-button"]');

        // Now in logs
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterStr = dayAfterTomorrow.toISOString().split('T')[0];
        
        const linkToFuture = cgPage.locator(`a[href*="${dayAfterStr}"]`);
        await expect(linkToFuture).toHaveCount(0);
        
        await cgContext.close();
    });

    test('M4-WP1-3: Extend Scenario', async ({ browser }) => {
        const future = new Date();
        future.setDate(future.getDate() + 60);
        const futureStr = future.toISOString().split('T')[0];
        
        await guardianPage.click('[data-testid="extend-period-button"]');
        await guardianPage.fill('[data-testid="period-date-input"]', futureStr);
        await guardianPage.click('[data-testid="save-period-button"]');
        
        // Verification
        const cgContext = await browser.newContext();
        const cgPage = await cgContext.newPage();
        // Using existing token, caregiver is already 'agreed' in DB for this case_id?
        // Yes, user is not tied to session but token.
        // If we visit same token, it should redirect to logs.
        await cgPage.goto(`/caregiver/${token}`);
        
        const farFutureDate = new Date();
        farFutureDate.setDate(farFutureDate.getDate() + 50);
        const farFutureStr = farFutureDate.toISOString().split('T')[0];
        
        // Check simplified string format MM-DD usually displayed
        const month = (farFutureDate.getMonth() + 1).toString().padStart(2, '0');
        const day = farFutureDate.getDate().toString().padStart(2, '0');
        const dateDisplay = `${month}-${day}`;

        // Wait for list to load
        await expect(cgPage.getByText(dateDisplay)).toBeVisible();
        
        await cgContext.close();
    });
});
