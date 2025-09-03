/**
 * ProjectCRUDTest Component
 * 
 * Test component to verify the unified project CRUD system.
 * Ensures data consistency across create, view, and edit operations.
 */

import React, { useState } from 'react';
import { useProjectCRUD } from '@/hooks/useProjectCRUD';
import { ProjectFormData, ProjectType, ProjectStatus, ProjectPriority } from '@/services/project';

export const ProjectCRUDTest: React.FC = () => {
  const {
    projects,
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    refreshProjects,
    clearError
  } = useProjectCRUD();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };
  
  /**
   * Test 1: Create a project and verify all fields are saved
   */
  const testCreate = async () => {
    addTestResult('🔄 Starting CREATE test...');
    
    const testData: ProjectFormData = {
      name: `Test Project ${Date.now()}`,
      code: `TEST-${Date.now()}`,
      type: ProjectType.FIBRE,
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
      clientId: 'test-client-id',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      description: 'This is a test project for CRUD consistency',
      budget: 100000,
      currency: 'ZAR',
      contractNumber: 'CONTRACT-001',
      sowNumber: 'SOW-001',
      tags: ['test', 'crud', 'consistency']
    };
    
    try {
      const created = await createProject(testData);
      setCreatedProjectId(created.id);
      
      // Verify all fields match
      const checks = [
        created.name === testData.name ? '✅' : '❌',
        created.code === testData.code ? '✅' : '❌',
        created.type === testData.type ? '✅' : '❌',
        created.status === testData.status ? '✅' : '❌',
        created.priority === testData.priority ? '✅' : '❌',
        created.clientId === testData.clientId ? '✅' : '❌',
        created.startDate === testData.startDate ? '✅' : '❌',
        created.endDate === testData.endDate ? '✅' : '❌',
        created.description === testData.description ? '✅' : '❌',
        created.budget === testData.budget ? '✅' : '❌',
        created.currency === testData.currency ? '✅' : '❌',
        created.contractNumber === testData.contractNumber ? '✅' : '❌',
        created.sowNumber === testData.sowNumber ? '✅' : '❌'
      ];
      
      const allPassed = checks.every(c => c === '✅');
      
      addTestResult(`${allPassed ? '✅' : '❌'} CREATE Test: Project created with ID ${created.id}`);
      addTestResult(`  Name: ${checks[0]} ${created.name}`);
      addTestResult(`  Code: ${checks[1]} ${created.code}`);
      addTestResult(`  Type: ${checks[2]} ${created.type}`);
      addTestResult(`  Status: ${checks[3]} ${created.status}`);
      addTestResult(`  Priority: ${checks[4]} ${created.priority}`);
      addTestResult(`  Budget: ${checks[9]} ${created.budget}`);
      
      return created.id;
    } catch (err) {
      addTestResult(`❌ CREATE Test Failed: ${err}`);
      return null;
    }
  };
  
  /**
   * Test 2: Read the created project and verify data matches
   */
  const testRead = async (projectId: string) => {
    addTestResult('🔄 Starting READ test...');
    
    try {
      const fetched = await getProject(projectId);
      
      if (!fetched) {
        addTestResult('❌ READ Test Failed: Project not found');
        return false;
      }
      
      // Compare with current project (should be same after create)
      const matches = currentProject && 
        fetched.id === currentProject.id &&
        fetched.name === currentProject.name &&
        fetched.code === currentProject.code &&
        fetched.type === currentProject.type &&
        fetched.status === currentProject.status &&
        fetched.budget === currentProject.budget;
      
      addTestResult(`${matches ? '✅' : '❌'} READ Test: Data consistency ${matches ? 'verified' : 'failed'}`);
      addTestResult(`  Retrieved: ${fetched.name} (${fetched.code})`);
      
      return matches;
    } catch (err) {
      addTestResult(`❌ READ Test Failed: ${err}`);
      return false;
    }
  };
  
  /**
   * Test 3: Update the project and verify changes persist
   */
  const testUpdate = async (projectId: string) => {
    addTestResult('🔄 Starting UPDATE test...');
    
    const updateData: Partial<ProjectFormData> = {
      name: `Updated Test Project ${Date.now()}`,
      status: ProjectStatus.COMPLETED,
      budget: 150000,
      description: 'Updated description for consistency test'
    };
    
    try {
      const updated = await updateProject(projectId, updateData);
      
      // Verify updates were applied
      const checks = [
        updated.name === updateData.name ? '✅' : '❌',
        updated.status === updateData.status ? '✅' : '❌',
        updated.budget === updateData.budget ? '✅' : '❌',
        updated.description === updateData.description ? '✅' : '❌'
      ];
      
      const allPassed = checks.every(c => c === '✅');
      
      addTestResult(`${allPassed ? '✅' : '❌'} UPDATE Test: Changes ${allPassed ? 'persisted' : 'failed'}`);
      addTestResult(`  Name: ${checks[0]} ${updated.name}`);
      addTestResult(`  Status: ${checks[1]} ${updated.status}`);
      addTestResult(`  Budget: ${checks[2]} ${updated.budget}`);
      
      // Re-read to verify persistence
      const reRead = await getProject(projectId);
      const persistenceCheck = reRead && 
        reRead.name === updateData.name &&
        reRead.status === updateData.status &&
        reRead.budget === updateData.budget;
      
      addTestResult(`${persistenceCheck ? '✅' : '❌'} PERSISTENCE Test: Data ${persistenceCheck ? 'consistent after re-read' : 'inconsistent'}`);
      
      return allPassed && persistenceCheck;
    } catch (err) {
      addTestResult(`❌ UPDATE Test Failed: ${err}`);
      return false;
    }
  };
  
  /**
   * Test 4: Delete the project
   */
  const testDelete = async (projectId: string) => {
    addTestResult('🔄 Starting DELETE test...');
    
    try {
      const deleted = await deleteProject(projectId);
      
      if (deleted) {
        // Verify it's gone
        const shouldBeNull = await getProject(projectId);
        const isDeleted = shouldBeNull === null;
        
        addTestResult(`${isDeleted ? '✅' : '❌'} DELETE Test: Project ${isDeleted ? 'successfully deleted' : 'still exists'}`);
        return isDeleted;
      } else {
        addTestResult('❌ DELETE Test Failed: Delete operation returned false');
        return false;
      }
    } catch (err) {
      addTestResult(`❌ DELETE Test Failed: ${err}`);
      return false;
    }
  };
  
  /**
   * Run all tests in sequence
   */
  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('🚀 Starting CRUD Consistency Tests...');
    
    // Test 1: Create
    const projectId = await testCreate();
    if (!projectId) {
      addTestResult('⛔ Tests aborted: Could not create project');
      return;
    }
    
    // Wait a bit for data to settle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Read
    const readSuccess = await testRead(projectId);
    
    // Test 3: Update
    const updateSuccess = await testUpdate(projectId);
    
    // Test 4: Delete
    const deleteSuccess = await testDelete(projectId);
    
    // Summary
    addTestResult('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (readSuccess && updateSuccess && deleteSuccess) {
      addTestResult('✅ ALL TESTS PASSED - Data consistency verified!');
    } else {
      addTestResult('❌ SOME TESTS FAILED - Check data consistency implementation');
    }
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Project CRUD Consistency Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={refreshProjects}
            disabled={loading}
            className="ml-4 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            Refresh Projects
          </button>
          
          {error && (
            <button
              onClick={clearError}
              className="ml-4 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Error
            </button>
          )}
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
            <h3 className="font-bold text-red-700">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {testResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Test Results:</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Current Project:</h2>
            {currentProject ? (
              <div className="bg-gray-50 p-4 rounded">
                <p><strong>ID:</strong> {currentProject.id}</p>
                <p><strong>Name:</strong> {currentProject.name}</p>
                <p><strong>Code:</strong> {currentProject.code}</p>
                <p><strong>Type:</strong> {currentProject.type}</p>
                <p><strong>Status:</strong> {currentProject.status}</p>
                <p><strong>Priority:</strong> {currentProject.priority}</p>
                <p><strong>Budget:</strong> {currentProject.budget} {currentProject.currency}</p>
                <p><strong>Progress:</strong> {currentProject.progressPercentage}%</p>
              </div>
            ) : (
              <p className="text-gray-500">No project selected</p>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">All Projects ({projects.length}):</h2>
            <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
              {projects.length > 0 ? (
                <ul className="space-y-2">
                  {projects.map(project => (
                    <li key={project.id} className="border-b pb-2">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-600">
                        {project.code} | {project.status} | {project.type}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No projects found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};