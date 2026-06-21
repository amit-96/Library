import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Calendar, BookOpen, Clock, Target, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const StudyPlanner = () => {
  const [examName, setExamName] = useState('');
  const [daysRemaining, setDaysRemaining] = useState('30');
  const [dailyHours, setDailyHours] = useState('3');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!examName.trim()) return;

    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const res = await api.ai.studyPlanner(
        examName,
        parseInt(daysRemaining),
        parseFloat(dailyHours)
      );

      if (res.success) {
        setPlan(res.data);
      } else {
        setError('Failed to generate study plan.');
      }
    } catch (err) {
      setError('Could not connect to Study Planner service. Please ensure the server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Study Planner & Exam Architect">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* Intro header */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-100 dark:border-amber-950 flex flex-col md:flex-row gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Calendar size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Construct Structured Exam Revision Timelines</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter target exam details, countdown timeline boundaries, and average daily hours. The AI Study Planner calculates milestones and splits syllabus subjects into manageable weekly targets.
            </p>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Exam / Curriculum Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <BookOpen size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. End Semester Exam"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Days Remaining</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Target size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={180}
                    value={daysRemaining}
                    onChange={(e) => setDaysRemaining(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Daily Study Targets (Hours)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Clock size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Drafting Personalized Revision Calendars...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Revision Calendar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs text-center border border-red-200/50">
            {error}
          </div>
        )}

        {/* Calendar week blocks display */}
        {plan && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-outfit">Syllabus Weekly Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.weeklyPlan.map((week, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Week {week.week}</span>
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{week.focusArea}</h4>
                  </div>
                  
                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-850 pt-3 flex-1">
                    {week.topics.map((t, tIdx) => (
                      <div key={tIdx} className="flex gap-2 items-start text-[11px] text-slate-500 dark:text-slate-400">
                        <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudyPlanner;
