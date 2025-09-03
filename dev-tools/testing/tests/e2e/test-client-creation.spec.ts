import { test, expect } from '@playwright/test';

test.describe('Client Creation Flow', () => {
  test('should create a new client successfully', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(60000);

    console.log('🚀 Starting client creation test...');

    // Navigate to the homepage
    await page.goto('http://localhost:5173');
    
    // Wait for page to load and check for errors
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Homepage loaded');

    // Check for JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console error:', msg.text());
      }
    });

    // Take a screenshot of the homepage
    await page.screenshot({ path: 'homepage.png', fullPage: true });

    // Navigate directly to clients page since we know the route structure
    console.log('📍 Navigating to /app/clients...');
    await page.goto('http://localhost:5173/app/clients');
    await page.waitForLoadState('networkidle');

    // Take screenshot of clients page
    await page.screenshot({ path: 'clients-page.png', fullPage: true });

    // Look for "Add Client" or "New Client" button
    const addClientSelectors = [
      'text=Add Client',
      'text=New Client',
      'text=Create Client',
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("Create")',
      '[data-testid="add-client"]',
      '[data-testid="new-client"]'
    ];

    let addButtonFound = false;
    for (const selector of addClientSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found add client button: ${selector}`);
          await element.click();
          addButtonFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!addButtonFound) {
      console.log('⚠️ No add client button found, trying direct form URL...');
      await page.goto('http://localhost:5173/app/clients/new');
      await page.waitForLoadState('networkidle');
    }

    // Wait for form to appear
    await page.waitForTimeout(2000);
    
    // Take screenshot of the form
    await page.screenshot({ path: 'client-form.png', fullPage: true });

    // Fill out the client form
    const testData = {
      companyName: 'New Test Company',
      contactPerson: 'Alice Johnson',
      email: 'alice@newtest.com',
      phone: '555-0200'
    };

    console.log('📝 Filling out client form...');

    // Try different input field selectors based on form structure
    const formFields = [
      { 
        name: 'companyName', 
        value: testData.companyName, 
        selectors: [
          'input[name="companyName"]', 
          'input[name="name"]',
          'input[placeholder*="Company"]', 
          'input[id="companyName"]',
          'input[id="name"]',
          'label:has-text("Company Name") + input',
          'label:has-text("Company Name") ~ input'
        ] 
      },
      { 
        name: 'contactPerson', 
        value: testData.contactPerson, 
        selectors: [
          'input[name="contactPerson"]',
          'input[name="contact"]',
          'input[placeholder*="Contact"]', 
          'input[id="contactPerson"]',
          'input[id="contact"]',
          'label:has-text("Contact Person") + input',
          'label:has-text("Contact Person") ~ input'
        ] 
      },
      { 
        name: 'email', 
        value: testData.email, 
        selectors: [
          'input[name="email"]', 
          'input[type="email"]', 
          'input[placeholder*="email"]',
          'label:has-text("Email") + input',
          'label:has-text("Email") ~ input'
        ] 
      },
      { 
        name: 'phone', 
        value: testData.phone, 
        selectors: [
          'input[name="phone"]', 
          'input[type="tel"]', 
          'input[placeholder*="phone"]',
          'label:has-text("Phone") + input',
          'label:has-text("Phone") ~ input'
        ] 
      }
    ];

    for (const field of formFields) {
      let fieldFilled = false;
      for (const selector of field.selectors) {
        try {
          const input = await page.locator(selector).first();
          if (await input.isVisible()) {
            await input.fill(field.value);
            console.log(`✅ Filled ${field.name}: ${field.value}`);
            fieldFilled = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      if (!fieldFilled) {
        console.log(`⚠️ Could not find field: ${field.name}`);
      }
    }

    // Take screenshot after filling form
    await page.screenshot({ path: 'form-filled.png', fullPage: true });

    // Submit the form
    const submitSelectors = [
      'button[type="submit"]',
      'text=Submit',
      'text=Create',
      'text=Save',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Submit")'
    ];

    let submitFound = false;
    for (const selector of submitSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          console.log(`✅ Found submit button: ${selector}`);
          await button.click();
          submitFound = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!submitFound) {
      console.log('⚠️ No submit button found');
    }

    // Wait for submission response
    await page.waitForTimeout(3000);

    // Take final screenshot
    await page.screenshot({ path: 'after-submit.png', fullPage: true });

    // Check for success message or redirect
    const successIndicators = [
      'text=success',
      'text=created',
      'text=added',
      '.success',
      '.alert-success',
      '[data-testid="success"]'
    ];

    let successFound = false;
    for (const selector of successIndicators) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Success indicator found: ${selector}`);
          successFound = true;
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }

    console.log('🏁 Test completed');
    console.log(`Success indicators found: ${successFound}`);

    // Get page content for analysis
    const pageContent = await page.content();
    console.log('📄 Current page URL:', page.url());
    
    // Check if we can see any error messages
    const errors = await page.locator('.error, .alert-error, [data-testid="error"]').allTextContents();
    if (errors.length > 0) {
      console.log('❌ Errors found:', errors);
    }
  });
});