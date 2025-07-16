// src/pages/DashboardPage.tsx
export default function DashboardPage() {
  const filters = { status: "pending" }; // Mock inicial
  const stats = { pending: 3, approved: 5 }; // Dados mockados

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <div className="col-span-1 bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Filtros</h3>
        <select className="w-full p-2 border rounded">
          <option>Status: Pendentes</option>
          <option>Aprovadas</option>
        </select>
      </div>
      <div className="col-span-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h4>Solicitações Pendentes</h4>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4>Solicitações Aprovadas</h4>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </div>
        </div>
      </div>
    </div>
  );
}