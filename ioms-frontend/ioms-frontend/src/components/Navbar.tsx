//ioms-frontend/src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { name: "Outage Calendar", path: "/calendar" },
  { name: "Outage Requests", path: "/requests" },
  { name: "Chat", path: "/chat" },
  { name: "My Applications", path: "/applications" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "My Profile", path: "/profile" }
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      {/* Logo à esquerda */}
      <Link to="/" className="text-xl font-bold text-gray-800">IOMS</Link>

      {/* Abas centralizadas */}
      <div className="flex space-x-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 text-sm ${location.pathname === item.path 
              ? "font-bold text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-600 hover:text-gray-900"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Ícone de notificações à direita */}
      <button className="relative p-1 text-gray-600 hover:text-gray-900">
        <BellIcon className="h-6 w-6" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </nav>
  );
}