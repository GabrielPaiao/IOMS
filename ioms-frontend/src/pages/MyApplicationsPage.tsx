// src/pages/MyApplicationsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Application } from '../types/outage';
import { mockApplications } from '../mocks/dataMocks';
import { useUser } from '../hooks/useUser';

export default function MyApplicationsPage() {
  const { user } = useUser();
  const [applications] = useState<Application[]>(mockApplications);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
        {user.role === 'admin' && (
          <Link 
            to="/applications/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-1"
          >
            <span>+</span>
            <span>New Application</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Link 
            to={`/applications/${app.id}`}
            key={app.id}
            className="border border-gray-200 p-5 rounded-lg hover:shadow-md transition-all hover:border-blue-200 hover:translate-y-[-2px] bg-white"
          >
            <div className="flex flex-col h-full">
              <h2 className="font-bold text-lg text-gray-800 mb-1">{app.name}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {app.description || 'No description available'}
              </p>
              
              <div className="mt-auto">
                <div className="flex gap-2">
                  <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">
                    {app.environments.length} Environment{app.environments.length !== 1 && 's'}
                  </span>
                  <br></br>
                  <span className="bg-green-50 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
                    {app.locations.length} Site{app.locations.length !== 1 && 's'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}