// src/pages/OutageDetailsPage.tsx
import { useParams } from "react-router-dom";

// Mock data - substituir por API depois
const mockOutageDetails = {
  id: "101",
  application: "ERP System",
  start: "2025-07-20T09:00:00",
  end: "2025-07-20T11:00:00",
  requester: "john.doe@company.com",
  status: "approved",
  description: "Atualização de segurança crítica para o módulo financeiro",
  location: "Datacenter Principal",
  criticality: "Alta",
  approver: "admin@company.com"
};

export default function OutageDetailsPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Detalhes da Outage #{id}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Aplicação</h3>
              <p>{mockOutageDetails.application}</p>
            </div>
            <div>
              <h3 className="font-bold">Localização</h3>
              <p>{mockOutageDetails.location}</p>
            </div>
            <div>
              <h3 className="font-bold">Horário</h3>
              <p>
                {new Date(mockOutageDetails.start).toLocaleString()} - <br />
                {new Date(mockOutageDetails.end).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold">Requisitado por</h3>
              <p>{mockOutageDetails.requester}</p>
            </div>
            <div>
              <h3 className="font-bold">Criticidade</h3>
              <p>{mockOutageDetails.criticality}</p>
            </div>
            <div>
              <h3 className="font-bold">Status</h3>
              <p className={`inline-flex px-3 py-1 rounded-full text-sm ${
                mockOutageDetails.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {mockOutageDetails.status === 'approved' ? 'Aprovado' : 'Pendente'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-bold">Descrição</h3>
          <p className="mt-2">{mockOutageDetails.description}</p>
        </div>
      </div>
    </div>
  );
}