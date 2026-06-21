import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, ArrowRight, BookOpen, Smartphone, KeyRound, Info } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  // Common states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode state: false = Password, true = OTP
  const [isOtpMode, setIsOtpMode] = useState(() => {
    return location.state?.isOtpMode || false;
  });

  // Password Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP Login/Signup states
  const [identifier, setIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter Email/Phone, 2 = Enter OTP Code
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.auth.login(email, password);
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.auth.sendOTP(identifier);
      if (data.success) {
        setSuccess(`A 6-digit verification code has been dispatched to ${identifier}.`);
        if (data.demoCode) {
          setDemoCode(data.demoCode);
        }
        setOtpStep(2);
      } else {
        setError(data.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please verify server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.auth.verifyOTP(identifier, otpCode);
      if (data.success) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Verification failed. Please check the code.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsOtpMode(!isOtpMode);
    setError('');
    setSuccess('');
    setOtpStep(1);
    setOtpCode('');
    setDemoCode('');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] overflow-hidden px-4">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[100px] animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0B2E6B] to-[#FFD700] shadow-lg shadow-blue-500/30 mb-3 text-white font-bold text-2xl font-outfit border border-white/10">
            N
          </Link>
          <h2 className="text-2xl font-extrabold font-outfit text-white">Nalanda Digital Library</h2>
          <p className="text-slate-400 text-xs mt-1">Study Cabin Management & Learning Ecosystem</p>
        </div>

        {/* Card Form */}
        <div className="glass-panel border border-slate-800 bg-slate-900/60 p-8 rounded-3xl shadow-xl shadow-black/30">
          
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 text-left mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-xs text-green-400 text-left mb-4">
              {success}
            </div>
          )}

          {/* Demo Assist Alert */}
          {isOtpMode && otpStep === 2 && demoCode && (
            <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-4 py-3 text-xs text-brand-300 text-left flex items-start gap-2.5 mb-4">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Demo Auto-Filler Assist</span>
                Use verification code: <strong className="underline text-white tracking-widest">{demoCode}</strong> to authenticate instantly.
              </div>
            </div>
          )}

          {/* PASSWORD MODE FORM */}
          {!isOtpMode && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-350">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="student@libra.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-355">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-brand-400 hover:text-brand-305 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-xs font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md shadow-brand-500/10 active:scale-98"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Login with Password</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP MODE FORM */}
          {isOtpMode && (
            <div className="space-y-5">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-350">Email Address or Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Smartphone size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="email@gmail.com or +9198765..."
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:outline-none transition-all"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Enter your Gmail address or mobile number to receive a 6-digit OTP verification code. New users will be automatically registered!</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-xs font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md shadow-brand-500/10"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-semibold text-slate-350">Enter 6-Digit Code</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <KeyRound size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full tracking-widest text-center rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm font-bold text-slate-100 placeholder-slate-650 focus:border-brand-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3 text-xs font-semibold text-white hover:from-brand-500 hover:to-indigo-500 focus:outline-none transition-all shadow-md shadow-brand-500/10"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <span>Verify OTP & Log In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-300 py-1 transition-colors"
                  >
                    Change phone / email
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TOGGLE MODE LINK */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-550 font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={toggleMode}
            className="w-full text-center text-xs font-bold text-brand-400 hover:text-brand-300 py-1.5 transition-colors border border-slate-800 rounded-xl bg-slate-950/20 hover:bg-slate-950/50"
          >
            {isOtpMode ? "Sign in with Email & Password" : "Sign in / Register with OTP"}
          </button>

          {/* Footer Link */}
          <div className="text-center mt-6 border-t border-slate-800/60 pt-4 flex justify-between text-xs">
            <Link to="/" className="text-slate-450 hover:text-slate-300 transition-colors">
              ← Back to Home
            </Link>
            <div>
              <span className="text-slate-400">New user? </span>
              <button onClick={toggleMode} className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Get OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
