import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Layout from '../components/Layout';
import { Megaphone, Trash2, Calendar, CheckCircle } from 'lucide-react';

const NoticeManage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Notice form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.notices.list();
      if (res.success) setNotices(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      const res = await api.notices.create({
        title,
        content,
        expiresAt: expiresAt || undefined
      });
      if (res.success) {
        setSuccess('Notice published and students notified!');
        setTitle('');
        setContent('');
        setExpiresAt('');
        fetchNotices();
      }
    } catch (err) {
      alert('Failed to publish notice: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.notices.delete(id);
      if (res.success) {
        setNotices(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Layout title="Notice Board Manager">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-left">
        {/* Publish Notice Form */}
        <div className="glass-panel p-5 rounded-2xl h-fit">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-1.5">
            <Megaphone size={16} className="text-brand-500" />
            <span>Publish New Notice</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Server Maintenance Scheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Notice Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Enter details of announcement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400">Expiration Date (Optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/20 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 py-3 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-md"
            >
              Publish Notice
            </button>
          </form>
        </div>

        {/* Active Notices list */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Currently Active Notices</h3>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
          ) : notices.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No active notices published</p>
          ) : (
            <div className="space-y-4">
              {notices.map(notice => (
                <div key={notice._id} className="rounded-xl border border-slate-200/50 p-4 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/30 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">{notice.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{notice.content}</p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-2">
                      <Calendar size={10} />
                      <span>Published by: {notice.publishedBy?.name} on {new Date(notice.scheduledFor).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors inline-block"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NoticeManage;
