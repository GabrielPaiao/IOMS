import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockApplications } from '../mocks/dataMocks';
import type { Application } from '../types/outage';

type EditMode = 'environments' | 'locations' | 'keyUsers';

export default function EditSectionPage() {
  const { id, mode } = useParams<{ id: string; mode: EditMode }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da aplicação
  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Por enquanto, usar mock data
        const app = mockApplications.find(app => app.id === id);
        if (app) {
          setApplication(app);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load application');
        console.error('Error loading application:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [id]);

  const handleSave = async (items: string[], type: 'environments' | 'locations') => {
    if (!application) return;

    try {
      // Por enquanto, apenas atualizar estado local
      // TODO: Implementar chamada para API real
      const updatedApp = { ...application };
      
      if (type === 'environments') {
        updatedApp.environments = items;
      } else if (type === 'locations') {
        updatedApp.locations = items.map(loc => ({ 
          code: loc as any, 
          keyUsers: [],
          description: '' 
        }));
      }
      
      setApplication(updatedApp);
      
      // Feedback visual
      alert(`${type} updated successfully!`);
      
      // TODO: Salvar na API
      console.log('Saving to API:', type, items);
      
    } catch (err) {
      alert(`Error updating ${type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 text-red-800 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Application not found</div>
      </div>
    );
  }

  // Componente dinâmico baseado no modo
  const renderSection = () => {
    switch (mode) {
      case 'environments':
        return (
          <EditableList
            items={application.environments}
            onSave={(items: string[]) => handleSave(items, 'environments')}
            editable={user?.role?.toUpperCase() === 'ADMIN'}
            title="Environments"
            placeholder="Add new environment"
          />
        );
      
      case 'locations':
        return (
          <EditableList
            items={application.locations.map(loc => loc.code)}
            onSave={(items: string[]) => handleSave(items, 'locations')}
            editable={user?.role?.toUpperCase() === 'ADMIN'}
            title="Locations"
            placeholder="Add new location"
            itemLink={(item: string) => `/applications/${id}/edit/keyUsers?location=${item}`}
          />
        );

      case 'keyUsers':
        return <KeyUsersEditor applicationId={id || ''} />;

      default:
        return <div>Invalid section</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          Editing {mode} for {application.name}
        </h1>
        <button
          onClick={() => navigate(`/applications/${id}`)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Back to Application
        </button>
      </div>
      {renderSection()}
    </div>
  );
}

// Componente genérico para listas editáveis
function EditableList({ 
  items, 
  onSave, 
  editable, 
  title,
  placeholder,
  itemLink 
}: {
  items: string[];
  onSave: (items: string[]) => void;
  editable: boolean;
  title: string;
  placeholder: string;
  itemLink?: (item: string) => string;
}) {
  const [listItems, setListItems] = useState<string[]>(items);
  const [newItem, setNewItem] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    if (newItem.trim() && !listItems.includes(newItem.trim())) {
      setListItems([...listItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (itemToRemove: string) => {
    setListItems(listItems.filter(item => item !== itemToRemove));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(listItems);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      
      <ul className="space-y-2 mb-6">
        {listItems.map((item: string) => (
          <li key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            {itemLink ? (
              <a href={itemLink(item)} className="text-blue-500 hover:underline">
                {item}
              </a>
            ) : (
              <span className="text-gray-800">{item}</span>
            )}
            {editable && (
              <button 
                onClick={() => handleRemove(item)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {editable && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="border p-2 rounded-md flex-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={handleAdd}
              disabled={!newItem.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              disabled={isSaving || listItems.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
            
            {listItems.length === 0 && (
              <span className="text-sm text-gray-500 self-center">
                No {title.toLowerCase()} to save
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para editar Key Users (placeholder para implementação futura)
function KeyUsersEditor({ applicationId }: { applicationId: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Users Management</h2>
      <div className="text-center py-8 text-gray-500">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="font-medium text-lg">Key Users Management</h3>
        <p className="text-sm mt-2">This feature will be implemented in the next phase</p>
        <p className="text-xs mt-1">Application ID: {applicationId}</p>
      </div>
    </div>
  );
}