import { useState } from 'react';
import { ArrowLeft, Mail, Lock, UserRound, Stethoscope, Shield, Phone, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserRole } from '@/types';

interface AuthPageProps {
  role: UserRole;
  onBack: () => void;
}

type Mode = 'login' | 'signup';

export function AuthPage({ role, onBack }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleAadhaarVerify = () => {
    if (aadhaar.replace(/\s/g, '').length !== 12) {
      showToast('Aadhaar number must be 12 digits', 'error');
      return;
    }
    setOtpSent(true);
    showToast('OTP sent to your registered mobile number', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        showToast(error, 'error');
        setLoading(false);
      } else {
        showToast('Welcome back!', 'success');
      }
    } else {
      if (!otpSent) {
        showToast('Please verify your Aadhaar first', 'error');
        setLoading(false);
        return;
      }
      if (otp.length !== 6) {
        showToast('Enter the 6-digit OTP to verify', 'error');
        setLoading(false);
        return;
      }
      const aadhaarRef = `XXXX-XXXX-${aadhaar.replace(/\s/g, '').slice(-4)}`;
      const { error } = await signUp(email, password, fullName, role, aadhaarRef, phone);
      if (error) {
        showToast(error, 'error');
        setLoading(false);
      } else {
        showToast('Account created successfully! Please sign in.', 'success');
        setMode('login');
        setLoading(false);
      }
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left panel */}
      <div className={`relative hidden flex-col justify-between p-12 lg:flex ${isDoctor ? 'bg-gradient-to-br from-teal-600 to-primary-700' : 'bg-gradient-to-br from-primary-600 to-teal-600'}`}>
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>
        <div className="text-white">
          <Logo size="lg" className="[&_*]:!text-white" />
          <h2 className="mt-8 text-4xl font-bold leading-tight">
            {isDoctor ? 'Access patient records with confidence' : 'Your health, in your hands'}
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/80">
            {isDoctor
              ? 'View complete medical histories after patient consent. AI summaries help you diagnose faster, with full audit trails for accountability.'
              : 'Store medical reports securely, get AI-powered explanations, share with doctors through consent, and never lose a report again.'}
          </p>
          <div className="mt-10 space-y-4">
            {(isDoctor
              ? ['Consent-based record access', 'AI-powered report summaries', 'Patient timeline view', 'Full audit trail']
              : ['Encrypted digital health locker', 'QR & OTP consent sharing', 'AI report explanations', 'Emergency SOS support']
            ).map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/60">Privacy-first. Consent-based. Encrypted.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo size="md" />
            <button onClick={onBack} className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {isDoctor ? <Stethoscope className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
              {isDoctor ? 'Doctor Portal' : 'Patient Portal'}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Join ONCLA in a few quick steps'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode('login')}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label-field">Full Name</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="label-field">Phone Number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">
                    Aadhaar Number {isDoctor ? '(for verification)' : ''}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={aadhaar}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                          const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                          setAadhaar(formatted);
                        }}
                        placeholder="1234 5678 9012"
                        className="input-field pl-11"
                        disabled={otpSent}
                      />
                    </div>
                    {!otpSent ? (
                      <button type="button" onClick={handleAadhaarVerify} className="btn-secondary whitespace-nowrap">
                        Send OTP
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-xl bg-success-50 px-3 text-sm font-medium text-success-700 ring-1 ring-success-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">Your Aadhaar is masked and encrypted. We only store the last 4 digits.</p>
                </div>

                {otpSent && (
                  <div className="animate-scale-in">
                    <label className="label-field">Enter OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit code"
                      className="input-field text-center text-lg tracking-[0.5em] font-semibold"
                    />
                    <p className="mt-1.5 text-xs text-slate-400">For this demo, any 6-digit code will work.</p>
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base">
              {loading ? <LoadingSpinner size="sm" className="text-white" /> : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to ONCLA's privacy policy. Your data is encrypted and consent-based.
          </p>
        </div>
      </div>
    </div>
  );
}
