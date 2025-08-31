// ioms-frontend/src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import OutageCalendarPage from "../pages/OutageCalendarPage";
import OutageRequestsPage from "../pages/OutageRequestsPage";
import ChatPage from "../pages/ChatPage";
import MyApplicationsPage from "../pages/MyApplicationsPage";
import DashboardPage from "../pages/DashboardPage";
import DateOutagesPage from "../pages/DateOutagesPage";
import OutageDetailsPage from "../pages/OutageDetailsPage";
import MyProfilePage from "../pages/MyProfilePage";
import NewOutageRequestPage from "../pages/NewOutageRequestPage";
import ApplicationDetailsPage from "../pages/ApplicationDetailsPage";
import EditSectionPage from "../pages/EditSectionPage";
import InviteUserPage from "../pages/InviteUserPage";
import RegisterPage from "../pages/RegisterPage";
import NewApplicationPage from "../pages/NewApplicationPage";
import EditApplicationPage from "../pages/EditApplicationPage";

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
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <Navigate to="/dashboard" replace />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <DashboardPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <OutageCalendarPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/requests" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <OutageRequestsPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/outages/new" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <NewOutageRequestPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/outages/:id" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <OutageDetailsPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/date/:date" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <DateOutagesPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/applications" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <MyApplicationsPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/applications/new" element={
          <ProtectedRoute requiredRole="ADMIN">
            <LayoutWithNavbar>
              <NewApplicationPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/applications/:id" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <ApplicationDetailsPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/applications/:id/edit" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <EditApplicationPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/applications/:id/edit/:mode" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <EditSectionPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <MyProfilePage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <ChatPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
        
        <Route path="/invite-user" element={
          <ProtectedRoute requiredRole="ADMIN">
            <LayoutWithNavbar>
              <InviteUserPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />

        {/* Fallback para rotas não encontradas */}
        <Route path="*" element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <Navigate to="/dashboard" replace />
            </LayoutWithNavbar>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}