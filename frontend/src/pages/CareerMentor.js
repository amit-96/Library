import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Compass, Briefcase, Award, GraduationCap, ArrowRight, BookOpen, Search, Loader2 } from 'lucide-react';

const CareerMentor = () => {
  const [goal, setGoal] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchRoadmap = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError('');
    setRoadmapData(null);

    try {
      const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.ai.careerMentor(goal, skillsArray);

      if (res.success) {
        setRoadmapData(res.data);
      } else {
        setError('Failed to generate career roadmap');
      }
    } catch (err) {
      setError('Could not connect to AI Mentor service. Please ensure the server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Career Guidance & Mentor">
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        {/* Header Introduction Card */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-indigo-100 dark:border-indigo-950 flex flex-col md:flex-row gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Compass size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Accelerate Your Professional Career</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your professional career goals (e.g. Data Scientist, Cloud Architect, Cybersecurity Specialist). The AI Career Advisor will cross-reference industry requirements, identify your skill gaps, and construct a customized learning roadmap.
            </p>
          </div>
        </div>

        {/* Input form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <form onSubmit={handleFetchRoadmap} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Professional Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Scientist, Full Stack Dev"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Current Key Skills (Comma Separated)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <GraduationCap size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. HTML, JavaScript, Python"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Mapping Career Pathway...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Analyze Career Requirements</span>
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

        {/* Results output display */}
        {roadmapData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step-by-Step Roadmap Flow */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase font-outfit tracking-wider">Customized Learning Roadmap</h3>
              <div className="space-y-4 relative pl-4 border-l-2 border-brand-500/30 ml-2">
                {roadmapData.roadmap.map((step, idx) => (
                  <div key={idx} className="relative group text-left">
                    {/* Circle marker */}
                    <div className="absolute -left-[25px] top-1 h-4 w-4 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform"></div>
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Step {step.step}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{step.duration}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar analytics (Skill gap & readings) */}
            <div className="space-y-6">
              {/* Skill Gap card */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Award size={18} className="text-brand-600" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Skill Gap Analysis</h4>
                </div>
                <p className="text-[11px] text-slate-400">Skills identified that you should add to achieve this career benchmark:</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {roadmapData.skillGap.length > 0 ? (
                    roadmapData.skillGap.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-950/40">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400">None! You possess all core skills!</span>
                  )}
                </div>
              </div>

              {/* Recommended syllabus/readings */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <BookOpen size={18} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Library Resources</h4>
                </div>
                <div className="space-y-2">
                  {roadmapData.learningMaterials.map((mat, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[11px]">
                      <ArrowRight size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-350 block leading-tight">{mat.resource}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{mat.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CareerMentor;
