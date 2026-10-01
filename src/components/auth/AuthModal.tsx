import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    loginWithPhone,
    verifyOtp,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'phone'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Phone OTP Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(authModalMode);
    setErrorMessage('');
    setSuccessMessage('');
  }, [authModalMode, isAuthModalOpen]);

  // Countdown timer for Phone OTP
  useEffect(() => {
    let interval: any;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    if (mode === 'signup') {
      if (!username.trim() || username.length < 3) {
        setErrorMessage('Username must be at least 3 characters long');
        return;
      }
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (!PASSWORD_REGEX.test(password)) {
        setErrorMessage(
          'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number'
        );
        return;
      }
      try {
        await signupWithEmail(email, password, username, fullName);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to sign up');
      }
    } else {
      if (!password) {
        setErrorMessage('Password is required');
        return;
      }
      try {
        await loginWithEmail(email, password);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to sign in');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed');
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await loginWithPhone(phoneNumber);
      setOtpSent(true);
      setOtpTimer(60);
      setSuccessMessage(`One-Time Password sent to ${phoneNumber}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpValues];
    newOtp[index] = val.slice(-1);
    setOtpValues(newOtp);

    // Auto advance focus
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit when complete
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      verifyOtp(fullCode).catch((err) => {
        setErrorMessage(err.message || 'Invalid verification code');
      });
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-[420px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-400 text-white font-extrabold text-2xl shadow-lg shadow-rose-500/20 mb-3">
            S
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login'
              ? 'Welcome back to Spotlight'
              : mode === 'signup'
              ? 'Join Spotlight Today'
              : 'Sign in with Phone'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Connect with creators, reels, and live messages'
              : mode === 'signup'
              ? 'Create, share, and discover vertical spotlights'
              : 'Fast, secure passwordless verification'}
          </p>
        </div>

        {/* Tab Switcher for Auth Methods */}
        <div className="grid grid-cols-3 p-1 mb-5 bg-slate-100 dark:bg-zinc-900 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setOtpSent(false);
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setOtpSent(false);
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('phone');
              setErrorMessage('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'phone'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-11 flex items-center justify-center gap-3 px-4 mb-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors shadow-sm disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
          <span className="bg-white dark:bg-zinc-950 px-3 text-xs text-slate-400 font-medium tracking-wider">
            OR
          </span>
        </div>

        {/* Traditional Form or Phone OTP */}
        {mode !== 'phone' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="username"
                      className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min 8 chars, 1 upper, 1 num' : 'Enter password'}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white font-medium text-sm shadow-md shadow-rose-500/20 active:scale-[0.99] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Sign In to Account'
              ) : (
                'Create New Account'
              )}
            </button>
          </form>
        ) : (
          /* Phone OTP Flow */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                    We will send a 6-digit confirmation code via SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white font-medium text-sm shadow-md shadow-rose-500/20 active:scale-[0.99] transition-transform disabled:opacity-60 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send One-Time Password'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Enter the 6-digit code sent to <span className="font-semibold text-slate-800 dark:text-zinc-200">{phoneNumber}</span>
                  </p>
                </div>

                {/* 6-Digit Confirmation Grid */}
                <div className="flex justify-between gap-2">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                    />
                  ))}
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1">
                  <span>
                    Resend code in:{' '}
                    <strong className="text-slate-800 dark:text-zinc-200 tabular-nums">
                      {otpTimer > 0 ? `${otpTimer}s` : 'Available'}
                    </strong>
                  </span>
                  {otpTimer === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpTimer(60);
                        setOtpValues(['', '', '', '', '', '']);
                        loginWithPhone(phoneNumber);
                      }}
                      className="text-rose-500 hover:text-rose-600 font-semibold"
                    >
                      Resend Now
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const fullCode = otpValues.join('');
                    if (fullCode.length === 6) {
                      verifyOtp(fullCode).catch((err) => {
                        setErrorMessage(err.message || 'Invalid verification code');
                      });
                    } else {
                      setErrorMessage('Please enter all 6 digits');
                    }
                  }}
                  disabled={isLoading || otpValues.includes('')}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm shadow-md active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm & Continue'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 mt-5 transition-colors"
        >
          Cancel and return to browsing
        </button>
      </div>
    </div>
  );
};
