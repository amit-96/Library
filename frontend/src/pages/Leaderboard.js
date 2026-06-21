import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Trophy, Award, Zap, Flame, User, Loader2, Sparkles } from 'lucide-react';

const Leaderboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const fetchGamificationData = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        api.gamification.stats(),
        api.gamification.leaderboard()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
    } catch (err) {
      console.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const handleClaimPoints = async (activityType) => {
    setClaiming(true);
    setClaimMessage('');
    try {
      const res = await api.gamification.addPoints(activityType);
      if (res.success) {
        setClaimMessage(`Success! ${res.message}`);
        // Refresh data
        await fetchGamificationData();
      }
    } catch (err) {
      setClaimMessage('Error claiming points.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Student Leaderboard">
        <div className="h-60 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-650" size={32} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Nalanda Digital Library Student Leaderboard & Gamification">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* User stats overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Trophy size={20} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Leaderboard Rank</span>
                <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">#{stats.rank}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Points</span>
                <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">{stats.points} XP</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Current Level</span>
                <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">Lvl {stats.level}</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <Flame size={20} />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Consistency Streak</span>
                <span className="text-xl font-extrabold font-outfit text-slate-850 dark:text-slate-105">{stats.streakDays} Days</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Global Leaderboard Table */}
          <div className="md:col-span-3 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Global Student Standings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-850 pb-2">
                    <th className="py-2 text-left font-bold w-12">Rank</th>
                    <th className="py-2 text-left font-bold">Student</th>
                    <th className="py-2 text-right font-bold">Level</th>
                    <th className="py-2 text-right font-bold">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {leaderboard.map((item, idx) => (
                    <tr key={idx} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3 font-extrabold text-brand-650">#{idx + 1}</td>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                          <User size={12} />
                        </div>
                        <span>{item.user?.name || 'Anonymous User'}</span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold">Lvl {item.level}</td>
                      <td className="py-3 text-right font-mono font-extrabold text-slate-850 dark:text-slate-100">{item.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Badges card */}
            {stats && (
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earned Badges</h3>
                <div className="flex flex-wrap gap-2 pt-2">
                  {stats.badges.map((badge, idx) => (
                    <span key={idx} className="text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-brand-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1 shadow-sm uppercase tracking-wide">
                      <Sparkles size={11} />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Simulators */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mock Practice Sandbox</h3>
              <p className="text-[11px] text-slate-400 leading-tight">Simulate library study, complete mock exams, and test the level-up and streak mechanisms.</p>
              
              {claimMessage && (
                <div className="p-3 text-[10px] rounded-xl bg-brand-50/50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400 border border-brand-200/50">
                  {claimMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleClaimPoints('book-read')}
                  disabled={claiming}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2.5 text-[10px] font-bold transition-all border border-slate-200/40"
                >
                  Simulate Book Read (+30 XP)
                </button>
                <button
                  onClick={() => handleClaimPoints('mock-test')}
                  disabled={claiming}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2.5 text-[10px] font-bold transition-all border border-slate-200/40"
                >
                  Complete Mock Test (+50 XP)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
