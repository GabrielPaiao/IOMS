// src/pages/MyProfilePage.tsx
import { useUser } from '../hooks/useUser';
import AdminProfile from '../components/profile/AdminProfile';
import KeyUserDevProfile from '../components/profile/KeyUserDevProfile';

export default function MyProfilePage() {
  const { user } = useUser(); // Pega o usuário logado

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'admin' ? (
        <AdminProfile />
      ) : (
        <KeyUserDevProfile />
      )}
    </div>
  );
}