// src/pages/DateOutagesPage.tsx
import { useParams, Link } from "react-router-dom";

// Mock data - apenas outages aprovadas
const mockOutages = [
  {
    id: "101",
    application: "ERP System",
    start: "2025-07-20T09:00:00",
    end: "2025-07-20T11:00:00",
    requester: "john.doe@company.com",
    location: "São José dos Campos (SJC)"
  },
  {
    id: "103",
    application: "API Gateway",
    start: "2025-07-20T14:00:00",
    end: "2025-07-20T15:30:00",
    requester: "admin@company.com",
    location: "Guararema (GUA)"
  }
]//.filter(outage => outage.status === 'approved'); // Filtro garantido

export default function DateOutagesPage() {
  const { date } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Outages Aprovadas em {new Date(date!).toLocaleDateString()}</h1>
      
      <div className="space-y-4">
        {mockOutages.map(outage => (
          <Link 
            to={`/outages/${outage.id}`} 
            key={outage.id}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{outage.application}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(outage.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                  {new Date(outage.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span className="text-sm text-gray-500">{outage.location}</span>
            </div>
            <p className="mt-2 text-sm">
              <span className="font-medium">Requisitado por:</span> {outage.requester}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
