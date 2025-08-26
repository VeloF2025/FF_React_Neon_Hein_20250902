// 🟢 WORKING: WorkflowAssignmentModal component - modal for assigning workflow templates to projects
import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Calendar,
  User,
  Users,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';

import type { 
  WorkflowTemplate, 
  CreateProjectWorkflowRequest,
  Project,
  StaffMember
} from '../../types/workflow.types';

interface WorkflowAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
  templates: WorkflowTemplate[];
  onAssign: (workflowData: CreateProjectWorkflowRequest) => void;
}

// Mock data - in real implementation, these would come from API
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Fiber Installation - Downtown',
    description: 'High-priority fiber installation project',
    status: 'active',
    clientId: 'client-1',
    projectManagerId: 'pm-1',
    startDate: '2024-01-15',
    endDate: '2024-06-30'
  },
  {
    id: '2', 
    name: 'Network Upgrade - Residential Area',
    description: 'Upgrading existing network infrastructure',
    status: 'planning',
    clientId: 'client-2',
    projectManagerId: 'pm-2',
    startDate: '2024-02-01',
    endDate: '2024-08-15'
  }
];

const mockStaffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    department: 'Engineering',
    position: 'Project Manager'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    department: 'Engineering', 
    position: 'Senior Engineer'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    department: 'Installation',
    position: 'Lead Technician'
  }
];

export function WorkflowAssignmentModal({ 
  isOpen, 
  onClose, 
  projectId, 
  templates, 
  onAssign 
}: WorkflowAssignmentModalProps) {
  const [step, setStep] = useState<'project' | 'template' | 'details'>('project');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [workflowName, setWorkflowName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (projectId) {
        const project = mockProjects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          setStep('template');
        }
      } else {
        setStep('project');
      }
    } else {
      // Reset form when modal closes
      setStep('project');
      setSelectedProject(null);
      setSelectedTemplate(null);
      setWorkflowName('');
      setStartDate('');
      setEndDate('');
      setAssignedTo('');
      setTeamMembers([]);
      setNotes('');
      setSearchTerm('');
    }
  }, [isOpen, projectId]);

  useEffect(() => {
    if (selectedProject && selectedTemplate) {
      setWorkflowName(`${selectedTemplate.name} - ${selectedProject.name}`);
      setStartDate(selectedProject.startDate);
      setEndDate(selectedProject.endDate);
    }
  }, [selectedProject, selectedTemplate]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setStep('template');
  };

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setStep('details');
  };

  const handleAssign = () => {
    if (!selectedProject || !selectedTemplate) return;

    const workflowData: CreateProjectWorkflowRequest = {
      projectId: selectedProject.id,
      workflowTemplateId: selectedTemplate.id,
      name: workflowName,
      startDate: startDate || undefined,
      plannedEndDate: endDate || undefined,
      assignedTo: assignedTo || undefined,
      teamMembers: teamMembers,
      notes: notes || undefined
    };

    onAssign(workflowData);
  };

  const toggleTeamMember = (memberId: string) => {
    setTeamMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 'project':
        return selectedProject !== null;
      case 'template':
        return selectedTemplate !== null;
      case 'details':
        return workflowName.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Assign Workflow to Project
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a project and template to create a new workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-4 mb-8">
            <div className={`flex items-center space-x-2 ${
              step === 'project' ? 'text-green-600' : selectedProject ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedProject ? 'bg-green-600 text-white' : step === 'project' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Select Project</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />
            <div className={`flex items-center space-x-2 ${
              step === 'template' ? 'text-green-600' : selectedTemplate ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedTemplate ? 'bg-green-600 text-white' : step === 'template' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Choose Template</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />
            <div className={`flex items-center space-x-2 ${
              step === 'details' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'details' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Configure Details</span>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-96">
            {/* Step 1: Select Project */}
            {step === 'project' && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedProject?.id === project.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {project.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Status: {project.status}</span>
                            <span>Duration: {project.startDate} - {project.endDate}</span>
                          </div>
                        </div>
                        {selectedProject?.id === project.id && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Template */}
            {step === 'template' && (
              <div>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center space-x-3 mt-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              template.category === 'project' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                              {template.category}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {template.phases?.length || 0} phases
                            </span>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Configure Details */}
            {step === 'details' && selectedProject && selectedTemplate && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Enter workflow name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Planned End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assign To
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select project manager</option>
                      {mockStaffMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Additional notes or requirements..."
                    />
                  </div>
                </div>

                {/* Right Column - Team & Summary */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Members
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-2">
                      {mockStaffMembers.map(member => (
                        <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teamMembers.includes(member.id)}
                            onChange={() => toggleTeamMember(member.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {member.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {member.position}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Assignment Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Project:</span>
                        <span className="text-gray-900 dark:text-gray-100">{selectedProject.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Template:</span>
                        <span className="text-gray-900 dark:text-gray-100">{selectedTemplate.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phases:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {selectedTemplate.phases?.length || 0} phases
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Team Size:</span>
                        <span className="text-gray-900 dark:text-gray-100">{teamMembers.length} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {step !== 'project' && (
                <button
                  onClick={() => {
                    if (step === 'details') setStep('template');
                    else if (step === 'template') setStep('project');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {step === 'details' ? (
                <button
                  onClick={handleAssign}
                  disabled={!canProceed()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Create Workflow
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step === 'project') setStep('template');
                    else if (step === 'template') setStep('details');
                  }}
                  disabled={!canProceed()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}