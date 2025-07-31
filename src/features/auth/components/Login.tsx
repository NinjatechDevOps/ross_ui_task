'use client';

import { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, role: 'admin' | 'user') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!validateEmail(email.trim())) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      const isAdmin = email.trim().toLowerCase() === 'admin@gmail.com';
      localStorage.setItem('email', email.trim());
      localStorage.setItem('role', isAdmin ? 'admin' : 'user');
      onLogin(email.trim(), isAdmin ? 'admin' : 'user');
    } catch (err: unknown) {
      let message = 'Login failed';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-400 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-8 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 border-2 border-fuchsia-200">
        <h2 className="text-3xl font-extrabold mb-2 text-fuchsia-700 drop-shadow">Enter your email to continue</h2>
        <input
          className="px-5 py-3 border-2 border-fuchsia-300 rounded-xl w-full text-black text-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-400 transition"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null); // Clear error when user types
          }}
          placeholder="Email address"
          required
        />
        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl font-extrabold text-lg hover:from-fuchsia-700 hover:to-purple-700 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading || !email.trim()}
        >
          {loading ? 'Checking...' : 'Login'}
        </button>
        {error && <div className="text-red-600 text-base font-semibold text-center w-full">{error}</div>}
      </form>
    </div>
  );
} 