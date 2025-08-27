// Workflow editor forms for creating and editing phases, steps, and tasks
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useWorkflowEditor } from '../../../context/WorkflowEditorContext';
import { workflowManagementService } from '../../../services/WorkflowManagementService';
import type { StepType, TaskPriority } from '../../../types/workflow.types';

interface FormData {
  name: string;
  description: string;
  orderIndex: number;
  [key: string]: any;
}

export function WorkflowEditorForms() {
  const { state, stopEditingItem, loadTemplate } = useWorkflowEditor();
  const [formData, setFormData] = useState<FormData>({ name: '', description: '', orderIndex: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.editingItem) {
      // Pre-populate form with existing data when editing
      setFormData({
        name: state.editingItem.data?.name || '',
        description: state.editingItem.data?.description || '',
        orderIndex: state.editingItem.data?.orderIndex || 0,
        ...state.editingItem.data
      });
    }
  }, [state.editingItem]);

  if (!state.editingItem) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentTemplate) return;

    setLoading(true);
    setError(null);

    try {
      const isEditing = !!state.editingItem?.id;
      
      switch (state.editingItem?.type) {
        case 'phase':
          if (isEditing) {
            await workflowManagementService.updatePhase(state.editingItem?.id!, {
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              color: formData.color,
              estimatedDuration: formData.estimatedDuration,
              isOptional: formData.isOptional,
              isParallel: formData.isParallel
            });
          } else {
            await workflowManagementService.createPhase({
              workflowTemplateId: state.currentTemplate.id,
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              color: formData.color || '#3B82F6',
              estimatedDuration: formData.estimatedDuration,
              isOptional: formData.isOptional || false,
              isParallel: formData.isParallel || false
            });
          }
          break;

        case 'step':
          if (isEditing) {
            await workflowManagementService.updateStep(state.editingItem?.id!, {
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              stepType: formData.stepType,
              estimatedDuration: formData.estimatedDuration,
              assigneeRole: formData.assigneeRole,
              isRequired: formData.isRequired,
              isAutomated: formData.isAutomated
            });
          } else {
            await workflowManagementService.createStep({
              workflowPhaseId: state.editingItem?.parentId!,
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              stepType: formData.stepType || 'task',
              estimatedDuration: formData.estimatedDuration,
              assigneeRole: formData.assigneeRole,
              isRequired: formData.isRequired !== false,
              isAutomated: formData.isAutomated || false
            });
          }
          break;

        case 'task':
          if (isEditing) {
            await workflowManagementService.updateTask(state.editingItem?.id!, {
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              priority: formData.priority,
              estimatedHours: formData.estimatedHours,
              isOptional: formData.isOptional,
              canBeParallel: formData.canBeParallel
            });
          } else {
            await workflowManagementService.createTask({
              workflowStepId: state.editingItem?.parentId!,
              name: formData.name,
              description: formData.description,
              orderIndex: formData.orderIndex,
              priority: formData.priority || 'medium',
              estimatedHours: formData.estimatedHours,
              isOptional: formData.isOptional || false,
              canBeParallel: formData.canBeParallel || false
            });
          }
          break;
      }

      // Refresh workflow by reloading current template
      if (state.templateId) {
        await loadTemplate(state.templateId);
      }
      stopEditingItem();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const renderPhaseForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phase Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Planning Phase"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Color
          </label>
          <input
            type="color"
            value={formData.color || '#3B82F6'}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="Describe what happens in this phase..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Duration (days)
          </label>
          <input
            type="number"
            value={formData.estimatedDuration || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="1"
            placeholder="7"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Index
          </label>
          <input
            type="number"
            value={formData.orderIndex}
            onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isOptional || false}
            onChange={(e) => setFormData(prev => ({ ...prev, isOptional: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Optional Phase</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isParallel || false}
            onChange={(e) => setFormData(prev => ({ ...prev, isParallel: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Can run in parallel</span>
        </label>
      </div>
    </>
  );

  const renderStepForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Step Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Site Survey"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Step Type
          </label>
          <select
            value={formData.stepType || 'task'}
            onChange={(e) => setFormData(prev => ({ ...prev, stepType: e.target.value as StepType }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="task">Task</option>
            <option value="approval">Approval</option>
            <option value="review">Review</option>
            <option value="milestone">Milestone</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="Describe what needs to be done..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (hours)
          </label>
          <input
            type="number"
            value={formData.estimatedDuration || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="1"
            placeholder="8"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee Role
          </label>
          <input
            type="text"
            value={formData.assigneeRole || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, assigneeRole: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Index
          </label>
          <input
            type="number"
            value={formData.orderIndex}
            onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRequired !== false}
            onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Required Step</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isAutomated || false}
            onChange={(e) => setFormData(prev => ({ ...prev, isAutomated: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Automated</span>
        </label>
      </div>
    </>
  );

  const renderTaskForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Install equipment"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority || 'medium'}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          placeholder="Detailed task description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Hours
          </label>
          <input
            type="number"
            value={formData.estimatedHours || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="0.5"
            step="0.5"
            placeholder="2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Index
          </label>
          <input
            type="number"
            value={formData.orderIndex}
            onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            min="0"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isOptional || false}
            onChange={(e) => setFormData(prev => ({ ...prev, isOptional: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Optional Task</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.canBeParallel || false}
            onChange={(e) => setFormData(prev => ({ ...prev, canBeParallel: e.target.checked }))}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Can run in parallel</span>
        </label>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {state.editingItem.id ? 'Edit' : 'Create'} {state.editingItem.type.charAt(0).toUpperCase() + state.editingItem.type.slice(1)}
            </h2>
            <button
              type="button"
              onClick={stopEditingItem}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
              </div>
            </div>
          )}

          {state.editingItem.type === 'phase' && renderPhaseForm()}
          {state.editingItem.type === 'step' && renderStepForm()}
          {state.editingItem.type === 'task' && renderTaskForm()}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={stopEditingItem}
              disabled={loading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {state.editingItem.id ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkflowEditorForms;