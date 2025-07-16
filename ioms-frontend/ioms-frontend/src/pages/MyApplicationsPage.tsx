// src/pages/MyApplicationsPage.tsx
export default function MyApplicationsPage() {
  const apps = [
    { name: 'ERP System', role: 'Maintainer' },
    { name: 'Database Cluster', role: 'Viewer' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{app.name}</h3>
            <p className="text-sm text-gray-600">Role: {app.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}