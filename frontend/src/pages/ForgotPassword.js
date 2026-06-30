import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowRight, BookOpen, Loader2, Info } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.forgotPassword(email);
      if (response.success) {
        setSuccess(response.message || 'If that email is registered, a password reset link has been sent.');
      } else {
        setError(response.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0B2E6B]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#D62828]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 z-10">
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-90">
            <BookOpen size={28} className="text-[#FFD700]" />
            <span className="font-extrabold text-lg sm:text-xl font-outfit tracking-wide uppercase">
              Nalanda <span className="text-[#FFD700]">Digital Library</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white font-outfit">
            Forgot Password
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Enter your registered email address below, and we will send you a secure link to reset your account password.
          </p>
        </div>

        <div className="glass-panel bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-[#D62828]/10 border border-[#D62828]/30 text-red-200 text-xs rounded-xl p-4 flex gap-3 items-start">
              <Info className="shrink-0 text-[#D62828] mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl p-4 flex gap-3 items-start">
                <Info className="shrink-0 text-emerald-400 mt-0.5" size={16} />
                <span>{success}</span>
              </div>
              <p className="text-slate-400 text-xs text-center">
                Be sure to check your spam or junk folders if you do not receive the email within a couple of minutes.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full text-center block text-xs font-bold py-3 bg-[#0B2E6B] hover:bg-[#061e47] text-white rounded-xl transition-all shadow-md"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-xs font-bold py-3 px-4 bg-[#FFD700] hover:bg-[#ffe23b] text-[#0B2E6B] rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center border-t border-white/5 pt-4">
            <span className="text-[10px] sm:text-xs text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-[#FFD700] hover:underline font-bold">
                Log In
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
