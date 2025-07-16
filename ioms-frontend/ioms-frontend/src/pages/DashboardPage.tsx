// ioms-frontend/src/pages/DashboardPage.tsx
export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Bem-vindo, {user.email}!</h2>
      <p>Você está logado como: <strong>{user.role}</strong></p>
    </div>
  );
}
