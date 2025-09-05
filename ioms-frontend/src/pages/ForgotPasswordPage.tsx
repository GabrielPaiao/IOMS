import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/auth.service";
import '../index.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      setMessage(result.message);
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
          {!isSubmitted ? (
            <>
              <h2 className="text-3xl font-bold text-[#393939] mb-4 text-center">
                Forgot Password
              </h2>
              <p className="text-gray-600 text-sm mb-8 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="your@email.com"
                    className="block w-full px-4 py-3 rounded-lg bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#0066FF] transition-colors placeholder:text-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>

                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-center text-sm">
                    {error}
                  </div>
                )}
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-[#393939] mb-4">
                  Email Sent!
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  {message}
                </p>
                <p className="text-gray-500 text-xs mb-6">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
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
