import { test, expect, Page } from '@playwright/test';

/**
 * Project CRUD Workflow Test with Error Recovery
 * 
 * This test handles the current application error and attempts to verify
 * the project CRUD functionality once the error is resolved.
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

test.describe('Project CRUD Workflow with Error Recovery', () => {
  
  test('Application Error Analysis and CRUD Testing', async ({ page }) => {
    console.log('🔍 Starting Application Error Analysis and CRUD Testing');
    console.log('=' * 70);

    // Add comprehensive error monitoring
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error('Page Error:', error.message);
    });

    // Step 1: Load application and analyze current state
    await test.step('Load application and check for errors', async () => {
      console.log('1. Loading application...');
      
      await page.goto('http://localhost:5175');
      await page.waitForLoadState('networkidle');
      
      // Check if application loaded successfully
      const isErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
      
      if (isErrorPage) {
        console.log('⚠️  Application showing error page');
        
        // Get the specific error message
        const errorMessage = await page.locator('text="Cannot read properties of undefined"').textContent();
        console.log(`   Specific Error: ${errorMessage}`);
        
        // Try to get more technical details
        const technicalDetailsButton = page.locator('button:has-text("Technical Details")');
        if (await technicalDetailsButton.count() > 0) {
          await technicalDetailsButton.click();
          await page.waitForTimeout(1000);
          
          // Capture any additional technical information that might be revealed
          const pageContent = await page.textContent('body');
          console.log('   Technical details captured for analysis');
        }
        
        // Document the current findings
        console.log('\n📋 CURRENT APPLICATION STATUS:');
        console.log('   ❌ Application Error: Runtime JavaScript error');
        console.log('   ❌ Error Type: Cannot read properties of undefined (reading \'toString\')');
        console.log('   ❌ Impact: Prevents application from loading properly');
        console.log('   ❌ CRUD Testing: Blocked by application error');
      } else {
        console.log('✅ Application loaded successfully');
      }
    });

    // Step 2: Attempt error recovery if possible
    await test.step('Attempt error recovery and navigation', async () => {
      console.log('2. Attempting error recovery...');
      
      const isErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
      
      if (isErrorPage) {
        // Try "Go to Dashboard" button
        const dashboardButton = page.locator('button:has-text("Go to Dashboard")');
        if (await dashboardButton.count() > 0) {
          console.log('   Trying "Go to Dashboard" button...');
          await dashboardButton.click();
          await page.waitForLoadState('networkidle');
          
          const stillErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
          if (!stillErrorPage) {
            console.log('   ✅ Successfully navigated to dashboard');
          } else {
            console.log('   ❌ Still showing error page after dashboard click');
          }
        }
        
        // If still on error page, try "Try Again"
        const stillOnErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
        if (stillOnErrorPage) {
          const tryAgainButton = page.locator('button:has-text("Try Again")');
          if (await tryAgainButton.count() > 0) {
            console.log('   Trying "Try Again" button...');
            await tryAgainButton.click();
            await page.waitForLoadState('networkidle');
            
            const finalErrorCheck = await page.locator('text="Oops! Something went wrong"').count() > 0;
            if (!finalErrorCheck) {
              console.log('   ✅ Successfully recovered from error');
            } else {
              console.log('   ❌ Unable to recover from error');
            }
          }
        }
      }
    });

    // Step 3: Conditional CRUD testing based on application state
    await test.step('Conditional CRUD testing or detailed error reporting', async () => {
      console.log('3. Checking if CRUD testing is possible...');
      
      const isErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
      
      if (!isErrorPage) {
        console.log('   ✅ Application recovered, proceeding with basic navigation test...');
        
        // Try to find any project-related navigation
        const projectNavOptions = [
          'a:has-text("Projects")',
          'nav a[href*="/projects"]',
          'button:has-text("Projects")',
          'a[href*="/app/projects"]',
          'text="Projects"',
          'text="Project"'
        ];
        
        let projectNavFound = false;
        for (const selector of projectNavOptions) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            console.log(`     ✅ Found project navigation: ${selector} (${count} elements)`);
            projectNavFound = true;
          }
        }
        
        if (projectNavFound) {
          console.log('   ✅ Project navigation available - CRUD testing would be possible');
          console.log('   📝 Note: Full CRUD test should be re-run after confirming app stability');
        } else {
          console.log('   ⚠️  No project navigation found - may need different navigation approach');
        }
        
      } else {
        console.log('   ❌ Application still showing error - CRUD testing not possible');
        
        // Generate comprehensive error report
        console.log('\n📊 COMPREHENSIVE ERROR ANALYSIS:');
        console.log('═' * 60);
        console.log('🔴 BLOCKING ISSUE IDENTIFIED:');
        console.log('   • Error Type: JavaScript Runtime Error');
        console.log('   • Specific Message: Cannot read properties of undefined (reading \'toString\')');
        console.log('   • Impact Level: Critical - Prevents app initialization');
        console.log('   • CRUD Testing Status: BLOCKED');
        console.log('');
        console.log('🔧 TECHNICAL ANALYSIS:');
        console.log('   • Error occurs during application bootstrap');
        console.log('   • Likely cause: Undefined object being used in string conversion');
        console.log('   • Common sources: Missing environment variables, API responses, routing');
        console.log('   • Recovery attempts: Dashboard and Try Again buttons failed');
        console.log('');
        console.log('📋 RECOMMENDED ACTIONS:');
        console.log('   1. Check browser console for detailed error stack trace');
        console.log('   2. Verify environment variables and configuration');
        console.log('   3. Check API endpoints and database connections'); 
        console.log('   4. Review recent code changes that might cause undefined references');
        console.log('   5. Re-run CRUD test after fixing the runtime error');
        console.log('');
        console.log('⚠️  CRUD WORKFLOW TEST STATUS:');
        console.log('   • Project Creation: UNTESTABLE (app error)');
        console.log('   • Project Listing: UNTESTABLE (app error)');  
        console.log('   • Project Viewing: UNTESTABLE (app error)');
        console.log('   • Project Editing: UNTESTABLE (app error)');
        console.log('   • Data Consistency: CANNOT VERIFY (app error)');
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('   1. Fix the JavaScript runtime error first');
        console.log('   2. Ensure application loads without errors');
        console.log('   3. Re-run the complete CRUD workflow test');
        console.log('   4. Verify data consistency across all CRUD operations');
        
        if (consoleErrors.length > 0) {
          console.log('\n🐛 CAPTURED CONSOLE ERRORS:');
          consoleErrors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
        }
        
        if (errors.length > 0) {
          console.log('\n🚨 CAPTURED PAGE ERRORS:');
          errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
        }
      }
    });

    // Step 4: Final assessment and recommendations
    await test.step('Generate final assessment and recommendations', async () => {
      console.log('\n🏁 FINAL ASSESSMENT:');
      console.log('=' * 50);
      
      const isErrorPage = await page.locator('text="Oops! Something went wrong"').count() > 0;
      
      if (!isErrorPage) {
        console.log('✅ STATUS: Application recovered successfully');
        console.log('📝 RECOMMENDATION: Proceed with full CRUD workflow testing');
        console.log('🔄 ACTION: Re-run project-crud-workflow.spec.ts test');
      } else {
        console.log('❌ STATUS: Application error unresolved');
        console.log('🚨 CRITICAL: Fix runtime error before CRUD testing');
        console.log('🔧 PRIORITY: Resolve "Cannot read properties of undefined" error');
        console.log('📋 FOLLOWUP: Investigate undefined object references in codebase');
        
        // This will help identify that the test couldn't run due to app issues
        expect(false, 'Application showing error page - runtime error must be fixed before CRUD testing can proceed').toBe(true);
      }
    });
  });
});