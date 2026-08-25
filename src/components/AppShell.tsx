import { type ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, FileText, Brain, Bell, Siren, QrCode,
  UserRound, LogOut, Stethoscope, ShieldCheck, Users,
} from 'lucide-react';

export type NavPage =
  | 'dashboard' | 'records' | 'ai-summary' | 'reminders'
  | 'emergency' | 'consent' | 'profile'
  | 'doctor-dashboard' | 'patients' | 'doctor-consent' | 'doctor-profile';

interface AppShellProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onSignOut: () => void;
  children: ReactNode;
}

export function AppShell({ currentPage, onNavigate, onSignOut, children }: AppShellProps) {
  const { profile } = useAuth();
  const isDoctor = profile?.role === 'doctor';

  const patientNav = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'records' as const, label: 'Medical Records', icon: FileText },
    { id: 'ai-summary' as const, label: 'AI Health Summary', icon: Brain },
    { id: 'reminders' as const, label: 'Medicine Reminders', icon: Bell },
    { id: 'consent' as const, label: 'Consent & QR', icon: QrCode },
    { id: 'emergency' as const, label: 'Emergency SOS', icon: Siren },
    { id: 'profile' as const, label: 'Profile', icon: UserRound },
  ];

  const doctorNav = [
    { id: 'doctor-dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as const, label: 'Patient Search', icon: Users },
    { id: 'doctor-consent' as const, label: 'Consent Requests', icon: QrCode },
    { id: 'doctor-profile' as const, label: 'Profile', icon: Stethoscope },
  ];

  const nav = isDoctor ? doctorNav : patientNav;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${currentPage === item.id ? 'text-primary-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-teal-500 text-sm font-semibold text-white">
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{profile?.full_name ?? 'User'}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <ShieldCheck className="h-3 w-3" /> {isDoctor ? 'Doctor' : 'Patient'}
              </p>
            </div>
          </div>
          <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-error-50 hover:text-error-700">
            <LogOut className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo size="sm" />
        <button onClick={onSignOut} className="btn-ghost">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
              currentPage === item.id ? 'text-primary-600' : 'text-slate-400'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="max-w-[60px] truncate">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
