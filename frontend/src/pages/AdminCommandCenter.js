import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Shield, Server, Activity, Users, DollarSign, Loader2, Cpu, CheckCircle } from 'lucide-react';

const AdminCommandCenter = () => {
  const [logs, setLogs] = useState([]);
  const [activeUsers, setActiveUsers] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching server health logs and audit records
    setTimeout(() => {
      setLogs([
        { action: 'Admin Login', details: 'IP: 192.168.1.1, Browser: Chrome', time: '10 Mins Ago' },
        { action: 'User Signup', details: 'New Student amit@libra.ai registered', time: '1 Hour Ago' },
        { action: 'Face ID Scan Success', details: 'Check-in user student@libra.ai', time: '2 Hours Ago' },
        { action: 'Database backup', details: 'Completed MongoDB sync to Cloud storage', time: 'Yesterday' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <Layout title="Admin Command Center">
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-650" size={32} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Nalanda Digital Library Command Center & Server Monitor">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* Server metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Server size={20} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">API Health Gateway</span>
              <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle size={12} />
                ONLINE
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Logins</span>
              <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">{activeUsers} Session(s)</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">AI Model Load</span>
              <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">4.2% CPU</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-650/10 text-indigo-650 flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Monthly Revenue</span>
              <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">₹2,490 INR</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Security Log Table */}
          <div className="md:col-span-3 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield size={18} className="text-brand-600" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">System Audit & Access Logs</h3>
            </div>
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-50 dark:border-slate-850 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">{log.action}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Usage stats */}
          <div className="md:col-span-2 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity size={18} className="text-indigo-650" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">FastAPI Service Stats</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>RAG INDEX STORAGE</span>
                  <span>42%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>YOLO CCTV DETECTIONS</span>
                  <span>12 / Sec</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>FAISS SEARCH LATENCY</span>
                  <span>12ms</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCommandCenter;
