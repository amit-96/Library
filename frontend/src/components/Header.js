import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { api } from '../services/api';

const Header = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.notices.notifications();
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err.message);
      }
    };
    if (user) {
      fetchNotifications();
      // poll every 60s
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async () => {
    try {
      await api.notices.readNotifications();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/75 px-6 dark:border-slate-800/40 dark:bg-[#0f172a]/75 backdrop-blur-md z-30">
      <div>
        <h1 className="text-xl font-semibold font-outfit text-slate-800 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              if (!showNotifications && unreadCount > 0) {
                handleMarkAsRead();
              }
            }}
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Alerts & Notifications</span>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      className={`px-3 py-2.5 my-0.5 rounded-xl text-left transition-colors ${
                        n.read ? 'opacity-75' : 'bg-brand-50/50 dark:bg-brand-950/20'
                      }`}
                    >
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 font-semibold text-white text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 text-left border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mt-1"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
