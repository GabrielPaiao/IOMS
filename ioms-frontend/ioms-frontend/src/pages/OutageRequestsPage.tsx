// src/pages/OutageRequestsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authMock, outageDetailsMock } from '../mocks/dataMocks';
import OutageList from '../components/outageRequests/OutageList';
import OutageDetailsPanel from '../components/outageRequests/OutageDetailsPanel';
import FilterControls from '../components/outageRequests/FilterControls';
import type { Outage } from '../types/outage';

export default function OutageRequestsPage() {
  const navigate = useNavigate();
  const [currentUserType, setCurrentUserType] = useState<'dev' | 'key_user' | 'admin'>('key_user');
  
  // Get user based on selection
  const user = 
    currentUserType === 'key_user' ? authMock.key_user :
    currentUserType === 'dev' ? authMock.dev :
    authMock.admin;
  
  const [selectedOutage, setSelectedOutage] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: Outage['status'];
    criticality?: Outage['criticality'];
    location?: string;
    environment?: string;
  }>({});

  // Apply default filters on initial load
  useEffect(() => {
    setFilters({});
  }, [user]);
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Clear selection if it no longer matches filters
    if (selectedOutage) {
      const selected = outageDetailsMock.find(o => o.id === selectedOutage);
      if (selected && !matchesFilters(selected, newFilters)) {
        setSelectedOutage(null);
      }
    }
  };

  const matchesFilters = (outage: Outage, filter: typeof filters) => {
    if (filter.status && outage.status !== filter.status) return false;
    if (filter.criticality && outage.criticality !== filter.criticality) return false;
    if (filter.location && outage.location !== filter.location) return false;
    if (filter.environment && !outage.environment.includes(filter.environment)) return false;
    return true;
  };

  // Filter outages considering:
  // 1. Applied filters
  // 2. User permissions
  const filteredOutages = outageDetailsMock.filter(outage => {
    // Check active filters
    if (filters.status && outage.status !== filters.status) return false;
    if (filters.criticality && outage.criticality !== filters.criticality) return false;
    if (filters.location && outage.location !== filters.location) return false;
    if (filters.environment && !outage.environment.includes(filters.environment)) return false;
    
    // Check user permissions
    if (user.role === 'key_user' && !user.locations.includes(outage.location)) return false;
    if (user.role === 'dev' && !user.locations.includes(outage.location)) return false;
    
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Profile selector (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-3 shadow-lg rounded-lg z-50 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Switch User Role:
          </label>
          <select
            value={currentUserType}
            onChange={(e) => setCurrentUserType(e.target.value as 'dev' | 'key_user' | 'admin')}
            className="block w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="key_user">Key User</option>
            <option value="dev">Developer</option>
            <option value="admin">Admin</option>
          </select>
          <div className="mt-2 text-xs text-gray-500">
            Current: {user.role} ({user.locations.join(', ')})
          </div>
        </div>
      )}

      <div className="border-b p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-semibold text-gray-800">
            Outage Management
            {user.role === 'key_user' && user.locations.length === 1 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({user.locations[0]})
              </span>
            )}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Showing {filteredOutages.length} outage(s)
            </span>
            {user.role === 'dev' && (
              <button
                onClick={() => navigate('/outages/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                + New Outage
              </button>
            )}
          </div>
        </div>
        
        <FilterControls 
          userRole={user.role}
          userLocations={user.locations}
          defaultFilters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Outage list */}
        <div className="w-2/5 p-4 border-r overflow-y-auto">
          <OutageList 
            onSelectOutage={setSelectedOutage} 
            selectedId={selectedOutage}
            outages={filteredOutages}
            showLocation={user.role !== 'admin'}
          />
        </div>

        {/* Details panel */}
        <div className="w-3/5 p-6 overflow-y-auto">
          {selectedOutage ? (
            <OutageDetailsPanel 
              outageId={selectedOutage} 
              userRole={user.role}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No outage selected</p>
              <p className="text-sm mt-1 text-gray-400 text-center">
                {filters.status 
                  ? `Showing only ${filters.status} outages` 
                  : 'Showing all outages'}
                {filters.location && ` for ${filters.location}`}
                {filters.environment && ` in ${filters.environment}`}
              </p>
              <button 
                onClick={() => setFilters({})}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}