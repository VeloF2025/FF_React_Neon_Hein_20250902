import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  position: string;
  department?: string;
  status?: string;
  reportsTo?: string;
  children: StaffMember[];
}

export function HierarchyTab() {
  const [hierarchy, setHierarchy] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff and build hierarchy
  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      // Import staffService dynamically to avoid circular imports
      const { staffService } = await import('@/services/staffService');
      const allStaff = await staffService.getAll();
      
      // Build hierarchy tree
      const hierarchyTree = buildHierarchyTree(allStaff);
      setHierarchy(hierarchyTree);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchy tree structure
  const buildHierarchyTree = (staff: any[]): StaffMember[] => {
    const staffMap = new Map<string, StaffMember>();
    const roots: StaffMember[] = [];

    // Create staff map
    staff.forEach(person => {
      staffMap.set(person.id, {
        ...person,
        children: []
      });
    });

    // Build parent-child relationships
    staff.forEach(person => {
      if (person.reportsTo) {
        const manager = staffMap.get(person.reportsTo);
        if (manager) {
          manager.children.push(staffMap.get(person.id)!);
        } else {
          // If manager not found, treat as root
          roots.push(staffMap.get(person.id)!);
        }
      } else {
        // No manager - this is a root node
        roots.push(staffMap.get(person.id)!);
      }
    });

    return roots;
  };

  // Load hierarchy on component mount
  useEffect(() => {
    fetchHierarchy();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Organizational Hierarchy</h2>
        <button
          onClick={fetchHierarchy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Refresh Hierarchy
        </button>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          The reporting hierarchy is built from the "Reports To" relationships in staff profiles.
          Click on staff members to view their details or edit reporting relationships.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading organizational hierarchy...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {hierarchy.length > 0 ? (
            <div className="space-y-4">
              {hierarchy.map(root => (
                <HierarchyNode key={root.id} person={root} level={0} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <GitBranch className="w-12 h-12 mx-auto mb-3" />
              <p>No staff members found</p>
              <p className="text-sm mt-2">Add staff members to see the organizational hierarchy</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Hierarchy Node Component
interface HierarchyNodeProps {
  person: StaffMember;
  level: number;
}

function HierarchyNode({ person, level }: HierarchyNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = person.children && person.children.length > 0;

  const handleNavigate = () => {
    window.open(`/app/staff/${person.id}`, '_blank');
  };

  return (
    <div className="relative">
      <div 
        className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
          level === 0 ? 'border-blue-200 bg-blue-50' : 
          level === 1 ? 'border-green-200 bg-green-50' :
          'border-gray-200 bg-white'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
        onClick={handleNavigate}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-2 p-1 rounded hover:bg-gray-200"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        {/* Staff Avatar */}
        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
          level === 0 ? 'bg-blue-600 text-white' :
          level === 1 ? 'bg-green-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          <span className="text-sm font-medium">
            {person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </span>
        </div>

        {/* Staff Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{person.name}</span>
            {level === 0 && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Executive
              </span>
            )}
            {level === 1 && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Manager
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {person.position} • {person.department?.replace('_', ' ')}
          </div>
          {hasChildren && (
            <div className="text-xs text-gray-500 mt-1">
              {person.children.length} direct report{person.children.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs rounded-full ${
          person.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          person.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {person.status?.replace('_', ' ') || 'Unknown'}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2">
          {person.children.map((child) => (
            <HierarchyNode key={child.id} person={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}