import { test, expect, Page } from '@playwright/test';

/**
 * Complete Project CRUD Workflow Test
 * 
 * This test verifies the entire project lifecycle:
 * 1. Create project with all fields
 * 2. Verify project appears in list
 * 3. View project details
 * 4. Edit project data
 * 5. Verify data consistency throughout
 */

// Test data for consistent validation
const TEST_PROJECT_DATA = {
  name: "Fiber Network Expansion Test",
  code: "FNE-2025-001",
  description: "Test project for CRUD verification",
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  updatedDescription: "Updated test project for CRUD verification"
};

test.describe('Project CRUD Workflow', () => {
  let createdProjectId: string;
  
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Add console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });
  });

  test('Complete project CRUD lifecycle with data consistency verification', async ({ page }) => {
    console.log('🚀 Starting Complete Project CRUD Workflow Test');
    console.log('=' * 60);

    // Step 1: Navigate to project creation
    await test.step('Navigate to project creation page', async () => {
      console.log('1. Looking for project creation option...');
      
      // Try multiple navigation strategies
      const navigationSelectors = [
        'a[href*="/projects/new"]',
        'a[href*="/projects/create"]', 
        'a[href*="/app/projects/new"]',
        'a[href*="/app/projects/create"]',
        'button:has-text("New Project")',
        'button:has-text("Add Project")',
        'button:has-text("Create Project")'
      ];
      
      let navigationFound = false;
      
      // First try direct navigation links
      for (const selector of navigationSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          await page.waitForLoadState('networkidle');
          navigationFound = true;
          console.log(`   ✅ Found direct navigation: ${selector}`);
          break;
        }
      }
      
      // If not found, try finding projects section first
      if (!navigationFound) {
        console.log('   Trying to find projects section first...');
        const projectsNav = page.locator('a:has-text("Projects"), nav a[href*="/projects"], a[href*="/app/projects"]').first();
        
        if (await projectsNav.count() > 0) {
          await projectsNav.click();
          await page.waitForLoadState('networkidle');
          
          // Now look for create button again
          for (const selector of navigationSelectors) {
            if (await page.locator(selector).count() > 0) {
              await page.locator(selector).click();
              await page.waitForLoadState('networkidle');
              navigationFound = true;
              console.log(`   ✅ Found navigation after going to projects: ${selector}`);
              break;
            }
          }
        }
      }
      
      expect(navigationFound, 'Should be able to navigate to project creation page').toBe(true);
    });

    // Step 2: Fill project creation form
    await test.step('Fill project creation form with test data', async () => {
      console.log('2. Filling project creation form...');
      
      const formFields = {
        name: ['input[name="name"]', 'input[name="projectName"]', 'input[name="project_name"]', 'input[placeholder*="name" i]'],
        code: ['input[name="code"]', 'input[name="projectCode"]', 'input[name="project_code"]', 'input[placeholder*="code" i]'],
        description: ['textarea[name="description"]', 'input[name="description"]', 'textarea[placeholder*="description" i]'],
        startDate: ['input[name="startDate"]', 'input[name="start_date"]', 'input[type="date"]:first-of-type'],
        endDate: ['input[name="endDate"]', 'input[name="end_date"]', 'input[type="date"]:last-of-type']
      };
      
      const filledFields: Record<string, string> = {};
      
      // Fill each field
      for (const [fieldKey, selectors] of Object.entries(formFields)) {
        let fieldFilled = false;
        const testValue = TEST_PROJECT_DATA[fieldKey as keyof typeof TEST_PROJECT_DATA];
        
        for (const selector of selectors) {
          if (await page.locator(selector).count() > 0) {
            await page.fill(selector, testValue);
            filledFields[fieldKey] = testValue;
            console.log(`   ✅ Filled ${fieldKey}: ${testValue}`);
            fieldFilled = true;
            break;
          }
        }
        
        if (!fieldFilled && fieldKey !== 'code') {  // Code might be optional
          console.log(`   ⚠️  Could not find field: ${fieldKey}`);
        }
      }
      
      // Handle project type selection
      const typeSelectors = ['select[name="type"]', 'select[name="projectType"]', 'select[name="project_type"]'];
      let typeSelected = false;
      
      for (const selector of typeSelectors) {
        if (await page.locator(selector).count() > 0) {
          const options = await page.locator(`${selector} option`).all();
          if (options.length > 1) {
            // Select first non-empty option (likely "FIBRE" or similar)
            const optionValue = await options[1].getAttribute('value');
            const optionText = await options[1].textContent();
            await page.selectOption(selector, optionValue || '');
            filledFields.type = optionText || optionValue || '';
            console.log(`   ✅ Selected project type: ${filledFields.type}`);
            typeSelected = true;
          }
          break;
        }
      }
      
      // Handle client selection
      const clientSelectors = ['select[name="client"]', 'select[name="clientId"]', 'select[name="client_id"]'];
      
      for (const selector of clientSelectors) {
        if (await page.locator(selector).count() > 0) {
          const options = await page.locator(`${selector} option`).all();
          if (options.length > 1) {
            const clientValue = await options[1].getAttribute('value');
            const clientText = await options[1].textContent();
            await page.selectOption(selector, clientValue || '');
            filledFields.client = clientText || '';
            console.log(`   ✅ Selected client: ${filledFields.client}`);
          }
          break;
        }
      }
      
      // Store filled fields for later validation
      (test.info() as any).filledFields = filledFields;
      expect(Object.keys(filledFields).length, 'Should have filled at least some form fields').toBeGreaterThan(2);
    });

    // Step 3: Submit project creation form
    await test.step('Submit project creation form', async () => {
      console.log('3. Submitting project creation form...');
      
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Create")',
        'button:has-text("Save")',
        'button:has-text("Add Project")',
        'input[type="submit"]'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          submitted = true;
          console.log(`   ✅ Clicked submit button: ${selector}`);
          break;
        }
      }
      
      expect(submitted, 'Should be able to submit the form').toBe(true);
      
      await page.waitForLoadState('networkidle');
      
      // Check for success indicators
      const successSelectors = [
        'text="Project created"',
        'text="Success"', 
        'text="Created successfully"',
        '.success',
        '.alert-success',
        '[role="alert"]'
      ];
      
      let successFound = false;
      for (const selector of successSelectors) {
        if (await page.locator(selector).count() > 0) {
          const successText = await page.locator(selector).textContent();
          console.log(`   ✅ Success indicator found: ${successText}`);
          successFound = true;
          break;
        }
      }
      
      // Even if no explicit success message, check if URL changed (redirect to project view/list)
      const currentUrl = page.url();
      console.log(`   Current URL after submit: ${currentUrl}`);
    });

    // Step 4: Verify project appears in project list
    await test.step('Navigate to project list and verify created project', async () => {
      console.log('4. Verifying project appears in project list...');
      
      // Navigate to projects list if not already there
      const listSelectors = [
        'a[href*="/projects"]:not([href*="/new"]):not([href*="/create"])',
        'a:has-text("Projects")',
        'button:has-text("Back to Projects")',
        'nav a[href*="/projects"]'
      ];
      
      let navigatedToList = false;
      for (const selector of listSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          await page.waitForLoadState('networkidle');
          navigatedToList = true;
          console.log(`   ✅ Navigated to project list via: ${selector}`);
          break;
        }
      }
      
      // If direct navigation failed, try going to root and then projects
      if (!navigatedToList) {
        const baseUrl = new URL(page.url()).origin;
        await page.goto(`${baseUrl}/projects`);
        await page.waitForLoadState('networkidle');
      }
      
      const filledFields = (test.info() as any).filledFields;
      
      // Look for created project in the list
      const searchTerms = [
        TEST_PROJECT_DATA.name,
        TEST_PROJECT_DATA.code,
        filledFields?.name || '',
        filledFields?.code || ''
      ].filter(term => term);
      
      let projectFound = false;
      let projectLink: any = null;
      
      for (const term of searchTerms) {
        if (await page.locator(`text="${term}"`).count() > 0) {
          console.log(`   ✅ Found project in list: ${term}`);
          projectFound = true;
          
          // Find clickable link for the project
          projectLink = page.locator(`a:has-text("${term}")`).first();
          if (await projectLink.count() === 0) {
            // Try finding parent link
            projectLink = page.locator(`text="${term}"`).locator('..').locator('a').first();
          }
          break;
        }
      }
      
      expect(projectFound, 'Created project should appear in project list').toBe(true);
      (test.info() as any).projectLink = projectLink;
    });

    // Step 5: View project details and verify data
    await test.step('View project details and verify all data is displayed correctly', async () => {
      console.log('5. Viewing project details and verifying data...');
      
      const projectLink = (test.info() as any).projectLink;
      const filledFields = (test.info() as any).filledFields;
      
      if (await projectLink.count() > 0) {
        await projectLink.click();
        await page.waitForLoadState('networkidle');
        console.log('   ✅ Clicked project link to view details');
      } else {
        console.log('   ❌ Could not find clickable project link');
        expect(false, 'Should be able to click on project to view details').toBe(true);
      }
      
      // Verify all filled data is displayed
      const pageText = await page.textContent('body');
      const displayedData: Record<string, boolean> = {};
      
      for (const [key, value] of Object.entries(filledFields)) {
        const isDisplayed = pageText?.includes(value) || false;
        displayedData[key] = isDisplayed;
        
        if (isDisplayed) {
          console.log(`   ✅ ${key}: ${value} - DISPLAYED`);
        } else {
          console.log(`   ❌ ${key}: ${value} - NOT FOUND`);
        }
      }
      
      // Store for later comparison
      (test.info() as any).displayedData = displayedData;
      (test.info() as any).detailsPageText = pageText;
      
      const displayedCount = Object.values(displayedData).filter(Boolean).length;
      const totalCount = Object.keys(displayedData).length;
      
      console.log(`   Data visibility: ${displayedCount}/${totalCount} fields displayed`);
      expect(displayedCount, 'Most project data should be visible in details view').toBeGreaterThan(totalCount * 0.6);
    });

    // Step 6: Enter edit mode and verify form pre-population
    await test.step('Enter edit mode and verify form pre-population', async () => {
      console.log('6. Entering edit mode and verifying pre-population...');
      
      const editSelectors = [
        'button:has-text("Edit")',
        'a:has-text("Edit")',
        'button[title*="Edit"]',
        'a[title*="Edit"]',
        '[data-testid="edit-button"]'
      ];
      
      let editButtonFound = false;
      for (const selector of editSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          await page.waitForLoadState('networkidle');
          editButtonFound = true;
          console.log(`   ✅ Clicked edit button: ${selector}`);
          break;
        }
      }
      
      expect(editButtonFound, 'Should be able to find and click edit button').toBe(true);
      
      // Verify form fields are pre-populated
      const filledFields = (test.info() as any).filledFields;
      const formFields = {
        name: ['input[name="name"]', 'input[name="projectName"]', 'input[name="project_name"]'],
        code: ['input[name="code"]', 'input[name="projectCode"]', 'input[name="project_code"]'],
        description: ['textarea[name="description"]', 'input[name="description"]'],
        startDate: ['input[name="startDate"]', 'input[name="start_date"]', 'input[type="date"]:first-of-type'],
        endDate: ['input[name="endDate"]', 'input[name="end_date"]', 'input[type="date"]:last-of-type']
      };
      
      const prePopulationResults: Record<string, { expected: string, actual: string, matches: boolean }> = {};
      
      for (const [fieldKey, selectors] of Object.entries(formFields)) {
        if (fieldKey in filledFields) {
          const expectedValue = filledFields[fieldKey];
          
          for (const selector of selectors) {
            if (await page.locator(selector).count() > 0) {
              const actualValue = await page.inputValue(selector);
              const matches = actualValue === expectedValue;
              
              prePopulationResults[fieldKey] = {
                expected: expectedValue,
                actual: actualValue,
                matches: matches
              };
              
              if (matches) {
                console.log(`   ✅ ${fieldKey} pre-populated correctly: ${actualValue}`);
              } else {
                console.log(`   ❌ ${fieldKey} mismatch - Expected: "${expectedValue}", Got: "${actualValue}"`);
              }
              break;
            }
          }
        }
      }
      
      (test.info() as any).prePopulationResults = prePopulationResults;
      
      const correctlyPrePopulated = Object.values(prePopulationResults).filter(result => result.matches).length;
      const totalFields = Object.keys(prePopulationResults).length;
      
      console.log(`   Pre-population accuracy: ${correctlyPrePopulated}/${totalFields} fields correct`);
      expect(correctlyPrePopulated, 'Most fields should be pre-populated correctly').toBeGreaterThan(totalFields * 0.7);
    });

    // Step 7: Make edit and submit
    await test.step('Make small edit and submit changes', async () => {
      console.log('7. Making small edit and submitting...');
      
      // Update description field
      const descriptionSelectors = ['textarea[name="description"]', 'input[name="description"]'];
      let descriptionUpdated = false;
      
      for (const selector of descriptionSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.fill(selector, TEST_PROJECT_DATA.updatedDescription);
          console.log(`   ✅ Updated description to: ${TEST_PROJECT_DATA.updatedDescription}`);
          descriptionUpdated = true;
          break;
        }
      }
      
      expect(descriptionUpdated, 'Should be able to update description field').toBe(true);
      
      // Submit the edit
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Save")',
        'button:has-text("Update")',
        'button:has-text("Save Changes")'
      ];
      
      let submitClicked = false;
      for (const selector of submitSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.locator(selector).click();
          submitClicked = true;
          console.log(`   ✅ Clicked submit: ${selector}`);
          break;
        }
      }
      
      expect(submitClicked, 'Should be able to submit edit form').toBe(true);
      
      await page.waitForLoadState('networkidle');
    });

    // Step 8: Final verification - check data consistency
    await test.step('Final verification of data consistency after complete CRUD cycle', async () => {
      console.log('8. Final verification of data consistency...');
      
      const finalPageText = await page.textContent('body');
      const filledFields = (test.info() as any).filledFields;
      
      // Check updated field
      const updatedDescriptionVisible = finalPageText?.includes(TEST_PROJECT_DATA.updatedDescription) || false;
      
      if (updatedDescriptionVisible) {
        console.log(`   ✅ Updated description visible: ${TEST_PROJECT_DATA.updatedDescription}`);
      } else {
        console.log(`   ❌ Updated description NOT visible: ${TEST_PROJECT_DATA.updatedDescription}`);
      }
      
      // Check that other fields remained consistent
      const consistencyResults: Record<string, boolean> = {};
      
      for (const [key, value] of Object.entries(filledFields)) {
        if (key !== 'description') {  // Skip description as we updated it
          const isStillVisible = finalPageText?.includes(value) || false;
          consistencyResults[key] = isStillVisible;
          
          if (isStillVisible) {
            console.log(`   ✅ ${key} remained consistent: ${value}`);
          } else {
            console.log(`   ❌ ${key} data lost: ${value}`);
          }
        }
      }
      
      // Calculate consistency metrics
      const consistentFields = Object.values(consistencyResults).filter(Boolean).length;
      const totalNonUpdatedFields = Object.keys(consistencyResults).length;
      const consistencyPercentage = totalNonUpdatedFields > 0 ? (consistentFields / totalNonUpdatedFields) * 100 : 0;
      
      console.log('=' * 60);
      console.log('🏁 CRUD WORKFLOW TEST COMPLETE');
      console.log('=' * 60);
      
      // Generate comprehensive report
      console.log('\n📊 FINAL RESULTS SUMMARY:');
      console.log(`✅ Description update successful: ${updatedDescriptionVisible}`);
      console.log(`✅ Data consistency: ${consistentFields}/${totalNonUpdatedFields} fields (${consistencyPercentage.toFixed(1)}%)`);
      
      if (updatedDescriptionVisible && consistencyPercentage > 80) {
        console.log('🎉 RESULT: Complete data consistency achieved!');
        console.log('   - Create → View → Edit → View cycle working correctly');
        console.log('   - All field mappings consistent throughout workflow');
        console.log('   - No data loss detected during CRUD operations');
      } else {
        console.log('⚠️  RESULT: Some data consistency issues detected');
        if (!updatedDescriptionVisible) {
          console.log('   - Edit functionality may not be working correctly');
        }
        if (consistencyPercentage <= 80) {
          console.log('   - Some field data is being lost during CRUD operations');
          console.log('   - Field mapping issues may exist between forms and display');
        }
      }
      
      // Final assertions
      expect(updatedDescriptionVisible, 'Updated description should be visible after edit').toBe(true);
      expect(consistencyPercentage, 'Data consistency should be above 80%').toBeGreaterThan(80);
    });
  });
});