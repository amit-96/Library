import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Sparkles, CheckCircle2, DollarSign, ShieldAlert, Loader2 } from 'lucide-react';

const PremiumMembership = () => {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState('');

  const fetchMembershipStatus = async () => {
    try {
      const res = await api.membership.status();
      if (res.success) {
        setMembership(res.data);
      }
    } catch (err) {
      console.error('Failed to load membership status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipStatus();
  }, []);

  const handleUpgrade = async (plan, amount) => {
    setUpgrading(true);
    setUpgradeMsg('');
    try {
      const res = await api.membership.upgrade(plan, amount);
      if (res.success) {
        setUpgradeMsg(`Successfully upgraded to ${plan}!`);
        await fetchMembershipStatus();
      }
    } catch (err) {
      setUpgradeMsg('Upgrade transaction failed.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Membership Upgrade">
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-650" size={32} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Nalanda Digital Library Subscription Plans">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* Intro */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-purple-650/10 to-brand-650/10 border border-purple-100 dark:border-purple-950 flex flex-col md:flex-row gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Unlock AI Premium Education Suite</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upgrade your student account to access advanced features: Unlimited AI advisor sessions, ATS Resume score checkers, mock interview simulators, and real-time CCTV study seat maps.
            </p>
          </div>
        </div>

        {upgradeMsg && (
          <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400 text-xs text-center border border-brand-200/50">
            {upgradeMsg}
          </div>
        )}

        {/* Current status info */}
        {membership && (
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[9px]">Your Current Plan</span>
              <span className="text-sm font-extrabold text-brand-650 capitalize">{membership.plan} Membership</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-bold uppercase text-[9px]">Expires On</span>
              <span className="font-semibold text-slate-650">{new Date(membership.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Pricing columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free plan */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Tier</span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">Basic Free</h3>
              </div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                ₹0 <span className="text-xs font-normal text-slate-400">/ Free Forever</span>
              </div>
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-4">
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>3 Free PDF Uploads</span>
                </div>
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Seat Reservations (1 Floor Only)</span>
                </div>
              </div>
            </div>
            <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-3 rounded-xl text-xs font-bold">
              Default Tier
            </button>
          </div>

          {/* Premium plan */}
          <div className="glass-panel p-6 rounded-3xl border-2 border-brand-500 bg-white dark:bg-slate-900 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 bg-brand-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Popular
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Student Pro</span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">Premium Pro</h3>
              </div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                ₹499 <span className="text-xs font-normal text-slate-400">/ Month</span>
              </div>
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-4">
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-brand-500" />
                  <span>Unlimited AI RAG chatbot queries</span>
                </div>
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-brand-500" />
                  <span>AI Career Mentor roadmaps</span>
                </div>
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-brand-500" />
                  <span>Interactive interview mock tests</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleUpgrade('Premium', 499)}
              disabled={upgrading || membership?.plan === 'Premium'}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              {membership?.plan === 'Premium' ? 'Active Plan' : 'Upgrade Premium'}
            </button>
          </div>

          {/* Enterprise plan */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College Suite</span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">Enterprise</h3>
              </div>
              <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-105">
                Custom <span className="text-xs font-normal text-slate-400">/ Quote</span>
              </div>
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-850 pt-4">
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-indigo-500" />
                  <span>Full college-wide CCTV analytics</span>
                </div>
                <div className="flex gap-2 text-slate-600 dark:text-slate-400 text-[11px] items-center">
                  <CheckCircle2 size={14} className="text-indigo-500" />
                  <span>Automated WhatsApp alert channels</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleUpgrade('Enterprise', 1999)}
              disabled={upgrading || membership?.plan === 'Enterprise'}
              className="w-full bg-slate-900 hover:bg-slate-850 text-white py-3 rounded-xl text-xs font-bold transition-all"
            >
              {membership?.plan === 'Enterprise' ? 'Active Plan' : 'Contact Sales'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PremiumMembership;
