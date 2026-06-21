import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { Users, Trash2, ShieldAlert } from 'lucide-react';

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.list();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.users.updateRole(userId, newRole);
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Failed to update user role: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await api.users.delete(userId);
      if (res.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout title="System User Control Panel">
      <div className="space-y-6 text-left">
        <p className="text-sm text-slate-500 dark:text-slate-400">View and administer user roles, credentials, and system levels.</p>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="glass-panel py-16 text-center text-slate-400 rounded-2xl">
            <Users size={40} className="mx-auto mb-3 text-slate-350 dark:text-slate-750" />
            <p className="text-sm">No registered users in the database.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/60 font-semibold">
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">System Access Role</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="librarian">Librarian</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isVerified
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManage;
