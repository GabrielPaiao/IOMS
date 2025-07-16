// ioms-frontend/src/pages/LoginPage.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleLogin() {
    localStorage.setItem("user", JSON.stringify({ email, role: "admin" }));
    navigate("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">IOMS - Login</h1>
      <input
        className="p-2 border border-gray-300 rounded mb-2"
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleLogin}
      >
        Entrar
      </button>
    </div>
  );
}
