import { useState } from 'react';
import {
  ShieldPlus, FileLock2, Brain, Bell, Siren, QrCode, Stethoscope, ArrowRight,
  CheckCircle2, Lock, UserRound, Activity, MapPin, Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { UserRole } from '@/types';

interface LandingPageProps {
  onGetStarted: (role: UserRole) => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeRole, setActiveRole] = useState<UserRole>('patient');

  const features = [
    { icon: FileLock2, title: 'Digital Health Locker', desc: 'All your medical reports encrypted and stored in one secure place. Never lose a report again.', color: 'bg-primary-50 text-primary-600' },
    { icon: Brain, title: 'AI Report Summaries', desc: 'Complex medical reports explained in simple, easy-to-understand language with actionable insights.', color: 'bg-teal-50 text-teal-600' },
    { icon: QrCode, title: 'QR & OTP Consent', desc: 'Share records with doctors only after your explicit consent via QR code or OTP verification.', color: 'bg-accent-50 text-accent-600' },
    { icon: Bell, title: 'Medicine Reminders', desc: 'Never miss a dose. Smart reminders keep your medication schedule on track.', color: 'bg-success-50 text-success-600' },
    { icon: Siren, title: 'Emergency SOS', desc: 'One tap shares your location, blood group, allergies, and medical history with the nearest hospital.', color: 'bg-warning-50 text-warning-600' },
  ];

  const patientSteps = [
    { num: '01', title: 'Sign Up with Aadhaar', desc: 'Create your secure health account using Aadhaar verification and OTP.' },
    { num: '02', title: 'Upload Medical Reports', desc: 'Add lab reports, prescriptions, and scans to your encrypted digital locker.' },
    { num: '03', title: 'Share with Consent', desc: 'Generate a QR code or OTP for your doctor to access your records temporarily.' },
    { num: '04', title: 'Get AI Insights', desc: 'Receive plain-language explanations of your reports and health alerts.' },
  ];

  const doctorSteps = [
    { num: '01', title: 'Register & Verify', desc: 'Sign up with your medical registration number and hospital details.' },
    { num: '02', title: 'Request Patient Access', desc: 'Search for a patient or scan their QR code to request consent.' },
    { num: '03', title: 'Receive Consent', desc: 'Patient approves via OTP. You get temporary, audited access to records.' },
    { num: '04', title: 'Review & Diagnose', desc: 'View AI summaries first, then full reports. Prescribe with complete context.' },
  ];

  const steps = activeRole === 'patient' ? patientSteps : doctorSteps;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it Works</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900">Security</a>
          </div>
          <button onClick={() => onGetStarted('patient')} className="btn-primary">
            Get Started <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-primary-700 shadow-soft ring-1 ring-primary-100">
                <Sparkles className="h-4 w-4" />
                AI-Powered Healthcare Platform
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl text-balance">
                Your health records,
                <span className="bg-gradient-to-r from-primary-600 to-teal-600 bg-clip-text text-transparent"> secure and simplified</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600 text-balance">
                ONCLA is an AI-powered digital health locker that connects patients and doctors through
                Aadhaar-based authentication and patient consent. Store reports, get AI summaries, never
                miss a medicine, and get emergency support — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => onGetStarted('patient')} className="btn-primary text-base">
                  <UserRound className="h-5 w-5" /> I'm a Patient
                </button>
                <button onClick={() => onGetStarted('doctor')} className="btn-secondary text-base">
                  <Stethoscope className="h-5 w-5" /> I'm a Doctor
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary-500" /> Encrypted & Secure</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-500" /> Consent-Based Access</div>
              </div>
            </div>
            <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="card p-6 rotate-1 transition-transform hover:rotate-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                      <ShieldPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Health Dashboard</p>
                      <p className="text-xs text-slate-500">AI Summary Available</p>
                    </div>
                  </div>
                  <span className="badge bg-success-100 text-success-700">Healthy</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Blood Pressure</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">120/80</p>
                    <p className="text-xs text-success-600">Normal</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Blood Sugar</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">92</p>
                    <p className="text-xs text-success-600">Normal</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Heart Rate</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">78</p>
                    <p className="text-xs text-success-600">bpm</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Reports</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">12</p>
                    <p className="text-xs text-primary-600">On record</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 p-4 ring-1 ring-primary-100">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary-600" />
                    <p className="text-sm font-semibold text-slate-900">AI Health Insight</p>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">Your CBC shows slightly low hemoglobin (10.2 g/dL). Consider iron-rich foods and consult your doctor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need for better healthcare</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">From secure record storage to AI-powered insights, ONCLA brings every part of your healthcare journey into one platform.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card p-6 transition-all hover:shadow-glow hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How ONCLA Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Simple, secure, and built around real healthcare workflows.</p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-xl bg-white p-1.5 shadow-soft ring-1 ring-slate-100">
              <button
                onClick={() => setActiveRole('patient')}
                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${activeRole === 'patient' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Patient Journey
              </button>
              <button
                onClick={() => setActiveRole('doctor')}
                className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${activeRole === 'doctor' ? 'bg-primary-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Doctor Journey
              </button>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="card p-6 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-3xl font-bold text-primary-200">{step.num}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-1.5 text-sm font-medium text-success-700 ring-1 ring-success-100">
              <Lock className="h-4 w-4" /> Privacy-First by Design
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your data, your control</h2>
            <p className="mt-4 text-lg text-slate-600">ONCLA is built with security at its core. Your medical records are encrypted, access is consent-based, and every view is logged for accountability.</p>
            <ul className="mt-6 space-y-4">
              {[
                { icon: Lock, title: 'Encrypted Storage', desc: 'All medical reports are encrypted using industry-standard cryptography.' },
                { icon: QrCode, title: 'Consent-Based Access', desc: 'Doctors can only view your records after you approve via OTP or QR code.' },
                { icon: CheckCircle2, title: 'Full Audit Trail', desc: 'Every access to your records is logged — you always know who saw what and when.' },
                { icon: Siren, title: 'Emergency Protocol', desc: 'In emergencies, limited critical info is shared with audited temporary access.' },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <item.icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="card overflow-hidden p-0">
              <div className="bg-gradient-to-br from-primary-600 to-teal-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <ShieldPlus className="h-8 w-8" />
                  <div>
                    <p className="font-semibold">Security Dashboard</p>
                    <p className="text-xs text-primary-100">Real-time access monitoring</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { action: 'Dr. Sharma viewed your CBC Report', time: '2 hours ago', status: 'Approved', statusColor: 'success' },
                  { action: 'Consent request from Dr. Patel', time: '5 hours ago', status: 'Pending', statusColor: 'warning' },
                  { action: 'Emergency access by City Hospital', time: '1 day ago', status: 'Expired', statusColor: 'slate' },
                  { action: 'You uploaded Lipid Profile report', time: '2 days ago', status: 'New', statusColor: 'primary' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.time}</p>
                    </div>
                    <span className={`badge bg-${log.statusColor}-100 text-${log.statusColor}-700`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-teal-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to take control of your health?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">Join ONCLA today and experience healthcare that's faster, smarter, and built around you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => onGetStarted('patient')} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-soft transition-all hover:bg-primary-50 active:scale-[0.98]">
              <UserRound className="h-5 w-5" /> Get Started as Patient
            </button>
            <button onClick={() => onGetStarted('doctor')} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-6 py-3 text-base font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-primary-800 active:scale-[0.98]">
              <Stethoscope className="h-5 w-5" /> Join as Doctor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo size="md" />
              <p className="mt-4 max-w-md text-sm text-slate-400">
                ONCLA is an AI-powered digital healthcare platform that securely connects patients and doctors
                through Aadhaar-based authentication and patient consent.
              </p>
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> India</span>
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> SDG 3, 9, 10</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Platform</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how" className="hover:text-white">How it Works</a></li>
                <li><a href="#security" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">For Users</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><button onClick={() => onGetStarted('patient')} className="hover:text-white">Patient Portal</button></li>
                <li><button onClick={() => onGetStarted('doctor')} className="hover:text-white">Doctor Portal</button></li>
                <li><span className="hover:text-white">Emergency Support</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            ONCLA — Privacy-first healthcare. Designed for India's digital health ecosystem.
          </div>
        </div>
      </footer>
    </div>
  );
}
