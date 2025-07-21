import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockApplications } from '../mocks/dataMocks';
import { useUser } from '../hooks/useUser';
import CriticalityBadge from '../components/outageRequests/CriticalityBadge';

export default function ApplicationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [application, setApplication] = useState(
    mockApplications.find(app => app.id === id)!
  );

  const handleSave = (field: keyof typeof application, value: string) => {
    const updated = { ...application, [field]: value };
    setApplication(updated);
    // POST para API aqui
    console.log('Saving:', field, value);
  };

  // Opções de vitalidade para o select
  const vitalityOptions: Array<{ value: string; label: string }> = [
    { value: '1 (highest)', label: '1 (Highest)' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5 (lowest)', label: '5 (Lowest)' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{application.name}</h1>
        <Link 
          to="/applications" 
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back to applications
        </Link>
      </div>

      <div className="space-y-6">
        {/* Campo: Description */}
        <EditableField
          label="Description"
          value={application.description}
          onSave={(value) => handleSave('description', value)}
          editable={user.role === 'admin'}
          inputType="textarea"
        />

        {/* Campo: Vitality */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vitality
          </label>
          {user.role === 'admin' ? (
            <select
              value={application.vitality}
              onChange={(e) => handleSave('vitality', e.target.value)}
              className="border p-2 rounded-md w-full max-w-xs"
            >
              {vitalityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <CriticalityBadge criticality={application.vitality} />
              <span className="text-gray-700">
                {vitalityOptions.find(o => o.value === application.vitality)?.label}
              </span>
            </div>
          )}
        </div>

        {/* Seções clicáveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <SectionCard 
            title="Environments"
            count={application.environments.length}
            to={`/applications/${id}/edit/environments`}
            icon="🌐"
          />
          <SectionCard 
            title="Locations"
            count={application.locations.length}
            to={`/applications/${id}/edit/locations`}
            icon="📍"
          />
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar melhorado
function EditableField({ 
  label, 
  value, 
  onSave, 
  editable,
  inputType = 'text'
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  editable: boolean;
  inputType?: 'text' | 'textarea';
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {isEditing ? (
        <div className="space-y-2">
          {inputType === 'textarea' ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border p-2 rounded-md w-full h-24"
            />
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="border p-2 rounded-md w-full"
            />
          )}
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm"
            >
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-800 px-4 py-1 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-gray-800 break-words">
            {value || <span className="text-gray-400">Not specified</span>}
          </p>
          {editable && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Componente SectionCard melhorado
function SectionCard({ 
  title, 
  count, 
  to,
  icon
}: {
  title: string;
  count: number;
  to: string;
  icon?: string;
}) {
  return (
    <Link 
      to={to}
      className="border p-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
    >
      {icon && <span className="text-xl">{icon}</span>}
      <div>
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {count} {count === 1 ? 'item' : 'items'}
        </p>
      </div>
    </Link>
  );
}