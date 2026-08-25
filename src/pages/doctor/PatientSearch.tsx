import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Users, Search, QrCode, ScanLine, FileText, Brain, Clock, X,
  ArrowLeft, UserCheck, Shield, AlertCircle,
} from 'lucide-react';
import type { Profile, MedicalReport, PatientData, ConsentRequest } from '@/types';

interface PatientDetail {
  profile: Profile;
  patient: PatientData | null;
  reports: MedicalReport[];
  consent: ConsentRequest | null;
}

export function PatientSearch() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PatientDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanToken, setScanToken] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .ilike('full_name', `%${searchQuery}%`);

    setResults(data as Profile[] ?? []);
    setSearching(false);
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;
    setScanning(true);

    // QR tokens are in the format: ONCLA-XXXXXXXX-TIMESTAMP
    // Extract the patient ID prefix (first 8 chars after ONCLA-)
    const parts = scanToken.trim().toUpperCase().split('-');
    if (parts.length < 2 || parts[0] !== 'ONCLA') {
      showToast('Invalid QR code format. Please scan a valid ONCLA patient QR.', 'error');
      setScanning(false);
      return;
    }

    // Search for patients by matching the ID prefix
    const { data: allPatients } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient');

    const matched = (allPatients as Profile[] ?? []).find(
      (p) => p.id.slice(0, 8).toUpperCase() === parts[1],
    );

    if (matched) {
      showToast(`Patient found: ${matched.full_name}`, 'success');
      setScanToken('');
      setShowScanner(false);
      setScanning(false);
      handleSelectPatient(matched);
    } else {
      showToast('No patient found for this QR code.', 'error');
      setScanning(false);
    }
  };

  const handleSelectPatient = async (patientProfile: Profile) => {
    setLoadingDetail(true);

    const [patientRes, reportsRes, consentRes] = await Promise.all([
      supabase.from('patients').select('*').eq('user_id', patientProfile.id).maybeSingle(),
      supabase.from('medical_reports').select('*').eq('patient_user_id', patientProfile.id).order('created_at', { ascending: false }),
      supabase.from('consent_requests')
        .select('*')
        .eq('patient_user_id', patientProfile.id)
        .eq('doctor_user_id', user!.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setSelected({
      profile: patientProfile,
      patient: patientRes.data as PatientData | null,
      reports: reportsRes.data as MedicalReport[] ?? [],
      consent: consentRes.data as ConsentRequest | null,
    });
    setLoadingDetail(false);
  };

  const handleRequestConsent = async () => {
    if (!user || !selected) return;
    setRequesting(true);

    const { error } = await supabase.from('consent_requests').insert({
      patient_user_id: selected.profile.id,
      doctor_user_id: user.id,
      status: 'pending',
      purpose: 'Routine consultation',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (error) { showToast(error.message, 'error'); setRequesting(false); return; }
    showToast('Consent request sent to patient. They will approve via OTP on their phone.', 'success');
    setRequesting(false);
  };

  const hasAccess = selected?.consent?.status === 'approved';

  if (loadingDetail) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Search</h1>
        <p className="mt-1 text-sm text-slate-500">Find patients by name or scan their QR code to request consent</p>
      </div>

      {!selected ? (
        <>
          {/* Search & Scan */}
          <div className="card p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <form onSubmit={handleSearch} className="flex flex-1 gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-11"
                    placeholder="Search by patient name..."
                  />
                </div>
                <button type="submit" disabled={searching} className="btn-primary whitespace-nowrap">
                  {searching ? <LoadingSpinner size="sm" className="text-white" /> : 'Search'}
                </button>
              </form>
              <button onClick={() => setShowScanner(true)} className="btn-secondary whitespace-nowrap">
                <ScanLine className="h-4 w-4" /> Scan QR
              </button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="card overflow-hidden">
              <p className="border-b border-slate-100 p-4 text-sm font-medium text-slate-500">{results.length} patient{results.length > 1 ? 's' : ''} found</p>
              <div className="divide-y divide-slate-100">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-teal-500 text-sm font-semibold text-white">
                      {p.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{p.full_name}</p>
                      {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                    </div>
                    <ArrowLeft className="h-4 w-4 rotate-180 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && searching === false && searchQuery && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">No patients found. Try a different name.</p>
            </div>
          )}

          {!searchQuery && !showScanner && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <Search className="h-8 w-8 text-primary-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Find a patient</h3>
              <p className="mt-1 text-sm text-slate-500">Search by patient name or scan their ONCLA QR code.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Patient detail */}
          <button onClick={() => setSelected(null)} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </button>

          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 text-xl font-semibold text-white">
                  {selected.profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selected.profile.full_name}</h2>
                  <p className="text-sm text-slate-500">
                    {selected.patient?.blood_group && `Blood: ${selected.patient.blood_group} • `}
                    {selected.patient?.gender ?? 'Gender not set'}
                    {selected.patient?.date_of_birth && ` • DOB: ${new Date(selected.patient.date_of_birth).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
              </div>
              {hasAccess ? (
                <span className="badge bg-success-100 text-success-700">
                  <Shield className="h-3 w-3" /> Access Granted
                </span>
              ) : (
                <button onClick={handleRequestConsent} disabled={requesting} className="btn-primary">
                  {requesting ? <LoadingSpinner size="sm" className="text-white" /> : <><QrCode className="h-4 w-4" /> Request Consent</>}
                </button>
              )}
            </div>
          </div>

          {!hasAccess ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-50">
                <AlertCircle className="h-7 w-7 text-warning-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Consent Required</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">You need the patient's consent to view their medical records. Request consent and the patient will approve via OTP on their phone.</p>
            </div>
          ) : (
            <>
              {/* Emergency info */}
              <div className="card p-6 ring-2 ring-error-100">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <AlertCircle className="h-5 w-5 text-error-600" /> Critical Medical Info
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Blood Group', value: selected.patient?.blood_group },
                    { label: 'Allergies', value: selected.patient?.allergies },
                    { label: 'Conditions', value: selected.patient?.existing_conditions },
                    { label: 'Emergency Contact', value: selected.patient?.emergency_contact_name ?? null },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.value || 'Not recorded'}</p>
                    </div>
                  ))}
                </div>
                {selected.patient?.emergency_contact_name && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-error-50 p-3 ring-1 ring-error-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-100">
                      <AlertCircle className="h-4 w-4 text-error-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {selected.patient.emergency_contact_name}
                        {selected.patient.emergency_contact_relation && <span className="font-normal text-slate-500"> ({selected.patient.emergency_contact_relation})</span>}
                      </p>
                      {selected.patient.emergency_contact_phone && (
                        <a href={`tel:${selected.patient.emergency_contact_phone}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          {selected.patient.emergency_contact_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reports */}
              <div className="card p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <FileText className="h-5 w-5 text-primary-600" /> Medical Reports ({selected.reports.length})
                </h3>
                {selected.reports.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No reports on file</p>
                ) : (
                  <div className="space-y-2">
                    {selected.reports.map((report) => (
                      <div key={report.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                          <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{report.title}</p>
                          <p className="text-xs text-slate-500">
                            {report.report_type ?? 'Report'} • {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        {report.ai_summary && (
                          <span className="hidden sm:inline-flex badge bg-teal-100 text-teal-700">
                            <Brain className="h-3 w-3" /> AI Summary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* QR Scanner modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in" onClick={() => setShowScanner(false)}>
          <div className="w-full max-w-md card p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ScanLine className="h-5 w-5 text-primary-600" /> Scan Patient QR
              </h2>
              <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 flex flex-col items-center">
              {/* Faux scanner viewport */}
              <div className="relative h-48 w-48 overflow-hidden rounded-2xl bg-slate-900 ring-4 ring-primary-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine className="h-16 w-16 text-primary-400" />
                </div>
                <div className="absolute inset-x-4 top-4 h-0.5 bg-primary-400" />
                <div className="absolute inset-x-4 bottom-4 h-0.5 bg-primary-400" />
                <div className="absolute inset-y-4 left-4 w-0.5 bg-primary-400" />
                <div className="absolute inset-y-4 right-4 w-0.5 bg-primary-400" />
                <div className="absolute inset-x-6 top-1/2 h-0.5 bg-primary-400 animate-pulse" style={{ animation: 'pulseRing 2s ease-in-out infinite' }} />
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">Position the patient's QR code within the frame</p>
            </div>
            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div>
                <label className="label-field">Or enter QR token manually</label>
                <input
                  value={scanToken}
                  onChange={(e) => setScanToken(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="ONCLA-XXXXXXXX-..."
                />
              </div>
              <button type="submit" disabled={scanning} className="btn-primary w-full">
                {scanning ? <LoadingSpinner size="sm" className="text-white" /> : 'Find Patient'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
