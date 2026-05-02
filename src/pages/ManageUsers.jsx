import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api'; 
import ConfirmModal from '../components/ConfirmModal';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users", {
  position: "top-center"
} );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Block/Unblock
  const toggleBlockStatus = async (username, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/api/admin/users/${username}/block?status=${newStatus}`);
      toast.success(`User successfully ${newStatus ? 'blocked' : 'unblocked'}`, {
  position: "top-center"
});
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data || "Failed to update user status", {
  position: "top-center"
});
    } finally {
      setModalConfig({ isOpen: false });
    }
  };

  // 3. Handle Role Change
  const changeRole = async (username, newRole) => {
    try {
      await api.put(`/api/admin/users/${username}/role?newRole=${newRole}`);
      toast.success(`Role updated to ${newRole}`, {
  position: "top-center"
});
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change role", {
  position: "top-center"
});
    } finally {
      setModalConfig({ isOpen: false });
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        
        {/* Search Bar */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Username</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Role</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.username} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{user.username}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ROLE_ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-max gap-1 ${
                      user.blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {user.blocked ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    
                    {/* Role Change Button */}
                    {user.role === 'ROLE_ADMIN' ? (
                      <button 
                        onClick={() => setModalConfig({
                          isOpen: true,
                          title: "Demote to User",
                          message: `Are you sure you want to remove admin rights from ${user.username}?`,
                          confirmText: "Demote",
                          isDanger: true,
                          onConfirm: () => changeRole(user.username, 'user')
                        })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip-trigger"
                        title="Demote to User"
                      ><ShieldAlert className="w-5 h-5" /></button>
                    ) : (
                      <button 
                        onClick={() => setModalConfig({
                          isOpen: true,
                          title: "Promote to Admin",
                          message: `Are you sure you want to grant full admin rights to ${user.username}?`,
                          confirmText: "Promote",
                          isDanger: false,
                          onConfirm: () => changeRole(user.username, 'admin')
                        })}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Promote to Admin"
                      ><ShieldCheck className="w-5 h-5" /></button>
                    )}

                    {/* Block/Unblock Button */}
                    {user.blocked ? (
                      <button 
                        onClick={() => setModalConfig({
                          isOpen: true,
                          title: "Unblock User",
                          message: `Allow ${user.username} to access the system again?`,
                          confirmText: "Unblock",
                          isDanger: false,
                          onConfirm: () => toggleBlockStatus(user.username, user.blocked)
                        })}
                        className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                      >Unblock</button>
                    ) : (
                      <button 
                        onClick={() => setModalConfig({
                          isOpen: true,
                          title: "Block User",
                          message: `Are you sure you want to block ${user.username}? They will be immediately logged out.`,
                          confirmText: "Block User",
                          isDanger: true,
                          onConfirm: () => toggleBlockStatus(user.username, user.blocked)
                        })}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >Block</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reusable Modal instance */}
      <ConfirmModal 
        {...modalConfig} 
        onClose={() => setModalConfig({ isOpen: false })} 
      />
    </div>
  );
};

export default ManageUsers;