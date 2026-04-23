import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Users, Newspaper, FileText, LogOut, Shield } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const navItems = [
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage News (Demo)', path: '/admin/news', icon: Newspaper },
    { name: 'Articles (Demo)', path: '/admin/articles', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast Container for Notifications */}
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900 text-emerald-50 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-emerald-800">
          <Shield className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-wide">ElephantGuard</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-800 text-white font-medium shadow-sm' 
                    : 'hover:bg-emerald-800/50 text-emerald-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-emerald-200 hover:bg-emerald-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;