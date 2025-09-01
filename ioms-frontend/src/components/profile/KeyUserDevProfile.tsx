// src/components/profile/KeyUserDevProfile.tsx

import { useState, useEffect } from 'react';
import { CogIcon, EnvelopeIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/users.service';



export default function KeyUserDevProfile() {
  const { user } = useUser();
  const { logout } = useAuth();
  const [keyUserApplications, setKeyUserApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchKeyUserApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Busca apenas as aplicações onde o usuário é Key User
        if (user.role?.toUpperCase() === 'KEY_USER') {
          const applications = await usersService.getMyApplications();
          setKeyUserApplications(applications);
        } else {
          // Para outros roles, não mostrar aplicações Key User
          setKeyUserApplications([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar aplicações');
      } finally {
        setLoading(false);
      }
    };
    
    fetchKeyUserApplications();
  }, [user?.id, user?.role]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex space-x-4">
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <CogIcon className="h-5 w-5 mr-1" />
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">{user?.lastName}, {user?.firstName}</h2>
            <p className="text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-gray-800">{user?.lastName}, {user?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção específica para KEY_USER */}
          {user?.role?.toUpperCase() === 'KEY_USER' && (
            <div>
              <h3 className="text-lg font-medium text-gray-800">Key User Applications</h3>
              <p className="text-sm text-gray-600 mb-4">Applications where you serve as a Key User</p>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="text-gray-500">Carregando aplicações...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : keyUserApplications.length === 0 ? (
                  <div className="text-gray-500 bg-gray-50 rounded-lg p-4 text-center">
                    Você não é Key User de nenhuma aplicação no momento.
                  </div>
                ) : (
                  keyUserApplications.map(app => (
                    <div key={app.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          </div>
                          {app.description && (
                            <p className="text-gray-600 text-sm mb-3">{app.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ambientes */}
                            {app.environments && app.environments.length > 0 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Environments</label>
                                <div className="flex flex-wrap gap-1">
                                  {app.environments.map((env: any, index: number) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                                    >
                                      {env.environment || env}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Localizações */}
                            {app.locations && app.locations.length > 0 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Locations</label>
                                <div className="flex flex-wrap gap-1">
                                  {app.locations.map((location: any, index: number) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {location.name || location}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}