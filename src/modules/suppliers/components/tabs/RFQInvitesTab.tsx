import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  Calendar,
  DollarSign,
  Filter,
  Plus,
  Search,
  AlertCircle
} from 'lucide-react';
import { useSuppliersPortal } from '../../context/SuppliersPortalContext';
import { cn } from '@/lib/utils';

// RFQ types
interface RFQInvite {
  id: string;
  title: string;
  description: string;
  supplierId: string;
  supplierName: string;
  status: 'sent' | 'viewed' | 'responded' | 'accepted' | 'declined' | 'expired';
  sentDate: string;
  dueDate: string;
  responseDate?: string;
  estimatedValue: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requirements: string[];
  attachments: number;
}

// Status mapping
const statusConfig = {
  sent: {
    label: 'Sent',
    icon: Send,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  viewed: {
    label: 'Viewed',
    icon: Eye,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600'
  },
  responded: {
    label: 'Responded',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  }
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', badge: '●' },
  medium: { color: 'bg-yellow-100 text-yellow-800', badge: '●' },
  high: { color: 'bg-orange-100 text-orange-800', badge: '●' },
  urgent: { color: 'bg-red-100 text-red-800', badge: '●' }
};

// Mock RFQ data
const mockRFQs: RFQInvite[] = [
  {
    id: 'rfq-001',
    title: 'Network Security Equipment',
    description: 'Request for enterprise-grade firewall and security appliances',
    supplierId: 'supplier-001',
    supplierName: 'TechFlow Solutions',
    status: 'responded',
    sentDate: '2024-01-15',
    dueDate: '2024-01-30',
    responseDate: '2024-01-20',
    estimatedValue: 125000,
    category: 'Technology',
    priority: 'high',
    requirements: ['ISO 27001 Certified', '24/7 Support', '2-year Warranty'],
    attachments: 3
  },
  {
    id: 'rfq-002',
    title: 'Steel Construction Materials',
    description: 'Structural steel and reinforcement bars for Project Phoenix',
    supplierId: 'supplier-002',
    supplierName: 'Global Materials Inc',
    status: 'viewed',
    sentDate: '2024-01-18',
    dueDate: '2024-02-05',
    estimatedValue: 75000,
    category: 'Materials',
    priority: 'medium',
    requirements: ['ASTM Compliance', 'Mill Certificates', 'On-site Delivery'],
    attachments: 2
  },
  {
    id: 'rfq-003',
    title: 'Consulting Services Package',
    description: 'Strategic consulting and implementation services',
    supplierId: 'supplier-003',
    supplierName: 'Premium Services Ltd',
    status: 'sent',
    sentDate: '2024-01-22',
    dueDate: '2024-02-10',
    estimatedValue: 95000,
    category: 'Services',
    priority: 'urgent',
    requirements: ['Certified Consultants', 'Case Studies', 'References'],
    attachments: 1
  }
];

// RFQ Card Component
interface RFQCardProps {
  rfq: RFQInvite;
  onView: (rfq: RFQInvite) => void;
}

function RFQCard({ rfq, onView }: RFQCardProps) {
  const status = statusConfig[rfq.status];
  const priority = priorityConfig[rfq.priority];
  const StatusIcon = status.icon;
  
  const isOverdue = new Date(rfq.dueDate) < new Date() && rfq.status !== 'responded' && rfq.status !== 'accepted';
  const daysUntilDue = Math.ceil((new Date(rfq.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", status.color)}>
              <StatusIcon className={cn("w-3 h-3 inline mr-1", status.iconColor)} />
              {status.label}
            </span>
            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priority.color)}>
              <span className="mr-1">{priority.badge}</span>
              {rfq.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">{rfq.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Sent: {new Date(rfq.sentDate).toLocaleDateString()}
            </span>
            <span className={cn("flex items-center", isOverdue ? 'text-red-600' : '')}>
              <Clock className="w-4 h-4 mr-1" />
              Due: {new Date(rfq.dueDate).toLocaleDateString()}
              {isOverdue ? ' (Overdue)' : ` (${daysUntilDue} days)`}
            </span>
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              ${rfq.estimatedValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
        <div className="flex flex-wrap gap-2">
          {rfq.requirements.map((req, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {req}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{rfq.supplierName}</span>
          <span>{rfq.category}</span>
          {rfq.attachments > 0 && (
            <span className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              {rfq.attachments} files
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(rfq)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {rfq.responseDate && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Responded on {new Date(rfq.responseDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

// RFQ Detail Modal Component
interface RFQDetailModalProps {
  rfq: RFQInvite | null;
  onClose: () => void;
}

function RFQDetailModal({ rfq, onClose }: RFQDetailModalProps) {
  if (!rfq) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{rfq.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">RFQ Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600">{rfq.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-600">{rfq.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Value</label>
                  <p className="text-sm text-gray-600">${rfq.estimatedValue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requirements</label>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {rfq.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline & Status</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sent Date</label>
                  <p className="text-sm text-gray-600">{new Date(rfq.sentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-600">{new Date(rfq.dueDate).toLocaleDateString()}</p>
                </div>
                {rfq.responseDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Response Date</label>
                    <p className="text-sm text-gray-600">{new Date(rfq.responseDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <p className="text-sm text-gray-600">{statusConfig[rfq.status].label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Send Follow-up
          </button>
        </div>
      </div>
    </div>
  );
}

export function RFQInvitesTab() {
  const { selectedSupplier } = useSuppliersPortal();
  const [selectedRFQ, setSelectedRFQ] = useState<RFQInvite | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter RFQs based on selected supplier and other filters
  const filteredRFQs = useMemo(() => {
    let filtered = mockRFQs;

    // Filter by selected supplier
    if (selectedSupplier) {
      filtered = filtered.filter(rfq => rfq.supplierId === selectedSupplier.id);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rfq => rfq.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(rfq => 
        rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [selectedSupplier, statusFilter, searchTerm]);

  const handleViewRFQ = (rfq: RFQInvite) => {
    setSelectedRFQ(rfq);
  };

  if (!selectedSupplier) {
    return (
      <div className="text-center py-12">
        <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Supplier</h3>
        <p className="text-gray-600">
          Choose a supplier from the Company Profile tab to view their RFQ invitations and response history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RFQ Invites</h2>
          <p className="text-gray-600 mt-1">
            Manage RFQ invitations and track responses for {selectedSupplier.name}
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create RFQ</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFQs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="responded">Responded</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredRFQs.length} of {mockRFQs.length} RFQs
          </div>
        </div>
      </div>

      {/* RFQ Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Sent</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {mockRFQs.filter(r => r.status === 'sent').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Viewed</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {mockRFQs.filter(r => r.status === 'viewed').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Responded</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {mockRFQs.filter(r => r.status === 'responded' || r.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Declined</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">
            {mockRFQs.filter(r => r.status === 'declined' || r.status === 'expired').length}
          </p>
        </div>
      </div>

      {/* RFQ List */}
      {filteredRFQs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No RFQs match your current filters.'
              : 'No RFQs have been sent to this supplier yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRFQs.map((rfq) => (
            <RFQCard key={rfq.id} rfq={rfq} onView={handleViewRFQ} />
          ))}
        </div>
      )}

      {/* RFQ Detail Modal */}
      <RFQDetailModal 
        rfq={selectedRFQ} 
        onClose={() => setSelectedRFQ(null)} 
      />
    </div>
  );
}

export default RFQInvitesTab;