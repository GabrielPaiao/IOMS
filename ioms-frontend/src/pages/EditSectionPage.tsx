// Adicione o import do useState no início do arquivo
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mockApplications } from '../mocks/dataMocks';
import { useUser } from '../hooks/useUser';

type EditMode = 'environments' | 'locations' | 'keyUsers';

export default function EditSectionPage() {
  const { id, mode } = useParams<{ id: string; mode: EditMode }>();
  const { user } = useUser();
  const application = mockApplications.find(app => app.id === id)!;

  // Componente dinâmico baseado no modo
  const renderSection = () => {
    switch (mode) {
      case 'environments':
        return (
          <EditableList
            items={application.environments}
            onSave={(items: string[]) => console.log('Save envs:', items)}
            editable={user.role === 'admin'}
          />
        );
      
      case 'locations':
        return (
          <EditableList
            items={application.locations.map(loc => loc.code)}
            onSave={(items: string[]) => console.log('Save locations:', items)}
            editable={user.role === 'admin'}
            itemLink={(item: string) => `/applications/${id}/edit/keyUsers?location=${item}`}
          />
        );

      case 'keyUsers':
        // Implementação similar para Key Users
        return <div>Key Users Editor</div>;

      default:
        return <div>Invalid section</div>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">
        Editing {mode} for {application.name}
      </h1>
      {renderSection()}
    </div>
  );
}

// Componente genérico para listas editáveis
function EditableList({ items, onSave, editable, itemLink }: {
  items: string[];
  onSave: (items: string[]) => void;
  editable: boolean;
  itemLink?: (item: string) => string;
}) {
  const [listItems, setListItems] = useState<string[]>(items);
  const [newItem, setNewItem] = useState<string>('');

  const handleAdd = () => {
    if (newItem.trim()) {
      setListItems([...listItems, newItem]);
      setNewItem('');
    }
  };

  return (
    <div>
      <ul className="space-y-2 mb-4">
        {listItems.map((item: string) => (
          <li key={item} className="flex justify-between items-center">
            {itemLink ? (
              <a href={itemLink(item)} className="text-blue-500 hover:underline">
                {item}
              </a>
            ) : (
              <span>{item}</span>
            )}
            {editable && (
              <button 
                onClick={() => setListItems(listItems.filter(i => i !== item))}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {editable && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Add new ${itemLink ? 'location' : 'environment'}`}
            className="border p-2 rounded flex-1"
          />
          <button 
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
          <button 
            onClick={() => onSave(listItems)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save All
          </button>
        </div>
      )}
    </div>
  );
}