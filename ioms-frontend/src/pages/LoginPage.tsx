import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../index.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e : React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFF9B1] font-sans">
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#393939] mb-2">IOMS</h1>
          <p className="text-lg text-[#393939]">
            Intelligent Outage Management for Software
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-8 py-10 w-full max-w-sm">
          <h2 className="text-3xl font-bold text-[#393939] mb-8 text-center">
            Login
          </h2>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                e-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="seu@email.com"
                className="block w-full px-4 py-3 rounded-lg bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition-colors placeholder:text-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Sua senha"
                className="block w-full px-4 py-3 rounded-lg bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition-colors placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-center text-sm">
                {error}
              </div>
            )}
          </form>

          <div className="mt-8 text-center text-sm">
            <Link
              to="/register"
              className="text-[#0066FF] hover:text-[#0052CC] font-medium transition-colors"
            >
              Register as admin!
            </Link>
            <p className="text-[#666666] mt-3">
              or request access in your company´s IOMS space
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-[#393939] text-white text-center py-5 text-xs w-full">
        <p>
          Intelligent Outage Management for Software (IOMS)© <br />
          Created by: Gabriel Pereira Paião <br />
          São Paulo, Brazil, 2025
        </p>
      </footer>
    </div>
  );
}

