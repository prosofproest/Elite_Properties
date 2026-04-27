/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // Sign out any existing session when login page loads
    // This forces re-authentication every time
    signOut(auth).catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome back.');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-accent rounded-sm flex items-center justify-center text-primary font-black text-2xl">E</div>
            <span className="font-serif font-bold text-3xl tracking-tight text-white">Elite <span className="text-accent italic">Properties</span></span>
          </div>
          <p className="text-white/50 font-bold uppercase tracking-[0.2em] text-xs">Administrative Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-sm shadow-2xl relative overflow-hidden">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
          
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm font-medium mb-8">Please enter your credentials to access the dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
                  placeholder="admin@eliteproperties.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Elite Properties Mumbai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
