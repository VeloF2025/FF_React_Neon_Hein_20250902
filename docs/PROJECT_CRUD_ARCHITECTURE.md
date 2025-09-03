# Unified Project CRUD Architecture

## Overview

This document describes the unified project CRUD system that ensures complete data consistency across all create, read, update, and delete operations. The architecture eliminates field name mismatches and guarantees that data created through the system is identical to what's retrieved and edited.

## Architecture Components

### 1. Type System (`src/types/project.types.ts`)

**Purpose**: Single source of truth for all project-related types.

- **`Project`**: Canonical project type used throughout the application
- **`DbProject`**: Database representation (snake_case for PostgreSQL)
- **`ProjectFormData`**: Form data structure for UI components
- **Type Guards**: Runtime validation functions
- **Enums**: Standardized values for status, priority, type, etc.

### 2. Data Transformation Layer (`src/services/project/ProjectTransformer.ts`)

**Purpose**: Handles all data conversions between different representations.

**Key Methods**:
- `fromDatabase()`: Converts snake_case DB records to camelCase application objects
- `toDatabase()`: Converts application objects to DB format
- `fromFormData()`: Transforms form input to Project structure
- `toFormData()`: Prepares Project data for form editing
- `normalize()`: Ensures data consistency and validity

### 3. Repository Pattern (`src/services/project/ProjectRepository.ts`)

**Purpose**: Central repository for all project operations, ensuring consistency.

**Features**:
- Singleton pattern for global state management
- Built-in caching with configurable TTL
- Automatic data transformation
- Related data population
- Consistency validation

**Key Methods**:
```typescript
// Create with guaranteed consistency
const project = await projectRepository.create(formData);

// Read with exact same structure
const retrieved = await projectRepository.getById(project.id);

// Update preserving structure
const updated = await projectRepository.update(id, changes);

// Delete with cache cleanup
await projectRepository.delete(id);
```

### 4. API Client (`src/services/project/ProjectApiClient.ts`)

**Purpose**: Low-level HTTP communication with backend.

**Features**:
- Works with database format directly
- Query parameter building
- Error handling
- Batch operations support
- Import/export capabilities

### 5. React Hooks (`src/hooks/useProjectCRUD.ts`)

**Purpose**: React integration for components.

**Hooks**:
- `useProjectCRUD()`: Full CRUD operations with state management
- `useProject()`: Single project management

## Data Flow

### Create Flow
```
Form Input → ProjectFormData
    ↓
ProjectTransformer.fromFormData()
    ↓
Project (normalized)
    ↓
ProjectTransformer.toDatabase()
    ↓
DbProject → API → Database
    ↓
Response → ProjectTransformer.fromDatabase()
    ↓
Project (consistent structure)
```

### Read Flow
```
Database → DbProject
    ↓
ProjectTransformer.fromDatabase()
    ↓
Project (with related data)
    ↓
Cache & Return to UI
```

### Update Flow
```
Form Changes → Partial<ProjectFormData>
    ↓
Merge with existing Project
    ↓
ProjectTransformer.toDatabase()
    ↓
API Update (only changed fields)
    ↓
Response → ProjectTransformer.fromDatabase()
    ↓
Updated Project (consistent)
```

## Field Mapping

### Database (snake_case) → Application (camelCase)

| Database Field | Application Field | Type |
|---------------|------------------|------|
| project_code | code | string |
| project_name | name | string |
| client_id | clientId | string |
| project_type | type | ProjectType |
| start_date | startDate | string (ISO) |
| end_date | endDate | string (ISO) |
| project_manager | projectManagerId | string |
| progress_percentage | progressPercentage | number |
| is_active | isActive | boolean |
| is_archived | isArchived | boolean |

## Consistency Guarantees

### 1. Field Name Consistency
- All field names are centrally defined in types
- Transformer handles all conversions automatically
- No manual field mapping in components

### 2. Data Type Consistency
- Enums ensure valid values
- Dates always in ISO 8601 format
- Numbers validated and normalized
- Arrays always initialized (never undefined)

### 3. CRUD Operation Consistency
- Create returns exact structure used in read
- Update preserves all non-modified fields
- Delete removes from cache immediately
- All operations use same transformation pipeline

### 4. Validation & Normalization
- Required fields validated before DB operations
- Enums normalized to valid values
- Progress percentages clamped to 0-100
- Dates formatted consistently

## Testing

### Manual Testing with ProjectCRUDTest Component

1. Navigate to `/dev/project-crud-test`
2. Click "Run All Tests"
3. Verify all tests pass:
   - CREATE: All fields saved correctly
   - READ: Retrieved data matches created
   - UPDATE: Changes persist correctly
   - DELETE: Project removed completely

### Consistency Validation

```typescript
// Validate data consistency
const result = await projectRepository.validateConsistency(projectId);
if (!result.isConsistent) {
  console.error('Inconsistencies found:', result.differences);
}
```

## Usage Examples

### Creating a Project

```typescript
import { projectRepository, ProjectFormData, ProjectType } from '@/services/project';

const formData: ProjectFormData = {
  name: 'New Fiber Project',
  type: ProjectType.FIBRE,
  clientId: 'client-123',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  budget: 100000
};

const project = await projectRepository.create(formData);
// project.code automatically generated
// project.progressPercentage = 0
// project.isActive = true
```

### Updating a Project

```typescript
const updates = {
  name: 'Updated Project Name',
  status: ProjectStatus.COMPLETED,
  progressPercentage: 100
};

const updated = await projectRepository.update(projectId, updates);
// All other fields preserved
// Audit fields updated automatically
```

### Using in React Components

```typescript
import { useProjectCRUD } from '@/hooks/useProjectCRUD';

function ProjectManager() {
  const { 
    projects, 
    createProject, 
    updateProject,
    loading,
    error 
  } = useProjectCRUD();
  
  // Component logic...
}
```

## Migration Guide

### From Old System

1. Replace all direct API calls with repository:
   ```typescript
   // Old
   const response = await fetch('/api/projects');
   const data = await response.json();
   
   // New
   const projects = await projectRepository.getAll();
   ```

2. Update type imports:
   ```typescript
   // Old
   import { Project } from '@/types/project/base.types';
   
   // New
   import { Project } from '@/services/project';
   ```

3. Use hooks in components:
   ```typescript
   // Old
   const [projects, setProjects] = useState([]);
   useEffect(() => { /* fetch logic */ }, []);
   
   // New
   const { projects, loading } = useProjectCRUD();
   ```

## Benefits

1. **Data Consistency**: Guaranteed same structure across all operations
2. **Type Safety**: Full TypeScript coverage with no 'any' types
3. **Maintainability**: Single source of truth for data structure
4. **Performance**: Built-in caching reduces API calls
5. **Developer Experience**: Simple, consistent API
6. **Error Prevention**: Automatic validation and normalization
7. **Scalability**: Easy to extend with new fields

## Future Enhancements

1. **Optimistic Updates**: Update UI before API confirmation
2. **Offline Support**: Queue operations when offline
3. **Real-time Sync**: WebSocket integration for live updates
4. **Advanced Caching**: Partial updates without full refresh
5. **Audit Trail**: Complete history of all changes