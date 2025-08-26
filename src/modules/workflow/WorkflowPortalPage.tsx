// 🟢 WORKING: Main Workflow Portal with comprehensive tabbed navigation
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AlertCircle, GitBranch, Settings, ArrowLeft } from 'lucide-react';
import { WorkflowPortalProvider } from './context/WorkflowPortalContext';
import { WorkflowTabs } from './components/WorkflowTabs';
import { useWorkflowPortal } from './hooks/useWorkflowPortal';
import { TemplatesTab, EditorTab, ProjectsTab, AnalyticsTab } from './components/tabs';
import type { WorkflowTabId } from './types/portal.types';

interface WorkflowPortalPageProps {
  children?: React.ReactNode;
}

// Portal layout component
function WorkflowPortalLayout({ children }: WorkflowPortalPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    activeTab,
    isLoading,
    error,
    templateStats,
    setActiveTab,
    setError,
    refreshData
  } = useWorkflowPortal();

  // Handle tab changes from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab') as WorkflowTabId;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab, setActiveTab]);

  // Handle tab changes
  const handleTabChange = (tabId: WorkflowTabId) => {
    setActiveTab(tabId);
    
    // Update URL with tab parameter
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', tabId);
      return newParams;
    });
  };

  // Navigate back to settings
  const handleBackToSettings = () => {
    navigate('/settings?tab=workflow');
  };

  // Handle template edit navigation
  const handleTemplateEdit = (templateId: string) => {
    setActiveTab('editor');
    // TODO: Pass templateId to editor context
  };

  // Render active tab content
  const renderTabContent = () => {
    if (children) return children;

    switch (activeTab) {
      case 'templates':
        return <TemplatesTab onTemplateEdit={handleTemplateEdit} />;
      case 'editor':
        return <EditorTab />;
      case 'projects':
        return <ProjectsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <TemplatesTab onTemplateEdit={handleTemplateEdit} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Portal Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToSettings}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Back to Settings"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <GitBranch className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Workflow Portal</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage workflow templates and project assignments
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  {templateStats.totalTemplates} Templates
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {templateStats.activeTemplates} Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">
                  {templateStats.draftTemplates} Drafts
                </span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
              <button
                onClick={() => setError(undefined)}
                className="ml-auto text-red-600 hover:text-red-800 p-1"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <WorkflowTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !children ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
              <p className="text-gray-500">Loading workflow data...</p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
}

// Main portal page component with error boundary
export function WorkflowPortalPage({ children }: WorkflowPortalPageProps) {
  return (
    <div className="h-screen">
      <WorkflowPortalProvider>
        <WorkflowPortalLayout>
          {children}
        </WorkflowPortalLayout>
      </WorkflowPortalProvider>
    </div>
  );
}

export default WorkflowPortalPage;