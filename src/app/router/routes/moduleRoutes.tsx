import { Suspense } from 'react';
import { Loading } from '../components';
import {
  ClientsPage,
  ClientCreatePage,
  ClientEditPage,
  ClientDetailPage,
  StaffPage,
  StaffCreatePage,
  StaffEditPage,
  StaffDetailPage,
  StaffImport,
  StaffSettings,
  ContractorsDashboard,
  ContractorCreatePage,
  ContractorEditPage,
  ContractorDetailPage,
  CommunicationsDashboard,
  AnalyticsDashboard,
  FieldAppPortal,
  MeetingsDashboard,
  ActionItemsDashboard,
  TasksDashboard,
  SOWDashboard,
  SOWListPage,
  OneMapDashboard,
  NokiaEquipmentDashboard,
  DailyProgressDashboard,
  EnhancedKPIDashboard,
  KPIDashboard,
  ReportsDashboard,
  Settings,
  SuppliersPortalPage,
  WorkflowPortalPage
} from '../lazyImports';

export const moduleRoutes = [
  // Clients
  {
    path: 'clients',
    element: (
      <Suspense fallback={<Loading />}>
        <ClientsPage />
      </Suspense>
    ),
  },
  {
    path: 'clients/new',
    element: (
      <Suspense fallback={<Loading />}>
        <ClientCreatePage />
      </Suspense>
    ),
  },
  {
    path: 'clients/:id/edit',
    element: (
      <Suspense fallback={<Loading />}>
        <ClientEditPage />
      </Suspense>
    ),
  },
  {
    path: 'clients/:id',
    element: (
      <Suspense fallback={<Loading />}>
        <ClientDetailPage />
      </Suspense>
    ),
  },
  // Staff
  {
    path: 'staff',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffPage />
      </Suspense>
    ),
  },
  {
    path: 'staff/new',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffCreatePage />
      </Suspense>
    ),
  },
  {
    path: 'staff/import',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffImport />
      </Suspense>
    ),
  },
  {
    path: 'staff/:id/edit',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffEditPage />
      </Suspense>
    ),
  },
  {
    path: 'staff/:id',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffDetailPage />
      </Suspense>
    ),
  },
  // Contractors
  {
    path: 'contractors',
    element: (
      <Suspense fallback={<Loading />}>
        <ContractorsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'contractors/new',
    element: (
      <Suspense fallback={<Loading />}>
        <ContractorCreatePage />
      </Suspense>
    ),
  },
  {
    path: 'contractors/:id/edit',
    element: (
      <Suspense fallback={<Loading />}>
        <ContractorEditPage />
      </Suspense>
    ),
  },
  {
    path: 'contractors/:id',
    element: (
      <Suspense fallback={<Loading />}>
        <ContractorDetailPage />
      </Suspense>
    ),
  },
  {
    path: 'communications',
    element: (
      <Suspense fallback={<Loading />}>
        <CommunicationsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'analytics',
    element: (
      <Suspense fallback={<Loading />}>
        <AnalyticsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'field',
    element: (
      <Suspense fallback={<Loading />}>
        <FieldAppPortal />
      </Suspense>
    ),
  },
  {
    path: 'meetings',
    element: (
      <Suspense fallback={<Loading />}>
        <MeetingsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'action-items',
    element: (
      <Suspense fallback={<Loading />}>
        <ActionItemsDashboard />
      </Suspense>
    ),
  },
  {
    path: 'tasks',
    element: (
      <Suspense fallback={<Loading />}>
        <TasksDashboard />
      </Suspense>
    ),
  },
  // SOW
  {
    path: 'sow',
    element: (
      <Suspense fallback={<Loading />}>
        <SOWDashboard />
      </Suspense>
    ),
  },
  {
    path: 'sow/list',
    element: (
      <Suspense fallback={<Loading />}>
        <SOWListPage />
      </Suspense>
    ),
  },
  // Field Operations
  {
    path: 'onemap',
    element: (
      <Suspense fallback={<Loading />}>
        <OneMapDashboard />
      </Suspense>
    ),
  },
  {
    path: 'nokia-equipment',
    element: (
      <Suspense fallback={<Loading />}>
        <NokiaEquipmentDashboard />
      </Suspense>
    ),
  },
  // Analytics & Reporting
  {
    path: 'daily-progress',
    element: (
      <Suspense fallback={<Loading />}>
        <DailyProgressDashboard />
      </Suspense>
    ),
  },
  {
    path: 'enhanced-kpis',
    element: (
      <Suspense fallback={<Loading />}>
        <EnhancedKPIDashboard />
      </Suspense>
    ),
  },
  {
    path: 'kpi-dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <KPIDashboard />
      </Suspense>
    ),
  },
  {
    path: 'reports',
    element: (
      <Suspense fallback={<Loading />}>
        <ReportsDashboard />
      </Suspense>
    ),
  },
  // Settings
  {
    path: 'settings',
    element: (
      <Suspense fallback={<Loading />}>
        <Settings />
      </Suspense>
    ),
  },
  {
    path: 'settings/staff',
    element: (
      <Suspense fallback={<Loading />}>
        <StaffSettings />
      </Suspense>
    ),
  },
  // Suppliers Portal
  {
    path: 'suppliers',
    element: (
      <Suspense fallback={<Loading />}>
        <SuppliersPortalPage />
      </Suspense>
    ),
  },
  // Workflow Portal
  {
    path: 'workflow-portal',
    element: (
      <Suspense fallback={<Loading />}>
        <WorkflowPortalPage />
      </Suspense>
    ),
  },
];