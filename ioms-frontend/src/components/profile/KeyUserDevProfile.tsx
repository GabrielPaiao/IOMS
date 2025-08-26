// src/components/profile/KeyUserDevProfile.tsx
import { CogIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../hooks/useUser';
import { mockApplications } from '../../mocks/dataMocks';


export default function KeyUserDevProfile() {
  const { user } = useUser('key_user');
  
  // Filtrar aplicações atribuídas ao usuário
  const assignedApplications = mockApplications
    .filter(app => 
      app.locations.some(loc => 
        loc.keyUsers?.some(ku => ku.id === user.id)
      )
    )
    .map(app => ({
      id: app.id,
      name: app.name
    }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <CogIcon className="h-5 w-5 mr-1" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-gray-800">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-800">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800">Assigned Applications</h3>
            <div className="mt-4 space-y-2">
              {assignedApplications.map(app => (
                <div key={app.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{app.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}