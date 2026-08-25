import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  QrCode, Clock, CheckCircle2, XCircle, UserCheck, Shield,
} from 'lucide-react';
import type { ConsentWithProfiles } from '@/types';

export function DoctorConsent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [consents, setConsents] = useState<ConsentWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { loadConsents(); }, [user]);

  const loadConsents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('consent_requests')
      .select('*, patient:profiles!patient_user_id(id, full_name), doctor:profiles!doctor_user_id(id, full_name)')
      .eq('doctor_user_id', user.id)
      .order('created_at', { ascending: false });
    setConsents(data as ConsentWithProfiles[] ?? []);
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from('consent_requests')
      .update({ status: 'expired', resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Request cancelled', 'info');
    loadConsents();
  };

  const filtered = filter === 'all' ? consents : consents.filter((c) => c.status === filter);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'denied', label: 'Denied' },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consent Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage your patient access requests</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <QrCode className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No consent requests</h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === 'all' ? 'Search for a patient and request access to their records.' : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    c.status === 'pending' ? 'bg-warning-50' :
                    c.status === 'approved' ? 'bg-success-50' :
                    'bg-slate-100'
                  }`}>
                    {c.status === 'pending' ? <Clock className="h-5 w-5 text-warning-600" /> :
                     c.status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-success-600" /> :
                     <XCircle className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{c.patient?.full_name ?? 'Unknown patient'}</p>
                    <p className="text-xs text-slate-500">
                      {c.purpose ?? 'Routine consultation'} • {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {c.expires_at && c.status === 'pending' && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-warning-600">
                        <Clock className="h-3 w-3" /> Expires {new Date(c.expires_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {c.status === 'approved' && c.resolved_at && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-success-600">
                        <Shield className="h-3 w-3" /> Approved {new Date(c.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge capitalize ${
                    c.status === 'approved' ? 'bg-success-100 text-success-700' :
                    c.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                    c.status === 'denied' ? 'bg-error-100 text-error-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>{c.status}</span>
                  {c.status === 'pending' && (
                    <button onClick={() => handleCancel(c.id)} className="text-xs font-medium text-slate-400 hover:text-error-500">
                      Cancel
                    </button>
                  )}
                  {c.status === 'approved' && (
                    <span className="flex items-center gap-1 text-xs font-medium text-success-600">
                      <UserCheck className="h-3.5 w-3.5" /> Full access
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
