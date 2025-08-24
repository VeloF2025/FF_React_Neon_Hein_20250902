import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DepartmentConfig } from '@/types/staff-hierarchy.types';

interface DepartmentsTabProps {
  departments: DepartmentConfig[];
  onAdd: () => void;
  onEdit: (department: DepartmentConfig) => void;
  onDelete: (id: string) => void;
  onInitialize: () => void;
}

export function DepartmentsTab({ departments, onAdd, onEdit, onDelete, onInitialize }: DepartmentsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Department Management</h2>
        <div className="space-x-2">
          {departments.length === 0 && (
            <button
              onClick={onInitialize}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Initialize Default Departments
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

interface DepartmentCardProps {
  department: DepartmentConfig;
  onEdit: (department: DepartmentConfig) => void;
  onDelete: (id: string) => void;
}

function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{department.name}</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(department)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(department.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        {department.headEmployeeName && (
          <p>Head: {department.headEmployeeName}</p>
        )}
        {department.parentDepartment && (
          <p>Parent: {department.parentDepartment}</p>
        )}
        <p>Employees: {department.employeeCount || 0}</p>
        <p className={`inline-block px-2 py-1 rounded text-xs ${
          department.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {department.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
}