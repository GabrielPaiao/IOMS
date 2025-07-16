// src/pages/DateOutagesPage.tsx
import { useParams } from "react-router-dom";

export default function DateOutagesPage() {
  const { date } = useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Outages on {date}</h1>
      <div className="space-y-2">
        {[101, 102].map(id => (
          <div key={id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">Outage #{id}</h3>
            <p className="text-sm text-gray-600">ERP System Maintenance</p>
            <p className="text-sm">9:00 AM - 11:00 AM</p>
          </div>
        ))}
      </div>
    </div>
  );
}