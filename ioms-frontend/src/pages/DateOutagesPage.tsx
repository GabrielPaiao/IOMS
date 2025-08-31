// src/pages/DateOutagesPage.tsx
import { useParams, Link } from "react-router-dom";
import type { Outage } from '../types/outage';

// Mock data - apenas outages aprovadas
import outagesService from '../services/outages.service';
import { useEffect, useState } from 'react';

export default function DateOutagesPage() {
  const { date } = useParams();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutages = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await outagesService.getOutages({ startDate: date, status: 'approved' });
        setOutages(result);
      } catch (err) {
        setError('Erro ao carregar outages.');
      } finally {
        setLoading(false);
      }
    };
    if (date) fetchOutages();
  }, [date]);
  if (loading) {
    return <div>Carregando outages...</div>;
  }
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Outages Aprovadas em {date ? new Date(date).toLocaleDateString() : ''}</h1>
      <div className="space-y-4">
        {outages.length === 0 ? (
          <div className="text-gray-500">Nenhuma outage aprovada para esta data.</div>
        ) : (
          outages.map((outage: any) => (
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
          ))
        )}
      </div>
    </div>
  );
}
