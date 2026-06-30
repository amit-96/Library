import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, Check, X, Loader2, Info, BookOpen } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password requirements state
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  });

  // Calculate password strength checks in real-time
  useEffect(() => {
    setChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password) // matches @$!%*?& from backend validation regex
    });
  }, [password]);

  const strengthCount = Object.values(checks).filter(Boolean).length;
  const strengthLabels = ['Extremely Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-rose-600',
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset request. Missing authorization token.');
      return;
    }

    // Verify all password requirements are satisfied
    if (strengthCount < 5) {
      setError('Please satisfy all password complexity requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.resetPassword(token, password);
      if (response.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during password reset.');
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
            Reset Password
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Set a strong and secure new password for your digital library account.
          </p>
        </div>

        <div className="glass-panel bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-[#D62828]/10 border border-[#D62828]/30 text-red-200 text-xs rounded-xl p-4 flex gap-3 items-start">
              <Info className="shrink-0 text-[#D62828] mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl p-4 flex gap-3 items-start">
              <Check className="shrink-0 text-emerald-400 mt-0.5" size={16} />
              <span>{success}</span>
            </div>
          )}

          {!token ? (
            <div className="bg-[#D62828]/10 border border-[#D62828]/30 text-red-200 text-xs rounded-xl p-4 flex flex-col gap-3 items-center text-center">
              <span>A valid reset token is required. Please check your email and click the link again.</span>
              <Link to="/forgot-password" className="text-[#FFD700] hover:underline font-bold text-xs mt-2">
                Request a new link
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !!success}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Real-time Password Strength Meter */}
              {password && (
                <div className="space-y-3 p-3.5 bg-slate-950/20 border border-white/5 rounded-2xl">
                  {/* Strength Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">Strength:</span>
                      <span className={
                        strengthCount <= 2 ? 'text-rose-400' : strengthCount <= 4 ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {strengthLabels[strengthCount - 1] || 'Extremely Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 transition-all ${
                            i < strengthCount ? strengthColors[strengthCount - 1] : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-400 border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1.5">
                      {checks.length ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-rose-400" />}
                      <span className={checks.length ? 'text-slate-200' : ''}>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {checks.uppercase ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-rose-400" />}
                      <span className={checks.uppercase ? 'text-slate-200' : ''}>One uppercase (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {checks.lowercase ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-rose-400" />}
                      <span className={checks.lowercase ? 'text-slate-200' : ''}>One lowercase (a-z)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {checks.number ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-rose-400" />}
                      <span className={checks.number ? 'text-slate-200' : ''}>One number (0-9)</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      {checks.specialChar ? <Check size={10} className="text-emerald-400" /> : <X size={10} className="text-rose-400" />}
                      <span className={checks.specialChar ? 'text-slate-200' : ''}>One special character (@$!%*?&)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || !!success}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !!success || strengthCount < 5 || password !== confirmPassword}
                  className="w-full text-xs font-bold py-3 px-4 bg-[#FFD700] hover:bg-[#ffe23b] text-[#0B2E6B] rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
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

export default ResetPassword;
