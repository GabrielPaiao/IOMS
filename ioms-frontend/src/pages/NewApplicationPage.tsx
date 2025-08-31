import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import applicationsService from '../services/applications.service';

export default function NewApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<{
    name: string;
    description: string;
    environments: string[];
    locations: string[];
    version: string;
    keyUsers: string[];
  }>({
    name: '',
    description: '',
    environments: [],
    locations: [],
    version: '',
    keyUsers: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEnvironment = (env: string) => {
    if (env && !form.environments.includes(env)) {
      setForm({ ...form, environments: [...form.environments, env] });
    }
  };

  const handleAddLocation = (loc: string) => {
    if (loc && !form.locations.includes(loc)) {
      setForm({ ...form, locations: [...form.locations, loc] });
    }
  };

  const handleRemoveEnvironment = (env: string) => {
    setForm({ ...form, environments: form.environments.filter(e => e !== env) });
  };

  const handleRemoveLocation = (loc: string) => {
    setForm({ ...form, locations: form.locations.filter(l => l !== loc) });
  };

  const handleAddKeyUser = (email: string) => {
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email) && !form.keyUsers.includes(email)) {
      setForm({ ...form, keyUsers: [...form.keyUsers, email] });
    }
  };

  const handleRemoveKeyUser = (email: string) => {
    setForm({ ...form, keyUsers: form.keyUsers.filter(u => u !== email) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const newApp = await applicationsService.createApplication({
        ...form,
        companyId: user?.companyId || '',
      });
      alert('Aplicação cadastrada com sucesso!');
      if (newApp && newApp.id) {
        navigate(`/applications/${newApp.id}`);
      } else {
        navigate('/applications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar aplicação');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm mt-8">
      <h1 className="text-2xl font-bold mb-6">Nova Aplicação</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Versão</label>
          <input
            type="text"
            name="version"
            value={form.version}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ambientes</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Novo ambiente"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddEnvironment((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="border p-2 rounded-md flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {form.environments.map(env => (
              <span key={env} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {env}
                <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveEnvironment(env)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Localizações</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nova localização"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLocation((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="border p-2 rounded-md flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {form.locations.map(loc => (
              <span key={loc} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {loc}
                <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveLocation(loc)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Key Users</label>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="Email do usuário (ex: user@company.com)"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyUser((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="border p-2 rounded-md flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {form.keyUsers.map(email => (
              <span key={email} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {email}
                <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveKeyUser(email)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Adicione os emails dos usuários que serão Key Users desta aplicação
          </p>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        )}
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Cadastrar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
