// src/components/outageRequests/FilterControls.tsx
import { useState } from 'react';
import type { Outage } from '../../types/outage';

interface FilterControlsProps {
  userRole?: 'dev' | 'key_user' | 'admin';
  userLocations?: string[]; // Novo prop para os sites do usuário
  defaultFilters: {
    status?: Outage['status'];
    criticality?: Outage['criticality'];
    location?: string;
  };
  onFilterChange: (filters: {
    status?: Outage['status'];
    criticality?: Outage['criticality'];
    location?: string;
  }) => void;
}

// Lista completa de sites disponíveis
const ALL_SITES = [
  { code: 'GUA', name: 'Guararema' },
  { code: 'SJC', name: 'São José dos Campos' },
  { code: 'OTHER', name: 'Outro Site' }
];

export default function FilterControls({ 
  userRole, 
  userLocations = [], 
  defaultFilters,
  onFilterChange 
}: FilterControlsProps) {
  const [localFilters, setLocalFilters] = useState({
    status: defaultFilters.status,
    criticality: defaultFilters.criticality,
    location: defaultFilters.location
  });

  // Filtra sites disponíveis baseado na role e nas locations do usuário
  const availableSites = userRole === 'admin' 
    ? ALL_SITES 
    : ALL_SITES.filter(site => userLocations.includes(site.code));

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status filter */}
      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status-filter"
          value={localFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Criticality filter */}
      <div>
        <label htmlFor="criticality-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Criticality
        </label>
        <select
          id="criticality-filter"
          value={localFilters.criticality || ''}
          onChange={(e) => handleFilterChange('criticality', e.target.value as Outage['criticality'] || undefined)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">All Levels</option>
          <option value="1 (highest)">1 (Highest)</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5 (lowest)">5 (Lowest)</option>
        </select>
      </div>

      {/* Location filter - agora disponível para todos com sites múltiplos */}
      {availableSites.length > 1 && (
        <div>
          <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location-filter"
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Locations</option>
            {availableSites.map(site => (
              <option key={site.code} value={site.code}>
                {site.name} ({site.code})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}