import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { type NavPage } from '@/components/AppShell';
import {
  FileText, Brain, Bell, Siren, QrCode, ArrowRight,
  Droplet, AlertCircle, Clock, Phone, User2,
} from 'lucide-react';
import type { MedicalReport, MedicineReminder, PatientData, ConsentRequest } from '@/types';

interface PatientDashboardProps {
  onNavigate: (page: NavPage) => void;
}

export function PatientDashboard({ onNavigate }: PatientDashboardProps) {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [pendingConsents, setPendingConsents] = useState<ConsentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [reportsRes, remindersRes, patientRes, consentsRes] = await Promise.all([
        supabase.from('medical_reports').select('*').eq('patient_user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('medicine_reminders').select('*').eq('patient_user_id', user.id).eq('active', true).order('time'),
        supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('consent_requests').select('*').eq('patient_user_id', user.id).eq('status', 'pending').order('created_at', { ascending: false }),
      ]);
      setReports(reportsRes.data as MedicalReport[] ?? []);
      setReminders(remindersRes.data as MedicineReminder[] ?? []);
      setPatient(patientRes.data as PatientData | null);
      setPendingConsents(consentsRes.data as ConsentRequest[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading your dashboard...</p></div>;
  }

  const todayReminders = reminders.filter((r) => {
    const now = new Date();
    const [h, m] = r.time.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(h, m, 0, 0);
    return reminderTime >= now;
  }).slice(0, 4);

  const quickActions = [
    { label: 'Upload Report', icon: FileText, page: 'records' as const, color: 'bg-primary-50 text-primary-600' },
    { label: 'AI Summary', icon: Brain, page: 'ai-summary' as const, color: 'bg-teal-50 text-teal-600' },
    { label: 'Share QR', icon: QrCode, page: 'consent' as const, color: 'bg-accent-50 text-accent-600' },
    { label: 'Emergency', icon: Siren, page: 'emergency' as const, color: 'bg-error-50 text-error-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {profile?.full_name?.split(' ')[0] ?? 'there'}</h1>
          <p className="mt-1 text-sm text-slate-500">Here's your health overview for today</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {patient?.blood_group && (
            <span className="badge bg-error-100 text-error-700 ring-1 ring-error-200">
              <Droplet className="h-3 w-3" /> Blood: {patient.blood_group}
            </span>
          )}
          {patient?.existing_conditions && (
            <span className="badge bg-warning-100 text-warning-700 ring-1 ring-warning-200">
              <AlertCircle className="h-3 w-3" /> {patient.existing_conditions}
            </span>
          )}
        </div>
      </div>

      {/* Pending consent alert */}
      {pendingConsents.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-warning-50 p-4 ring-1 ring-warning-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning-600" />
            <p className="text-sm font-medium text-warning-800">
              You have {pendingConsents.length} pending consent request{pendingConsents.length > 1 ? 's' : ''} from doctors
            </p>
          </div>
          <button onClick={() => onNavigate('consent')} className="text-sm font-semibold text-warning-700 hover:text-warning-900">
            Review <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.page)}
            className="card flex flex-col items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-slate-700">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's reminders */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Today's Reminders</h2>
            <button onClick={() => onNavigate('reminders')} className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </button>
          </div>
          {todayReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                {reminders.length === 0 ? 'No reminders set up yet' : 'All reminders done for today!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{r.medicine_name}</p>
                    <p className="text-xs text-slate-500">{r.dosage} • {r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency contacts */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Phone className="h-5 w-5 text-error-500" /> Emergency Contacts
            </h2>
            <button onClick={() => onNavigate('profile')} className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Edit
            </button>
          </div>
          {patient?.emergency_contact_name ? (
            <div className="rounded-xl bg-error-50 p-4 ring-1 ring-error-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
                  <User2 className="h-5 w-5 text-error-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{patient.emergency_contact_name}</p>
                  {patient.emergency_contact_relation && (
                    <p className="text-xs text-slate-500">{patient.emergency_contact_relation}</p>
                  )}
                </div>
                {patient.emergency_contact_phone && (
                  <a href={`tel:${patient.emergency_contact_phone}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-100 text-success-600 transition-colors hover:bg-success-200">
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
              {patient.emergency_contact_phone && (
                <p className="mt-2 text-sm font-medium text-slate-600">{patient.emergency_contact_phone}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Phone className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No emergency contact set</p>
              <button onClick={() => onNavigate('profile')} className="mt-3 text-sm font-medium text-primary-600">
                Add an emergency contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent reports */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Reports</h2>
          <button onClick={() => onNavigate('records')} className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No reports uploaded yet</p>
            <button onClick={() => onNavigate('records')} className="mt-3 text-sm font-medium text-primary-600">
              Upload your first report
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{report.title}</p>
                  <p className="text-xs text-slate-500">
                    {report.report_type ?? 'Medical Report'} • {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {report.ai_summary && (
                  <span className="hidden sm:inline-flex badge bg-teal-100 text-teal-700">
                    <Brain className="h-3 w-3" /> AI
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
