/**
 * SLAStatusIndicator - Visual SLA tracking and performance dashboard
 * Displays SLA metrics, trends, and escalation alerts
 * Following VelocityFibre theme and accessibility standards
 */

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import type { ApprovalQueueStats } from './ApprovalQueueComponent';

interface SLAStatusIndicatorProps {
  statistics: ApprovalQueueStats;
  className?: string;
  showDetailed?: boolean;
  slaTargets?: {
    overdueThreshold: number;
    urgentThreshold: number;
    onTimeTarget: number;
  };
}

interface SLAMetric {
  label: string;
  value: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  description: string;
  trend?: 'up' | 'down' | 'stable';
}

export function SLAStatusIndicator({
  statistics,
  className = '',
  showDetailed = true,
  slaTargets = {
    overdueThreshold: 5, // Max 5% overdue items
    urgentThreshold: 10, // Max 10% urgent items
    onTimeTarget: 95 // 95% on-time completion target
  }
}: SLAStatusIndicatorProps) {
  // Calculate SLA metrics
  const slaMetrics = useMemo((): SLAMetric[] => {
    const totalItems = statistics.total || 1; // Avoid division by zero
    
    const overduePercentage = (statistics.overdue / totalItems) * 100;
    const urgentPercentage = (statistics.urgent / totalItems) * 100;
    const dueTodayPercentage = (statistics.dueToday / totalItems) * 100;
    
    // Calculate on-time performance (inverse of overdue)
    const onTimePercentage = Math.max(0, 100 - overduePercentage);
    
    return [
      {
        label: 'On-Time Performance',
        value: onTimePercentage,
        target: slaTargets.onTimeTarget,
        status: onTimePercentage >= slaTargets.onTimeTarget ? 'good' : 
                onTimePercentage >= (slaTargets.onTimeTarget - 10) ? 'warning' : 'critical',
        icon: Target,
        description: 'Percentage of items completed within SLA',
        trend: 'stable' // Would come from historical data in real implementation
      },
      {
        label: 'Overdue Items',
        value: overduePercentage,
        target: slaTargets.overdueThreshold,
        status: overduePercentage <= slaTargets.overdueThreshold ? 'good' as const : 
                overduePercentage <= (slaTargets.overdueThreshold * 2) ? 'warning' as const : 'critical' as const,
        icon: AlertTriangle,
        description: 'Items that have exceeded their SLA deadline',
        trend: 'up' // Mock trend - would be calculated from historical data
      },
      {
        label: 'Urgent Priority',
        value: urgentPercentage,
        target: slaTargets.urgentThreshold,
        status: urgentPercentage <= slaTargets.urgentThreshold ? 'good' as const : 
                urgentPercentage <= (slaTargets.urgentThreshold * 1.5) ? 'warning' as const : 'critical' as const,
        icon: Zap,
        description: 'High priority items requiring immediate attention',
        trend: 'down'
      },
      {
        label: 'Due Today',
        value: dueTodayPercentage,
        status: dueTodayPercentage <= 20 ? 'good' as const : 
                dueTodayPercentage <= 40 ? 'warning' as const : 'critical' as const,
        icon: Clock,
        description: 'Items due for completion today',
        trend: 'stable'
      }
    ];
  }, [statistics, slaTargets]);

  // Overall SLA health score
  const overallHealth = useMemo(() => {
    const scores = slaMetrics.map(metric => {
      switch (metric.status) {
        case 'good': return 100;
        case 'warning': return 60;
        case 'critical': return 20;
        default: return 50;
      }
    });
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (averageScore >= 80) return { score: averageScore, status: 'good', label: 'Excellent' };
    if (averageScore >= 60) return { score: averageScore, status: 'warning', label: 'Needs Attention' };
    return { score: averageScore, status: 'critical', label: 'Critical Issues' };
  }, [slaMetrics]);

  // Priority distribution data
  const priorityData = useMemo(() => {
    const total = statistics.total || 1;
    return [
      { 
        priority: 'Critical', 
        count: statistics.byPriority.critical, 
        percentage: (statistics.byPriority.critical / total) * 100,
        color: 'bg-red-500'
      },
      { 
        priority: 'Urgent', 
        count: statistics.byPriority.urgent, 
        percentage: (statistics.byPriority.urgent / total) * 100,
        color: 'bg-orange-500'
      },
      { 
        priority: 'High', 
        count: statistics.byPriority.high, 
        percentage: (statistics.byPriority.high / total) * 100,
        color: 'bg-yellow-500'
      },
      { 
        priority: 'Normal', 
        count: statistics.byPriority.normal, 
        percentage: (statistics.byPriority.normal / total) * 100,
        color: 'bg-blue-500'
      },
      { 
        priority: 'Low', 
        count: statistics.byPriority.low, 
        percentage: (statistics.byPriority.low / total) * 100,
        color: 'bg-gray-500'
      }
    ].filter(item => item.count > 0);
  }, [statistics]);

  // Status color helper
  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  // Trend icon helper
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-green-500" />;
      default: return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall SLA Health */}
      <div className="velocity-glass-light p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            SLA Performance Dashboard
          </h3>
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium border
            ${getStatusColor(overallHealth.status)}
          `}>
            {overallHealth.label} ({Math.round(overallHealth.score)}%)
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {slaMetrics.map((metric) => {
            const MetricIcon = metric.icon;
            return (
              <div key={metric.label} className="velocity-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`
                    p-2 rounded-lg border
                    ${getStatusColor(metric.status)}
                  `}>
                    <MetricIcon className="w-4 h-4" />
                  </div>
                  {metric.trend && (
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`
                      text-lg font-bold
                      ${metric.status === 'good' ? 'text-green-600' : 
                        metric.status === 'warning' ? 'text-orange-600' : 'text-red-600'}
                    `}>
                      {Math.round(metric.value)}%
                    </span>
                    {metric.target && (
                      <span className="text-xs text-gray-500">
                        Target: {metric.target}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {metric.description}
                  </p>
                </div>

                {/* Progress bar */}
                {metric.target && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`
                          h-2 rounded-full transition-all duration-300
                          ${metric.status === 'good' ? 'bg-green-500' : 
                            metric.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'}
                        `}
                        style={{
                          width: `${Math.min(100, (metric.value / (metric.target * 1.2)) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{metric.target}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Critical alerts */}
        {(statistics.overdue > 0 || statistics.urgent > 5) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-2">SLA Alerts Requiring Immediate Action</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {statistics.overdue > 0 && (
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span><strong>{statistics.overdue}</strong> documents are overdue and require immediate review</span>
                    </li>
                  )}
                  {statistics.urgent > 5 && (
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span><strong>{statistics.urgent}</strong> high-priority items need urgent attention</span>
                    </li>
                  )}
                  {statistics.dueToday > 10 && (
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span><strong>{statistics.dueToday}</strong> documents are due today</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed breakdown */}
      {showDetailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority distribution */}
          <div className="velocity-glass-light p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Priority Distribution
            </h4>
            
            <div className="space-y-4">
              {priorityData.map((item) => (
                <div key={item.priority} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.priority}</span>
                    <span className="text-gray-500">
                      {item.count} ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage distribution */}
          <div className="velocity-glass-light p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Workflow Stage Distribution
            </h4>
            
            <div className="space-y-3">
              {Object.entries(statistics.byStage).map(([stage, count]) => {
                const stageNames = {
                  1: 'Automated Validation',
                  2: 'Compliance Review',
                  3: 'Legal Review',
                  4: 'Final Approval'
                };
                const stageName = stageNames[stage as unknown as keyof typeof stageNames] || `Stage ${stage}`;
                const percentage = (count / (statistics.total || 1)) * 100;
                
                return (
                  <div key={stage} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600">
                        {stage}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{stageName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{count} items</span>
                      <span className="text-xs text-gray-400">({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Performance recommendations */}
      {overallHealth.status !== 'good' && (
        <div className="velocity-glass-light p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Performance Improvement Recommendations
          </h4>
          
          <div className="space-y-3">
            {statistics.overdue > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Address Overdue Items</p>
                  <p className="text-sm text-blue-700">
                    Focus on the {statistics.overdue} overdue documents first to prevent further SLA breaches
                  </p>
                </div>
              </div>
            )}
            
            {statistics.urgent > 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Prioritize Urgent Items</p>
                  <p className="text-sm text-blue-700">
                    Consider redistributing urgent items across available approvers to balance workload
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Monitor Trends</p>
                <p className="text-sm text-blue-700">
                  Set up automated alerts when overdue percentage exceeds {slaTargets.overdueThreshold}% threshold
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SLAStatusIndicator;