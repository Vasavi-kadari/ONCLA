import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { type NavPage } from '@/components/AppShell';
import {
  Users, FileText, Clock, QrCode, ArrowRight, Activity, UserCheck, TrendingUp,
} from 'lucide-react';
import type { ConsentRequest, Profile } from '@/types';

interface DoctorDashboardProps {
  onNavigate: (page: NavPage) => void;
}

export function DoctorDashboard({ onNavigate }: DoctorDashboardProps) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ activeConsents: 0, pendingRequests: 0, totalPatients: 0 });
  const [recentConsents, setRecentConsents] = useState<(ConsentRequest & { patient: Pick<Profile, 'id' | 'full_name'> })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: consents } = await supabase
        .from('consent_requests')
        .select('*, patient:profiles!patient_user_id(id, full_name)')
        .eq('doctor_user_id', user.id)
        .order('created_at', { ascending: false });

      const allConsents = consents as (ConsentRequest & { patient: Pick<Profile, 'id' | 'full_name'> })[] ?? [];
      const active = allConsents.filter((c) => c.status === 'approved').length;
      const pending = allConsents.filter((c) => c.status === 'pending').length;
      const uniquePatients = new Set(allConsents.map((c) => c.patient_user_id)).size;

      setStats({ activeConsents: active, pendingRequests: pending, totalPatients: uniquePatients });
      setRecentConsents(allConsents.slice(0, 5));
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;

  const statCards = [
    { label: 'Active Consents', value: stats.activeConsents, icon: UserCheck, color: 'bg-success-50 text-success-600' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'bg-warning-50 text-warning-600' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'bg-primary-50 text-primary-600' },
  ];

  const quickActions = [
    { label: 'Search Patient', icon: Users, page: 'patients' as const, color: 'bg-primary-50 text-primary-600' },
    { label: 'Consent Requests', icon: QrCode, page: 'doctor-consent' as const, color: 'bg-accent-50 text-accent-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, Dr. {profile?.full_name?.split(' ').pop() ?? ''}</h1>
        <p className="mt-1 text-sm text-slate-500">Here's your practice overview</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.page)}
            className="card flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-slate-700">{action.label}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Recent consent requests */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Consent Requests</h2>
          <button onClick={() => onNavigate('doctor-consent')} className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
        {recentConsents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <QrCode className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No consent requests yet. Search for a patient to request access.</p>
            <button onClick={() => onNavigate('patients')} className="mt-3 text-sm font-medium text-primary-600">
              Search for a patient
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentConsents.map((c) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <UserCheck className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.patient?.full_name ?? 'Unknown patient'}</p>
                  <p className="text-xs text-slate-500">
                    {c.purpose ?? 'Access requested'} • {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`badge capitalize ${
                  c.status === 'approved' ? 'bg-success-100 text-success-700' :
                  c.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                  c.status === 'denied' ? 'bg-slate-200 text-slate-600' :
                  'bg-slate-200 text-slate-600'
                }`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
