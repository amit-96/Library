import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User, Mail, Lock, ArrowRight, ArrowLeft, Check, Info, Smartphone } from 'lucide-react';

const SignUp = () => {
  const [step, setStep] = useState(1); // 1 = Input Info, 2 = Verify OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // email/phone identifier
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.register(name, email, password, role);
      if (data.success) {
        setDemoCode(data.demoCode || '');
        setStep(2); // Progress to OTP step inline
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.auth.verifyEmail(email, otpCode);
      if (data.success) {
        setVerificationSuccess(true);
        // Fire confetti on success
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (cErr) {
          console.log('Confetti failed to load:', cErr);
        }
        
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInfo = () => {
    setStep(1);
    setError('');
    setOtpCode('');
  };

  const isEmailInput = email.includes('@');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] overflow-hidden px-4">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[100px] animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 shadow-lg shadow-brand-500/30 mb-3 text-white font-bold text-2xl font-outfit animate-float">
            L
          </div>
          <h2 className="text-3xl font-extrabold font-outfit text-white">
            {step === 1 ? 'Create Account' : 'Verify Account'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 
              ? 'Get started with your Nalanda Digital Library account' 
              : `Enter the 6-digit OTP sent to your ${isEmailInput ? 'email' : 'phone number'}`}
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel border border-slate-800 bg-slate-900/60 p-8 rounded-3xl shadow-xl shadow-black/30">
          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 text-left">
              {error}
            </div>
          )}

          {/* STEP 1: INFORMATION GATHERING */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {/* Name field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email / Phone field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Email Address or Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    {email.includes('@') || !email.replace(/[^0-9]/g, '') ? <Mail size={16} /> : <Smartphone size={16} />}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="email@gmail.com or +9198765..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 focus:border-brand-500 focus:outline-none transition-all"
                >
                  <option value="student" className="bg-slate-900 text-slate-100">Student</option>
                  <option value="librarian" className="bg-slate-900 text-slate-100">Librarian</option>
                  <option value="admin" className="bg-slate-900 text-slate-100">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md shadow-brand-500/10 active:scale-98"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Register & Send OTP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: INLINE OTP VERIFICATION */}
          {step === 2 && (
            <div className="space-y-5">
              {verificationSuccess ? (
                <div className="flex flex-col items-center py-6 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Registration Complete!</h3>
                  <p className="text-xs text-slate-400">Account verified successfully. Redirecting to login...</p>
                </div>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  {/* Demo Assist Alert */}
                  {demoCode && (
                    <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-4 py-3 text-xs text-brand-300 text-left flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Demo Auto-Filler Assist</span>
                        Use code: <strong className="underline text-white tracking-widest">{demoCode}</strong> to verify instantly.
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-350">Registered User ID</label>
                    <input
                      type="text"
                      disabled
                      value={email}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/20 py-2.5 px-4 text-xs text-slate-400 select-none cursor-not-allowed"
                    />
                  </div>

                  {/* Verification Code */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-center tracking-widest rounded-xl border border-slate-800 bg-slate-950/40 py-3 text-lg font-bold text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToInfo}
                      disabled={loading}
                      className="flex items-center justify-center gap-1.5 px-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-950/20 transition-all cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-sm font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md active:scale-98"
                    >
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <span>Verify & Complete</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-slate-850"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-850"></div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login', { state: { isOtpMode: true } })}
                className="w-full text-center text-xs font-bold text-brand-400 hover:text-brand-300 py-2.5 transition-colors border border-slate-800 rounded-xl bg-slate-950/20 hover:bg-slate-950/50"
              >
                Sign Up / Log In with Phone or Gmail OTP
              </button>
            </>
          )}

          {/* Footer Link */}
          <div className="text-center mt-6 border-t border-slate-850 pt-4">
            <span className="text-xs text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
