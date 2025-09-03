# Approval Queue UI Components

Enterprise-grade approval queue components for document review and approval workflows, built with VelocityFibre theme and full accessibility compliance.

## 🚀 Quick Start

```tsx
import { ApprovalQueueComponent } from '@/components/contractor/approval';

function MyApprovalPage() {
  return (
    <ApprovalQueueComponent
      approverUserId="user-123"
      isAdmin={false}
      onItemApproved={(item) => console.log('Approved:', item)}
      onItemRejected={(item) => console.log('Rejected:', item)}
    />
  );
}
```

## 📦 Components

### ApprovalQueueComponent (Main Dashboard)

The primary component for displaying and managing approval queues.

**Features:**
- Real-time SLA tracking with visual indicators
- Advanced filtering (priority, document type, overdue status)
- Sorting by priority, due date, or assignment date
- Batch approval/rejection capabilities
- Auto-refresh every 30 seconds
- Responsive mobile-first design
- Full keyboard navigation support

**Props:**
```tsx
interface ApprovalQueueComponentProps {
  approverUserId?: string;        // Current approver's user ID
  isAdmin?: boolean;              // Admin view (see all items)
  className?: string;             // Additional CSS classes
  onItemApproved?: (item: ApprovalItem) => void;
  onItemRejected?: (item: ApprovalItem) => void;
  onBatchOperationComplete?: (operation: string, items: ApprovalItem[]) => void;
}
```

### ApprovalItemCard (Individual Items)

Displays individual approval items with detailed information and actions.

**Features:**
- Priority-based visual styling (critical items get red neon effects)
- SLA status indicators (overdue, urgent, due soon, on track)
- Escalation level indicators
- Document preview and download buttons
- Inline approval/rejection with reason collection
- Accessibility-compliant interactions

### BatchApprovalControls (Bulk Operations)

Provides bulk operations for selected approval items.

**Features:**
- Batch approve multiple items
- Batch reject with reason selection
- Batch reassign to different approvers
- Progress tracking during operations
- Performance warnings for large batches
- Confirmation modals with detailed information

### SLAStatusIndicator (Performance Dashboard)

Visual SLA tracking and performance metrics dashboard.

**Features:**
- Overall SLA health score calculation
- Priority distribution charts
- Workflow stage distribution
- Performance recommendations
- Real-time metrics calculation
- Configurable SLA thresholds

### DocumentPreviewModal (Document Review)

Full-featured document preview and approval interface.

**Features:**
- Document viewer with zoom, rotate, fullscreen
- PDF, image, and document file support
- Inline approval/rejection actions
- Document metadata display
- Download functionality
- Keyboard navigation (ESC to close)

## 🎨 Theme Integration

All components use the VelocityFibre design system:

- **Glassmorphism effects**: `velocity-glass-light`, `velocity-glass-medium`
- **Neon accents**: Priority-based neon effects for critical items
- **Gradient backgrounds**: `velocity-gradient-surface`, `velocity-gradient-card`
- **Elevation shadows**: `velocity-elevation-1` through `velocity-elevation-8`
- **Smooth transitions**: `velocity-transition-smooth`
- **Interactive states**: `velocity-hover-lift`, `velocity-press-active`

## ♿ Accessibility Features

Full WCAG 2.1 AA compliance:

- **Keyboard Navigation**: All interactive elements accessible via Tab/Enter/Space
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Independence**: Information not conveyed by color alone
- **High Contrast**: 4.5:1 contrast ratio minimum
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## 📊 API Integration

Components integrate with the following API endpoints:

### GET /api/contractors/documents/approval-queue
Fetches approval queue items with filtering and pagination.

**Query Parameters:**
- `approverUserId`: Filter by approver
- `priorityLevel`: Filter by priority (low, normal, high, urgent, critical)
- `documentType`: Filter by document type
- `overdue`: Filter overdue items (true/false)
- `sortBy`: Sort field (priority, due_date, assigned_date)
- `sortOrder`: Sort direction (asc, desc)
- `limit`: Items per page (default 50, max 200)
- `offset`: Pagination offset
- `isAdmin`: Admin access flag

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": { ... },
    "statistics": {
      "total": 45,
      "overdue": 3,
      "urgent": 12,
      "dueToday": 8,
      "byPriority": { ... },
      "byStage": { ... }
    }
  }
}
```

### PUT /api/contractors/documents/approval-workflow
Processes approval decisions (approve/reject).

**Request Body:**
```json
{
  "workflowId": "uuid",
  "approverUserId": "user-id",
  "decision": "approve" | "reject",
  "comments": "Optional comments",
  "rejectionReason": "Required for rejections",
  "timeSpentMinutes": 15
}
```

## 🔧 Customization

### SLA Thresholds
```tsx
<ApprovalQueueComponent
  slaTargets={{
    overdueThreshold: 5,     // Max 5% overdue items
    urgentThreshold: 10,     // Max 10% urgent items
    onTimeTarget: 95         // 95% on-time completion
  }}
/>
```

### Theme Customization
```css
/* Override priority colors */
.velocity-neon-critical {
  box-shadow: 0 0 20px rgba(255, 20, 147, 0.8);
  border: 1px solid #ff1493;
}

/* Custom glassmorphism */
.approval-queue-custom {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## 📱 Responsive Breakpoints

- **Mobile**: 320-768px - Touch-optimized, simplified layout
- **Tablet**: 768-1024px - Hybrid interactions, adjusted spacing
- **Desktop**: 1024px+ - Full feature set with hover states

## 🚀 Performance

- **Optimized Rendering**: Virtualized lists for large datasets
- **API Efficiency**: Smart caching with 30-second refresh intervals
- **Bundle Size**: Tree-shakeable exports, lazy-loaded modals
- **Memory Management**: Proper cleanup of intervals and event listeners

## 📋 Usage Examples

### Basic Approval Queue
```tsx
<ApprovalQueueComponent
  approverUserId="approver-123"
  onItemApproved={(item) => {
    // Handle approval
    showToast(`${item.documentName} approved!`);
  }}
/>
```

### Admin Dashboard
```tsx
<ApprovalQueueComponent
  isAdmin={true}
  onBatchOperationComplete={(operation, items) => {
    // Handle batch operations
    showToast(`${operation} completed for ${items.length} items`);
  }}
/>
```

### Custom Integration
```tsx
function CustomApprovalDashboard() {
  const [selectedFilter, setSelectedFilter] = useState('overdue');
  
  return (
    <div className="custom-approval-dashboard">
      <SLAStatusIndicator 
        statistics={slaStats} 
        showDetailed={true}
      />
      <ApprovalQueueComponent
        approverUserId={currentUser.id}
        className="mt-6"
      />
    </div>
  );
}
```

## 🧪 Testing

Run the test page to validate components:
```bash
# Start development server
npm run dev

# Visit test page
http://localhost:3000/test-approval-queue
```

## 📚 Additional Resources

- [VelocityFibre Design System](../../../config/themes/velocityStyles.css)
- [API Documentation](../../../../api/contractors/documents/)
- [Accessibility Guidelines](../../../docs/accessibility.md)
- [Performance Best Practices](../../../docs/performance.md)

---

**Enterprise-grade approval queue components with real-time SLA tracking, built for scale and accessibility.**