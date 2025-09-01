// src/pages/InviteUserPage.tsx
import { useState } from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { usersService } from '../services/users.service';

export default function InviteUserPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DEV');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await usersService.inviteUser({ 
        email, 
        role: role as 'ADMIN' | 'KEY_USER' | 'DEV' 
      });
      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      setError(error.response?.data?.message || 'Erro ao enviar convite. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-800">Convite Enviado!</h2>
          <p className="mt-2 text-gray-600">
            Enviamos um convite para {email}. O usuário receberá um email com instruções para se cadastrar.
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                setRole('DEV');
                setError('');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Convidar outro usuário
            </button>
            <Link
              to="/profile"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              Voltar ao Perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <Link
          to="/profile"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Voltar ao Perfil
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Convidar Usuário para o IOMS</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Erro ao enviar convite</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Função
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DEV">Desenvolvedor</option>
                <option value="KEY_USER">Key User</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Convite'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}