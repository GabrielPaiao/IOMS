// src/pages/OutageRequestsPage.tsx
export default function OutageRequestsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Outage Requests</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Filtros podem ser adicionados aqui */}
        <div className="divide-y">
          {/* Lista mockada - substituir por dados reais depois */}
          {[1, 2, 3].map((id) => (
            <div key={id} className="py-3">
              <div className="flex justify-between">
                <span>Request #{id}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  Pending
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}