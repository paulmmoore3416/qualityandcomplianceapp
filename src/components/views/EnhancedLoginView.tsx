import React, { useState } from 'react';
import { Lock, User, AlertCircle, Shield, Github, Chrome, } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

// Microsoft logo component
const MicrosoftLogo = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" fill="#f25022"/>
    <rect x="11" width="10" height="10" fill="#00a4ef"/>
    <rect y="11" width="10" height="10" fill="#7fba00"/>
    <rect x="11" y="11" width="10" height="10" fill="#ffb900"/>
  </svg>
);

export const EnhancedLoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithSSO, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    const success = await login(username, password);

    if (!success) {
      setError('Invalid username or password');
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'github' | 'microsoft') => {
    setError('');
    try {
      const success = await loginWithSSO(provider);
      if (!success) {
        setError(`Failed to authenticate with ${provider}`);
      }
    } catch (err) {
      setError(`SSO authentication error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-primary-900 to-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            MedTech Compliance Suite
          </h1>
          <p className="text-surface-300 text-lg">
            ISO 13485 Quality Management System
          </p>
          <p className="text-surface-400 text-sm mt-1">
            21 CFR Part 11 Compliant • ALCOA+ Data Integrity
          </p>
        </div>

        {/* Login Card with transparency */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-surface-900 mb-6 text-center">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-surface-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSSOLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-surface-200 text-surface-700 font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSSOLogin('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Github className="w-5 h-5" />
              <span>Sign in with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => handleSSOLogin('microsoft')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <MicrosoftLogo />
              <span>Sign in with Microsoft</span>
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Demo Credentials Available:
            </p>
            <div className="text-xs text-blue-800 space-y-1.5 grid grid-cols-2 gap-x-4">
              <p><strong>Demo:</strong> demo / demo2026</p>
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>QA Mgr:</strong> qa_manager / qa123</p>
              <p><strong>Engineer:</strong> engineer / eng123</p>
              <p className="col-span-2"><strong>Auditor:</strong> auditor / audit123</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-center text-xs text-surface-500">
            <p>Protected by multi-factor authentication</p>
            <p>All sessions are encrypted and monitored</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-surface-300 text-sm">
          <p className="font-medium">FDA 21 CFR Part 11 & Part 820 Compliant</p>
          <p className="mt-2">© 2026 MedTech Compliance Solutions LLC</p>
          <p className="text-xs mt-1 text-surface-400">
            Katie Emma & Paul Moore • St. Louis, MO
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
