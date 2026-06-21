import React, { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { Sparkles, MessageSquare, Award, ArrowRight, Loader2, Play, RefreshCw, Send } from 'lucide-react';

const InterviewPrep = () => {
  const [domain, setDomain] = useState('Web Development');
  const [interviewType, setInterviewType] = useState('Technical');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async () => {
    setLoadingQuestion(true);
    setError('');
    setFeedback(null);
    setAnswer('');
    setQuestion('');

    try {
      const res = await api.ai.interviewSession(domain, interviewType);

      if (res.success) {
        setQuestion(res.data.question);
      } else {
        setError('Failed to fetch interview question.');
      }
    } catch (err) {
      setError('Could not connect to Interview service. Please ensure the server is active.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !question) return;

    setLoadingFeedback(true);
    setError('');

    try {
      const res = await api.ai.interviewFeedback(question, answer);

      if (res.success) {
        setFeedback(res.data);
      } else {
        setError('Failed to submit answer.');
      }
    } catch (err) {
      setError('Could not evaluate answer. Server connection failed.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <Layout title="AI Interview Preparation Gate">
      <div className="space-y-6 max-w-3xl mx-auto text-left">
        {/* Header Introduction Card */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-100 dark:border-emerald-950 flex flex-col md:flex-row gap-5 items-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <MessageSquare size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-outfit">Simulated Mock Interview Arena</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hone your skills with mock interviews. Choose a focus domain, generate realistic HR/Technical questions, and receive detailed scores, performance reports, and suggested vocabulary enhancements.
            </p>
          </div>
        </div>

        {/* Configuration settings block */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                disabled={question !== ''}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Technical">Technical Assessment</option>
                <option value="HR">HR Behavior & Fit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assessment Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={interviewType === 'HR' || question !== ''}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="Web Development">Web Development (React, Node)</option>
                <option value="Data Science">Data Science & ML (Python, models)</option>
                <option value="Cyber Security">Cyber Security (Encryption, SQLi)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartSession}
            disabled={loadingQuestion}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl py-3 px-6 text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
          >
            {loadingQuestion ? (
              <Loader2 size={15} className="animate-spin" />
            ) : question ? (
              <>
                <RefreshCw size={15} />
                <span>New Question</span>
              </>
            ) : (
              <>
                <Play size={15} />
                <span>Begin Assessment</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs text-center border border-red-200/50">
            {error}
          </div>
        )}

        {/* Live interview session details */}
        {question && (
          <div className="space-y-6">
            {/* Question card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-left space-y-4">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Question prompt</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{question}</h3>
              </div>

              {!feedback && (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Your response</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Type your analytical answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingFeedback}
                    className="w-full bg-slate-900 dark:bg-brand-600 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-md hover:bg-slate-850 flex items-center justify-center gap-1.5"
                  >
                    {loadingFeedback ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Evaluating response...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Response</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Feedback & evaluation card */}
            {feedback && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score panel */}
                <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Interview Score</span>
                  <div className="relative h-28 w-28 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-3xl font-extrabold font-outfit text-emerald-600 dark:text-emerald-400">{feedback.score}%</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-1 capitalize">
                    {feedback.score >= 80 ? 'Passed Mock Checkpoint!' : 'Requires Revision'}
                  </span>
                </div>

                {/* Feedback suggestions */}
                <div className="md:col-span-2 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Evaluation</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{feedback.evaluation}</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Recommended Enhancements</h4>
                    <div className="space-y-1.5 mt-2">
                      {feedback.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-[11px] text-slate-500 dark:text-slate-450">
                          <ArrowRight size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InterviewPrep;
