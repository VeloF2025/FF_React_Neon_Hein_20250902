// 🟢 WORKING: ProjectWorkflowDetail component - detailed view of individual project workflow
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  MessageSquare,
  Edit2,
  Trash2
} from 'lucide-react';

import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowTimeline } from './WorkflowTimeline';
import { ExecutionLogs } from './ExecutionLogs';
import type { ProjectWorkflow } from '../../types/workflow.types';
import { formatDate } from '../../../../utils/dateHelpers';

interface ProjectWorkflowDetailProps {
  workflowId: string;
  onBack: () => void;
  onEdit?: (workflowId: string) => void;
  onDelete?: (workflowId: string) => void;
}

export function ProjectWorkflowDetail({
  workflowId,
  onBack,
  onEdit,
  onDelete
}: ProjectWorkflowDetailProps) {
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'logs' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflowDetail();
  }, [workflowId]);

  const loadWorkflowDetail = async () => {
    setLoading(true);
    try {
      // Mock workflow detail - in real implementation, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockWorkflow: ProjectWorkflow = {
        id: workflowId,
        projectId: 'proj-1',
        workflowTemplateId: 'template-1',
        name: 'Fiber Installation Workflow - Downtown Project',
        status: 'active',
        currentPhaseId: 'phase-2',
        progressPercentage: 35,
        startDate: '2024-01-15T00:00:00Z',
        plannedEndDate: '2024-06-30T00:00:00Z',
        assignedTo: 'user-1',
        teamMembers: ['user-1', 'user-2', 'user-3'],
        metrics: {
          phasesCompleted: 1,
          totalPhases: 4,
          stepsCompleted: 5,
          totalSteps: 16,
          avgPhaseCompletion: 85,
          riskLevel: 'low'
        },
        notes: 'High-priority downtown fiber installation project. Client requires completion by Q2 2024.',
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        project: {
          id: 'proj-1',
          name: 'Downtown Fiber Installation',
          description: 'Complete fiber infrastructure for downtown business district',
          status: 'active',
          clientId: 'client-1',
          projectManagerId: 'pm-1',
          startDate: '2024-01-15',
          endDate: '2024-06-30'
        },
        template: {
          id: 'template-1',
          name: 'Standard Fiber Installation',
          description: 'Standard workflow for fiber installation projects',
          category: 'project',
          type: 'default',
          status: 'active',
          version: '2.1',
          isDefault: true,
          isSystem: false,
          tags: ['fiber', 'installation', 'telecommunications'],
          metadata: {
            industry: 'telecommunications',
            complexity: 'medium',
            averageDuration: 120
          },
          createdBy: 'system',
          updatedBy: 'admin-1',
          createdAt: '2023-12-01T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
          phases: [
            {
              id: 'phase-1',
              workflowTemplateId: 'template-1',
              name: 'Site Survey & Planning',
              description: 'Initial site assessment and route planning',
              orderIndex: 0,
              color: '#3B82F6',
              icon: 'MapPin',
              estimatedDuration: 5,
              requiredRoles: ['surveyor', 'engineer'],
              dependencies: [],
              completionCriteria: ['Site survey completed', 'Route plan approved'],
              isOptional: false,
              isParallel: false,
              metadata: {},
              createdAt: '2023-12-01T00:00:00Z',
              updatedAt: '2023-12-01T00:00:00Z'
            },
            {
              id: 'phase-2',
              workflowTemplateId: 'template-1',
              name: 'Design & Engineering',
              description: 'Detailed design and engineering drawings',
              orderIndex: 1,
              color: '#10B981',
              icon: 'Drafting',
              estimatedDuration: 10,
              requiredRoles: ['engineer', 'designer'],
              dependencies: ['phase-1'],
              completionCriteria: ['Design drawings completed', 'Materials list finalized'],
              isOptional: false,
              isParallel: false,
              metadata: {},
              createdAt: '2023-12-01T00:00:00Z',
              updatedAt: '2023-12-01T00:00:00Z'
            }
          ]
        },
        assignedUser: {
          id: 'user-1',
          name: 'John Smith',
          email: 'john.smith@fibreflow.com',
          department: 'Engineering',
          position: 'Project Manager'
        }
      };
      
      setWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Error loading workflow detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusAction = (action: 'play' | 'pause' | 'complete') => {
    console.log(`${action} workflow:`, workflowId);
    // In real implementation, this would call API to update workflow status
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 animate-spin text-green-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading workflow details...</span>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Workflow Not Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The requested workflow could not be loaded.
        </p>
        <button
          onClick={onBack}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'active':
        return <Play className="w-5 h-5 text-green-600" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {workflow.name}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {workflow.project?.name} • {workflow.template?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            {workflow.status === 'active' && (
              <button
                onClick={() => handleStatusAction('pause')}
                className="flex items-center space-x-2 px-3 py-2 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-800/30 rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
            
            {workflow.status === 'paused' && (
              <button
                onClick={() => handleStatusAction('play')}
                className="flex items-center space-x-2 px-3 py-2 text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-800/30 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => onEdit(workflow.id)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
            
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Workflow Info Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {Math.round(workflow.progressPercentage || 0)}%
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {workflow.plannedEndDate ? formatDate(workflow.plannedEndDate) : 'TBD'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Assigned To</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {workflow.assignedUser?.name || 'Unassigned'}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Team Size</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {workflow.teamMembers.length}
            </p>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-6 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Calendar },
            { id: 'logs', label: 'Activity Log', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Progress Overview
                </h3>
                <WorkflowProgress workflow={workflow} compact={false} />
              </div>
              
              {/* Workflow Details */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Workflow Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Project</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {workflow.project?.name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Template</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {workflow.template?.name} v{workflow.template?.version}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Start Date</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {workflow.startDate ? formatDate(workflow.startDate) : 'Not started'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Current Phase</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {workflow.template?.phases?.find(p => p.id === workflow.currentPhaseId)?.name || 'N/A'}
                    </p>
                  </div>
                  
                  {workflow.notes && (
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Notes</label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {workflow.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="p-6">
            <WorkflowTimeline workflows={[workflow]} />
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="p-6">
            <ExecutionLogs workflowId={workflow.id} workflow={workflow} />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed workflow analytics and performance metrics will be available here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}