import { FileText, Download, Filter, PieChart, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function ReportsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Reports' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'custom', label: 'Custom' },
    { id: 'templates', label: 'Templates' },
  ];

  const reportCategories = [
    {
      title: 'Project Reports',
      description: 'Detailed project progress and status',
      icon: FileText,
      color: 'bg-blue-500',
      count: 12,
      onClick: () => navigate('/app/reports/projects'),
    },
    {
      title: 'Financial Reports',
      description: 'Budget, costs and financial analysis',
      icon: BarChart3,
      color: 'bg-green-500',
      count: 8,
      onClick: () => navigate('/app/reports/financial'),
    },
    {
      title: 'Performance Reports',
      description: 'KPIs and performance metrics',
      icon: TrendingUp,
      color: 'bg-purple-500',
      count: 15,
      onClick: () => navigate('/app/reports/performance'),
    },
    {
      title: 'Resource Reports',
      description: 'Staff, equipment and materials',
      icon: PieChart,
      color: 'bg-orange-500',
      count: 6,
      onClick: () => navigate('/app/reports/resources'),
    },
    {
      title: 'Custom Reports',
      description: 'Create custom report templates',
      icon: Filter,
      color: 'bg-indigo-500',
      onClick: () => navigate('/app/reports/custom'),
    },
    {
      title: 'Scheduled Reports',
      description: 'Automated report generation',
      icon: Clock,
      color: 'bg-pink-500',
      count: 4,
      onClick: () => navigate('/app/reports/scheduled'),
    },
  ];

  const recentReports = [
    { name: 'Monthly Progress Report', date: '2025-08-15', type: 'Performance', status: 'ready' },
    { name: 'Q2 Financial Summary', date: '2025-08-10', type: 'Financial', status: 'ready' },
    { name: 'Project Status Update', date: '2025-08-05', type: 'Project', status: 'ready' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and manage business reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/app/reports/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Report
          </button>
          <button
            onClick={() => navigate('/app/reports/export')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reportCategories.map((category) => (
          <div
            key={category.title}
            onClick={category.onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className={`${category.color} p-3 rounded-lg`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {category.title}
                  {category.count !== undefined && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({category.count})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
        </div>
        <div className="p-6">
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">{report.type} • {report.date}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No recent reports</p>
          )}
        </div>
      </div>
    </div>
  );
}