import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import '../index.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await authService.resetPassword(token, password);
      setMessage(result.message);
      setIsSuccess(true);
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

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
          {!isSuccess ? (
            <>
              <h2 className="text-3xl font-bold text-[#393939] mb-4 text-center">
                Reset Password
              </h2>
              <p className="text-gray-600 text-sm mb-8 text-center">
                Enter your new password below.
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || !token}
                      placeholder="Enter new password"
                      minLength={6}
                      className="block w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition-colors placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading || !token}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading || !token}
                      placeholder="Confirm new password"
                      minLength={6}
                      className="block w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition-colors placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={isLoading || !token}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full py-3 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-center text-sm">
                    {error}
                  </div>
                )}

                {!token && (
                  <div className="text-center">
                    <Link
                      to="/forgot-password"
                      className="text-[#0066FF] hover:text-[#0052CC] font-medium transition-colors text-sm"
                    >
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-[#393939] mb-4">
                  Password Reset Successfully!
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  {message}
                </p>
                <p className="text-gray-500 text-xs mb-6">
                  You will be redirected to the login page in a few seconds...
                </p>
              </div>
            </>
          )}

          <div className="mt-8 text-center text-sm">
            <Link
              to="/login"
              className="text-[#0066FF] hover:text-[#0052CC] font-medium transition-colors"
            >
              ← Back to Login
            </Link>
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
