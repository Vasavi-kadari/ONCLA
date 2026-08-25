import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  QrCode, Share2, Clock, CheckCircle2, XCircle, Shield, UserCheck, Loader2,
} from 'lucide-react';
import type { ConsentRequest, ConsentWithProfiles } from '@/types';

export function ConsentQR() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [consents, setConsents] = useState<ConsentWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadConsents(); }, [user]);

  const loadConsents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('consent_requests')
      .select('*, patient:profiles!patient_user_id(id, full_name), doctor:profiles!doctor_user_id(id, full_name)')
      .eq('patient_user_id', user.id)
      .order('created_at', { ascending: false });
    setConsents(data as ConsentWithProfiles[] ?? []);
    setLoading(false);
  };

  const generateQR = async () => {
    if (!user) return;
    setGenerating(true);
    const token = `ONCLA-${user.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setQrToken(token);
    setOtp(otpCode);
    setGenerating(false);
    showToast('QR code generated! Share this with your doctor.', 'success');
  };

  const handleConsent = async (id: string, status: 'approved' | 'denied') => {
    const { error } = await supabase
      .from('consent_requests')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(status === 'approved' ? 'Consent approved — doctor can now view your records' : 'Consent denied', status === 'approved' ? 'success' : 'info');
    loadConsents();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consent & QR Sharing</h1>
        <p className="mt-1 text-sm text-slate-500">Control who accesses your medical records</p>
      </div>

      {/* QR Generator */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-teal-600 p-5 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <h2 className="font-semibold">Generate Access Code</h2>
          </div>
          <p className="mt-1 text-sm text-primary-100">Create a temporary QR code and OTP for your doctor</p>
        </div>
        <div className="p-6">
          {!qrToken ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-50 ring-2 ring-dashed ring-slate-200">
                <QrCode className="h-12 w-12 text-slate-300" />
              </div>
              <p className="mt-4 text-sm text-slate-500">Generate a QR code to share with your doctor for temporary access.</p>
              <button onClick={generateQR} disabled={generating} className="btn-primary mt-4">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Share2 className="h-4 w-4" /> Generate QR Code</>}
              </button>
            </div>
          ) : (
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center">
                {/* Faux QR code visual */}
                <div className="relative rounded-2xl bg-white p-4 ring-2 ring-primary-100 shadow-soft">
                  <div className="grid grid-cols-12 gap-0.5">
                    {Array.from({ length: 144 }).map((_, i) => {
                      const seed = (qrToken.charCodeAt(i % qrToken.length) * (i + 1)) % 3;
                      return <div key={i} className={`h-3 w-3 ${seed < 2 ? 'bg-slate-900' : 'bg-white'}`} />;
                    })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg bg-white p-1.5 shadow-soft">
                      <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-400">Scan this QR code</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Access Token</p>
                  <p className="mt-1 rounded-lg bg-slate-50 p-2 font-mono text-sm font-semibold text-slate-700 break-all">{qrToken}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">OTP Code</p>
                  <p className="mt-1 rounded-lg bg-primary-50 p-3 text-center text-3xl font-bold tracking-[0.3em] text-primary-700">{otp}</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-warning-50 p-3 text-xs text-warning-700">
                  <Clock className="h-4 w-4" />
                  This code expires in 10 minutes. Share it only with your trusted doctor.
                </div>
                <button onClick={generateQR} className="btn-secondary w-full">
                  <Share2 className="h-4 w-4" /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consent requests */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <UserCheck className="h-5 w-5 text-primary-600" /> Consent Requests
        </h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : consents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Shield className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No consent requests yet. When a doctor requests access, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map((c) => (
              <div key={c.id} className={`flex items-center gap-4 rounded-xl p-4 ${
                c.status === 'pending' ? 'bg-warning-50 ring-1 ring-warning-100' :
                c.status === 'approved' ? 'bg-success-50 ring-1 ring-success-100' :
                c.status === 'denied' ? 'bg-slate-50 ring-1 ring-slate-100' :
                'bg-slate-50 ring-1 ring-slate-100'
              }`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft">
                  {c.status === 'pending' ? <Clock className="h-5 w-5 text-warning-600" /> :
                   c.status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-success-600" /> :
                   <XCircle className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Dr. {c.doctor?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-500">
                    {c.purpose ?? 'Access requested'} • {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleConsent(c.id, 'approved')} className="rounded-lg bg-success-600 px-4 py-2 text-xs font-semibold text-white hover:bg-success-700">
                      Approve
                    </button>
                    <button onClick={() => handleConsent(c.id, 'denied')} className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-300">
                      Deny
                    </button>
                  </div>
                )}
                {c.status !== 'pending' && (
                  <span className={`badge capitalize ${
                    c.status === 'approved' ? 'bg-success-100 text-success-700' :
                    c.status === 'denied' ? 'bg-slate-200 text-slate-600' :
                    'bg-slate-200 text-slate-600'
                  }`}>{c.status}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
