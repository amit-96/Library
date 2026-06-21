import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Check, Mail, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.demoCode) {
      setDemoCode(location.state.demoCode);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.verifyEmail(email, code);
      if (data.success) {
        setSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during email verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] overflow-hidden px-4">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[100px]"></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-extrabold font-outfit text-white">Verify Your Email</h2>
          <p className="text-slate-400 text-sm mt-1">Please enter the 6-digit code sent to you</p>
        </div>

        <div className="glass-panel border border-slate-800 bg-slate-900/60 p-8 rounded-3xl shadow-xl shadow-black/30">
          {success ? (
            <div className="flex flex-col items-center py-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Check size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white">Verification Complete!</h3>
              <p className="text-xs text-slate-400">Email verified successfully. Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 text-left">
                  {error}
                </div>
              )}

              {/* Demo Assist Alert */}
              {demoCode && (
                <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-4 py-3 text-xs text-brand-300 text-left flex items-start gap-2.5">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Demo Auto-Filler Assist</span>
                    Use registration code: <strong className="underline text-white tracking-widest">{demoCode}</strong> to complete verification instantly.
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Registered Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Verification Code */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-center tracking-widest rounded-xl border border-slate-800 bg-slate-950/40 py-3 text-lg font-bold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md active:scale-98"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>Verify Email</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
