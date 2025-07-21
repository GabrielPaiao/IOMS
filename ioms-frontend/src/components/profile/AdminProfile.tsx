// src/components/profile/AdminProfile.tsx
import { CogIcon, EnvelopeIcon, UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { outageDetailsMock } from '../../mocks/dataMocks';

interface AdminStats {
  totalUsers: number;
  activeOutages: number;
}

export default function AdminProfile() {
  const { user } = useUser('admin');

  const adminStats: AdminStats = {
    totalUsers: 42, // Você pode substituir por um valor dinâmico depois
    activeOutages: outageDetailsMock.filter(o => o.status === 'approved').length
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <div className="flex space-x-4">
          <Link 
            to="/invite-user" 
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Invite an user
          </Link>
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <CogIcon className="h-5 w-5 mr-1" />
            Edit Profile
          </button>
        </div>
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
            <h3 className="text-lg font-medium text-gray-800">Company Information</h3>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Total Users</h4>
                <p className="text-2xl font-bold mt-2">{adminStats.totalUsers}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Active Outages</h4>
                <p className="text-2xl font-bold mt-2">{adminStats.activeOutages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}