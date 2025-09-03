// Playwright test for client creation process
import { test, expect } from '@playwright/test';

test.describe('Client Creation Flow', () => {
  test('should create a new client successfully', async ({ page }) => {
    console.log('🚀 Starting client creation test...');
    
    // Step 1: Navigate to the application
    console.log('📍 Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage.png' });
    console.log('📸 Homepage screenshot saved');
    
    // Step 2: Look for client navigation
    console.log('🔍 Looking for client navigation...');
    
    const clientNavSelectors = [
      'a[href*="client"]',
      'a[href*="/clients"]', 
      'a[href*="/app/clients"]',
      'nav a:has-text("Clients")',
      'nav a:has-text("Client")',
      '[data-testid="clients-nav"]',
      'text=Clients'
    ];
    
    let clientNavFound = false;
    for (const selector of clientNavSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found client navigation: ${selector}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          clientNavFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    await page.screenshot({ path: 'test-results/after-nav-click.png' });
    
    // Step 3: Look for client creation button
    console.log('🔍 Looking for client creation button...');
    
    const createClientSelectors = [
      'button:has-text("Add Client")',
      'button:has-text("New Client")', 
      'button:has-text("Create Client")',
      'a:has-text("Add Client")',
      'a:has-text("New Client")',
      '[data-testid="add-client"]',
      '[data-testid="create-client"]',
      'text=Add Client',
      'text=New Client'
    ];
    
    let createButtonFound = false;
    for (const selector of createClientSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found create client button: ${selector}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          createButtonFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    await page.screenshot({ path: 'test-results/create-client-page.png' });
    
    // Step 4: Fill out the form if we found it
    if (createButtonFound) {
      console.log('📝 Filling out client creation form...');
      
      const testClient = {
        company: 'Acme Corporation',
        contact: 'Jane Doe',
        email: 'jane@acme.com', 
        phone: '555-0199',
        address: '456 Main Street'
      };
      
      // Try to fill common form fields
      const formMappings = {
        company: ['[name="company"]', '[name="companyName"]', '[name="name"]', 'input[placeholder*="company" i]'],
        contact: ['[name="contact"]', '[name="contactPerson"]', '[name="contactName"]', 'input[placeholder*="contact" i]'],
        email: ['[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'],
        phone: ['[name="phone"]', 'input[type="tel"]', 'input[placeholder*="phone" i]'],
        address: ['[name="address"]', 'textarea[name="address"]', 'input[placeholder*="address" i]']
      };
      
      const filledFields = {};
      
      for (const [field, value] of Object.entries(testClient)) {
        for (const selector of formMappings[field] || []) {
          try {
            const element = page.locator(selector).first();
            if (await element.isVisible()) {
              await element.fill(value);
              filledFields[field] = value;
              console.log(`✅ Filled ${field}: ${value}`);
              break;
            }
          } catch (e) {
            // Try next selector
          }
        }
      }
      
      await page.screenshot({ path: 'test-results/form-filled.png' });
      
      // Step 5: Submit the form
      console.log('🚀 Submitting form...');
      
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Save")',
        'button:has-text("Create")', 
        'button:has-text("Add")',
        'button:has-text("Submit")',
        '[data-testid="submit"]'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`✅ Found submit button: ${selector}`);
            
            // Listen for network requests
            const requests = [];
            page.on('request', request => {
              if (request.method() === 'POST' || request.method() === 'PUT') {
                requests.push(`${request.method()} ${request.url()}`);
              }
            });
            
            // Listen for console messages
            const consoleMessages = [];
            page.on('console', msg => {
              consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
            });
            
            await element.click();
            await page.waitForTimeout(2000); // Wait for potential response
            
            console.log('📄 Console messages:', consoleMessages);
            console.log('🌐 Network requests:', requests);
            
            submitted = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      await page.screenshot({ path: 'test-results/after-submit.png' });
      
      // Step 6: Check for success/error messages
      console.log('🔍 Checking for feedback messages...');
      
      // Look for success messages
      const successSelectors = ['.success', '.alert-success', 'text=success', 'text=created', 'text=added'];
      for (const selector of successSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            const message = await element.textContent();
            console.log(`✅ Success message: ${message}`);
          }
        } catch (e) {
          // Continue
        }
      }
      
      // Look for error messages
      const errorSelectors = ['.error', '.alert-error', '.alert-danger', 'text=error', 'text=failed'];
      for (const selector of errorSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            const message = await element.textContent();
            console.log(`❌ Error message: ${message}`);
          }
        } catch (e) {
          // Continue
        }
      }
    }
    
    // Step 7: Try to verify client was created
    console.log('🔍 Checking if client was created...');
    
    try {
      await page.goto('http://localhost:5173/clients');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/final-client-list.png' });
      
      // Look for our test client
      const acmeElement = page.locator('text=Acme Corporation').first();
      if (await acmeElement.isVisible()) {
        console.log('✅ SUCCESS: New client "Acme Corporation" found in client list!');
      } else {
        console.log('⚠️ New client not found in list');
      }
    } catch (e) {
      console.log('⚠️ Could not navigate to client list:', e.message);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/final-state.png' });
  });
});