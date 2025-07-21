// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  MapPinIcon,
  ServerIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  dashboardStats, 
  getFilterOptions
} from '../mocks/dataMocks';
import type { CriticalityLevel } from '../types/outage';

export default function DashboardPage() {
  // Filter states
  const [filters, setFilters] = useState({
    application: '',
    environment: '',
    location: '',
    criticality: '',
    timeRange: '30'
  });

  // Get data from mocks
  const stats = dashboardStats;
  const filterOptions = getFilterOptions();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Format criticality data for display
  const mostCommonCriticality = Object.entries(stats.outages.byCriticality)
    .sort((a, b) => b[1] - a[1])[0][0] as CriticalityLevel;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                  <select
                    name="application"
                    value={filters.application}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Applications</option>
                    {filterOptions.applications.map(app => (
                      <option key={app} value={app}>{app}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                  <select
                    name="environment"
                    value={filters.environment}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Environments</option>
                    {filterOptions.environments.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    {filterOptions.locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
                  <select
                    name="criticality"
                    value={filters.criticality}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Criticalities</option>
                    {filterOptions.criticalities.map(crit => (
                      <option key={crit} value={crit}>{crit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                  <select
                    name="timeRange"
                    value={filters.timeRange}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {filterOptions.timeRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Outages Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Approved Outages"
                value={stats.outages.approved}
                icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
                trend={stats.approvalMetrics.trend}
                change={`${stats.outages.approved} total`}
                bgColor="bg-green-50"
                textColor="text-green-600"
              />
              <MetricCard 
                title="Rejected Outages"
                value={stats.outages.rejected}
                icon={<XCircleIcon className="h-6 w-6 text-red-500" />}
                trend="down"
                change={`${stats.outages.rejected} total`}
                bgColor="bg-red-50"
                textColor="text-red-600"
              />
              <MetricCard 
                title="Scheduled Outages"
                value={stats.outages.scheduled}
                icon={<CalendarIcon className="h-6 w-6 text-blue-500" />}
                trend="up"
                change={`${stats.outages.scheduled} total`}
                bgColor="bg-blue-50"
                textColor="text-blue-600"
              />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Outage Average Time"
                value={stats.timing.outageDuration.average}
                icon={<ClockIcon className="h-6 w-6 text-purple-500" />}
                trend={stats.timing.outageDuration.trend}
                change={`Min: ${stats.timing.outageDuration.min} | Max: ${stats.timing.outageDuration.max}`}
                bgColor="bg-purple-50"
                textColor="text-purple-600"
              />
              <MetricCard 
                title="Response Average Time"
                value={stats.timing.responseTime.average}
                icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
                trend={stats.timing.responseTime.trend}
                change={`Min: ${stats.timing.responseTime.min} | Max: ${stats.timing.responseTime.max}`}
                bgColor="bg-yellow-50"
                textColor="text-yellow-600"
              />
              <MetricCard 
                title="Approval Rate"
                value={`${stats.approvalMetrics.rate}%`}
                icon={<ChartBarIcon className="h-6 w-6 text-indigo-500" />}
                trend={stats.approvalMetrics.trend}
                change={`Top approver: ${stats.approvalMetrics.byApprover[0].name} (${stats.approvalMetrics.byApprover[0].count})`}
                bgColor="bg-indigo-50"
                textColor="text-indigo-600"
              />
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Most Common Criticality"
                value={mostCommonCriticality}
                icon={<ChartBarIcon className="h-6 w-6 text-pink-500" />}
                trend="stable"
                change={`${stats.outages.byCriticality[mostCommonCriticality]} occurrences`}
                bgColor="bg-pink-50"
                textColor="text-pink-600"
              />
              <MetricCard 
                title="Top Requester"
                value={stats.topPerformers.requesters[0].name}
                icon={<UserIcon className="h-6 w-6 text-teal-500" />}
                trend="up"
                change={`${stats.topPerformers.requesters[0].count} requests`}
                bgColor="bg-teal-50"
                textColor="text-teal-600"
              />
              <div className="grid grid-cols-1 gap-6">
                <MetricCard 
                  title="Top Site"
                  value={stats.topPerformers.sites[0].name}
                  icon={<MapPinIcon className="h-6 w-6 text-orange-500" />}
                  trend="up"
                  change={`${stats.topPerformers.sites[0].count} outages`}
                  bgColor="bg-orange-50"
                  textColor="text-orange-600"
                />
                <MetricCard 
                  title="Top Environment"
                  value={stats.topPerformers.environments[0].name}
                  icon={<ServerIcon className="h-6 w-6 text-cyan-500" />}
                  trend="up"
                  change={`${stats.topPerformers.environments[0].count} outages`}
                  bgColor="bg-cyan-50"
                  textColor="text-cyan-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improved MetricCard component
function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  change, 
  bgColor, 
  textColor 
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  change?: string;
  bgColor: string;
  textColor: string;
}) {
  const trendIcons = {
    up: <ArrowUpIcon className="h-4 w-4 text-green-500" />,
    down: <ArrowDownIcon className="h-4 w-4 text-red-500" />,
    stable: <span className="h-4 w-4 text-gray-500">→</span>
  };

  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-sm h-full flex flex-col`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-1 rounded-full ${textColor.replace('text-', 'bg-')} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className={`text-2xl font-semibold ${textColor}`}>{value}</p>
        {trend && change && (
          <div className="flex items-center mt-2 gap-1">
            {trendIcons[trend]}
            <span className="text-xs text-gray-500">
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}