// ioms-frontend/src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import LoginPage from "../pages/LoginPage";
import OutageCalendarPage from "../pages/OutageCalendarPage";
import OutageRequestsPage from "../pages/OutageRequestsPage";
import ChatPage from "../pages/ChatPage";
import MyApplicationsPage from "../pages/MyApplicationsPage";
import DashboardPage from "../pages/DashboardPage";
import DateOutagesPage from "../pages/DateOutagesPage";
import OutageDetailsPage from "../pages/OutageDetailsPage";
import MyProfilePage from "../pages/MyProfilePage";
import NewOutageRequestPage from "../pages/NewOutageRequestPage"
import ApplicationDetailsPage from "../pages/ApplicationDetailsPage"
import EditSectionPage from "../pages/EditSectionPage"
import InviteUserPage from "../pages/InviteUserPage";

function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 bg-yellow-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública (sem navbar) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas privadas (com navbar) */}
        <Route path="/" element={<LayoutWithNavbar><Navigate to="/calendar" replace /></LayoutWithNavbar>} />
        <Route path="/calendar" element={<LayoutWithNavbar><OutageCalendarPage /></LayoutWithNavbar>} />
        <Route path="/dashboard" element={<LayoutWithNavbar><DashboardPage /></LayoutWithNavbar>} />
        <Route path="/date/:date" element={<LayoutWithNavbar><DateOutagesPage /></LayoutWithNavbar>} />
        <Route path="/profile" element={<LayoutWithNavbar><MyProfilePage /></LayoutWithNavbar>} />
        <Route path="/requests" element={<LayoutWithNavbar><OutageRequestsPage /></LayoutWithNavbar>} />
        <Route path="/chat" element={<LayoutWithNavbar><ChatPage /></LayoutWithNavbar>} />
        <Route path="/applications" element={<LayoutWithNavbar><MyApplicationsPage /></LayoutWithNavbar>} />
        <Route path="/outages/:id" element={<LayoutWithNavbar><OutageDetailsPage /></LayoutWithNavbar>} />
        <Route path="/outages/new" element={<LayoutWithNavbar><NewOutageRequestPage /></LayoutWithNavbar>} />
        <Route path="/applications" element={<MyApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
        <Route path="/applications/:id/edit/:mode" element={<EditSectionPage />} />
        <Route path="/invite-user" element={<InviteUserPage />} />

        {/* Fallback para rotas não encontradas */}
        <Route path="*" element={<LayoutWithNavbar><Navigate to="/calendar" replace /></LayoutWithNavbar>} />
      </Routes>
    </BrowserRouter>
  );
}