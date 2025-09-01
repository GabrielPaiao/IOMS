//ioms-frontend/src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

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
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-300">
      {/* Logo à esquerda */}
      <Link to="/" className="text-xl font-bold text-[#393939]">IOMS</Link>

      {/* Abas centralizadas */}
      <div className="flex space-x-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 text-sm ${location.pathname === item.path 
              ? "font-bold text-[#393939] border-b-2 border-[#FFD700]" 
              : "text-gray-600 hover:text-[#393939]"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Notificações à direita */}
      <NotificationDropdown />
    </nav>
  );
}