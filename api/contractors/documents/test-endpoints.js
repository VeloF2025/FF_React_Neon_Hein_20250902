/**
 * Test Script for Contractor Document Approval Workflow API Endpoints
 * 
 * This script tests all the API endpoints to ensure they work correctly
 * Run with: node api/contractors/documents/test-endpoints.js
 */

const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';

/**
 * Test helper function for making HTTP requests
 */
async function makeRequest(method, endpoint, data = null) {
  const url = `${baseURL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    console.error(`❌ Request failed for ${method} ${endpoint}:`, error.message);
    return {
      status: 500,
      ok: false,
      data: { success: false, error: error.message }
    };
  }
}

/**
 * Test the approval workflow endpoints
 */
async function testApprovalWorkflowEndpoints() {
  console.log('\n🧪 TESTING APPROVAL WORKFLOW ENDPOINTS');
  console.log('='.repeat(50));

  // Test data
  const testDocumentId = '550e8400-e29b-41d4-a716-446655440000'; // Mock UUID
  const testWorkflowId = '550e8400-e29b-41d4-a716-446655440001'; // Mock UUID
  const testApproverUserId = 'compliance-officer-1';

  // TEST 1: POST - Initiate Workflow
  console.log('\n📝 Test 1: POST /contractors/documents/approval-workflow (Initiate Workflow)');
  const initiateData = {
    documentId: testDocumentId,
    documentType: 'insurance_certificate',
    priorityLevel: 'high',
    customSlaHours: 48
  };

  const initiateResponse = await makeRequest('POST', '/contractors/documents/approval-workflow', initiateData);
  console.log(`Status: ${initiateResponse.status}`);
  console.log(`Response:`, JSON.stringify(initiateResponse.data, null, 2));

  if (initiateResponse.ok && initiateResponse.data.success) {
    console.log('✅ Initiate workflow test: PASSED');
  } else {
    console.log('❌ Initiate workflow test: FAILED');
  }

  // TEST 2: PUT - Process Approval (using mock workflow ID)
  console.log('\n🔄 Test 2: PUT /contractors/documents/approval-workflow (Process Approval)');
  const processData = {
    workflowId: testWorkflowId,
    approverUserId: testApproverUserId,
    decision: 'approve',
    comments: 'Document looks good, approved for next stage',
    timeSpentMinutes: 15
  };

  const processResponse = await makeRequest('PUT', '/contractors/documents/approval-workflow', processData);
  console.log(`Status: ${processResponse.status}`);
  console.log(`Response:`, JSON.stringify(processResponse.data, null, 2));

  if (processResponse.status === 404) {
    console.log('✅ Process approval test: PASSED (Expected 404 for mock workflow ID)');
  } else if (processResponse.ok && processResponse.data.success) {
    console.log('✅ Process approval test: PASSED');
  } else {
    console.log('❌ Process approval test: FAILED');
  }

  // TEST 3: GET - Get Workflow Status
  console.log('\n📊 Test 3: GET /contractors/documents/approval-workflow (Get Status)');
  const statusResponse = await makeRequest('GET', `/contractors/documents/approval-workflow?workflowId=${testWorkflowId}&includeHistory=true`);
  console.log(`Status: ${statusResponse.status}`);
  console.log(`Response:`, JSON.stringify(statusResponse.data, null, 2));

  if (statusResponse.status === 404) {
    console.log('✅ Get workflow status test: PASSED (Expected 404 for mock workflow ID)');
  } else if (statusResponse.ok && statusResponse.data.success) {
    console.log('✅ Get workflow status test: PASSED');
  } else {
    console.log('❌ Get workflow status test: FAILED');
  }

  // TEST 4: DELETE - Cancel Workflow
  console.log('\n🚫 Test 4: DELETE /contractors/documents/approval-workflow (Cancel Workflow)');
  const cancelData = {
    workflowId: testWorkflowId,
    adminUserId: 'admin-001',
    cancelReason: 'Test cancellation - document no longer needed'
  };

  const cancelResponse = await makeRequest('DELETE', '/contractors/documents/approval-workflow', cancelData);
  console.log(`Status: ${cancelResponse.status}`);
  console.log(`Response:`, JSON.stringify(cancelResponse.data, null, 2));

  if (cancelResponse.status === 404) {
    console.log('✅ Cancel workflow test: PASSED (Expected 404 for mock workflow ID)');
  } else if (cancelResponse.ok && cancelResponse.data.success) {
    console.log('✅ Cancel workflow test: PASSED');
  } else {
    console.log('❌ Cancel workflow test: FAILED');
  }
}

/**
 * Test the approval queue endpoint
 */
async function testApprovalQueueEndpoint() {
  console.log('\n🗂️  TESTING APPROVAL QUEUE ENDPOINT');
  console.log('='.repeat(50));

  const testApproverUserId = 'compliance-officer-1';

  // TEST 1: GET - Get Approval Queue for Specific Approver
  console.log('\n📋 Test 1: GET /contractors/documents/approval-queue (Specific Approver)');
  const queueResponse = await makeRequest('GET', `/contractors/documents/approval-queue?approverUserId=${testApproverUserId}&priorityLevel=high&sortBy=priority&sortOrder=desc`);
  console.log(`Status: ${queueResponse.status}`);
  console.log(`Response:`, JSON.stringify(queueResponse.data, null, 2));

  if (queueResponse.ok && queueResponse.data.success) {
    console.log('✅ Get approval queue test: PASSED');
  } else {
    console.log('❌ Get approval queue test: FAILED');
  }

  // TEST 2: GET - Get Admin Queue (all items)
  console.log('\n🔧 Test 2: GET /contractors/documents/approval-queue (Admin Access)');
  const adminQueueResponse = await makeRequest('GET', '/contractors/documents/approval-queue?isAdmin=true&overdue=true&limit=10&sortBy=due_date');
  console.log(`Status: ${adminQueueResponse.status}`);
  console.log(`Response:`, JSON.stringify(adminQueueResponse.data, null, 2));

  if (adminQueueResponse.ok && adminQueueResponse.data.success) {
    console.log('✅ Get admin queue test: PASSED');
  } else {
    console.log('❌ Get admin queue test: FAILED');
  }
}

/**
 * Test validation and error handling
 */
async function testValidationAndErrors() {
  console.log('\n🛡️  TESTING VALIDATION & ERROR HANDLING');
  console.log('='.repeat(50));

  // TEST 1: Invalid method
  console.log('\n🚫 Test 1: Invalid HTTP method');
  const invalidMethodResponse = await makeRequest('PATCH', '/contractors/documents/approval-workflow');
  console.log(`Status: ${invalidMethodResponse.status}`);
  console.log(`Response:`, JSON.stringify(invalidMethodResponse.data, null, 2));

  if (invalidMethodResponse.status === 405) {
    console.log('✅ Invalid method test: PASSED');
  } else {
    console.log('❌ Invalid method test: FAILED');
  }

  // TEST 2: Missing required fields
  console.log('\n📝 Test 2: Missing required fields in POST request');
  const missingFieldsResponse = await makeRequest('POST', '/contractors/documents/approval-workflow', {
    documentType: 'insurance' // Missing documentId
  });
  console.log(`Status: ${missingFieldsResponse.status}`);
  console.log(`Response:`, JSON.stringify(missingFieldsResponse.data, null, 2));

  if (missingFieldsResponse.status === 400) {
    console.log('✅ Missing required fields test: PASSED');
  } else {
    console.log('❌ Missing required fields test: FAILED');
  }

  // TEST 3: Invalid UUID format
  console.log('\n🔢 Test 3: Invalid UUID format');
  const invalidUuidResponse = await makeRequest('POST', '/contractors/documents/approval-workflow', {
    documentId: 'invalid-uuid',
    documentType: 'insurance'
  });
  console.log(`Status: ${invalidUuidResponse.status}`);
  console.log(`Response:`, JSON.stringify(invalidUuidResponse.data, null, 2));

  if (invalidUuidResponse.status === 400) {
    console.log('✅ Invalid UUID format test: PASSED');
  } else {
    console.log('❌ Invalid UUID format test: FAILED');
  }

  // TEST 4: Invalid priority level
  console.log('\n⚡ Test 4: Invalid priority level');
  const invalidPriorityResponse = await makeRequest('POST', '/contractors/documents/approval-workflow', {
    documentId: '550e8400-e29b-41d4-a716-446655440000',
    documentType: 'insurance',
    priorityLevel: 'super_urgent' // Invalid priority
  });
  console.log(`Status: ${invalidPriorityResponse.status}`);
  console.log(`Response:`, JSON.stringify(invalidPriorityResponse.data, null, 2));

  if (invalidPriorityResponse.status === 400) {
    console.log('✅ Invalid priority level test: PASSED');
  } else {
    console.log('❌ Invalid priority level test: FAILED');
  }

  // TEST 5: Missing approver for queue endpoint
  console.log('\n👤 Test 5: Missing approver for queue endpoint');
  const missingApproverResponse = await makeRequest('GET', '/contractors/documents/approval-queue?isAdmin=false');
  console.log(`Status: ${missingApproverResponse.status}`);
  console.log(`Response:`, JSON.stringify(missingApproverResponse.data, null, 2));

  if (missingApproverResponse.status === 400) {
    console.log('✅ Missing approver for queue test: PASSED');
  } else {
    console.log('❌ Missing approver for queue test: FAILED');
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 CONTRACTOR DOCUMENT APPROVAL WORKFLOW API TESTS');
  console.log('='.repeat(60));
  console.log(`🌐 Base URL: ${baseURL}`);
  console.log(`📅 Test Run: ${new Date().toISOString()}`);

  try {
    await testApprovalWorkflowEndpoints();
    await testApprovalQueueEndpoint();
    await testValidationAndErrors();

    console.log('\n🏁 TEST SUITE COMPLETED');
    console.log('='.repeat(60));
    console.log('✅ All tests completed. Check individual test results above.');
    console.log('\n📝 NOTE: Some tests expect 404 errors when using mock data.');
    console.log('🔧 For full integration testing, ensure database contains test data.');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  // Check if fetch is available (Node.js 18+ or with polyfill)
  if (typeof fetch === 'undefined') {
    console.log('⚠️  Warning: fetch is not available. Install node-fetch or use Node.js 18+');
    console.log('Run: npm install node-fetch');
    process.exit(1);
  }

  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testApprovalWorkflowEndpoints,
  testApprovalQueueEndpoint,
  testValidationAndErrors,
  makeRequest
};