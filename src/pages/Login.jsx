import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        usernameOrEmail,
        password
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Welcome back!', {
  position: "top-center"
});
      navigate('/admin/users');
      
    } catch (error) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : 'Invalid credentials or account blocked';
        
      toast.error(errorMessage, {
  position: "top-center"
});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Full-screen background image setup
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('/elephant-bg.png')` }}
    >
      {/* Optional dark overlay to make the form pop even more */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* 2. Glassmorphism Form Card */}
      <div className="relative max-w-md w-full p-8 z-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] bg-white/20 backdrop-blur-sm border border-white/40 lg:mt-15 sm:mt-25">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-600 mt-1 font-medium">Manage ElephantGuard securely</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username or Email</label>
            <input
              type="text"
              required
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="admin@elephantguard.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:hover:shadow-none mt-4"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;