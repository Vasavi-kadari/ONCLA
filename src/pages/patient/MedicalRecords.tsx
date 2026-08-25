import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { generateAISummary } from '@/lib/ai';
import {
  FileText, Upload, Brain, Trash2, FilePlus2, X, Sparkles, CheckCircle2,
} from 'lucide-react';
import type { MedicalReport } from '@/types';

const reportTypes = [
  'CBC Blood Test', 'Blood Pressure', 'Blood Sugar', 'Lipid Profile',
  'Thyroid Panel', 'X-Ray', 'MRI Scan', 'Prescription', 'Other',
];

export function MedicalRecords() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('medical_reports')
      .select('*')
      .eq('patient_user_id', user.id)
      .order('created_at', { ascending: false });
    setReports(data as MedicalReport[] ?? []);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;
    setUploading(true);

    const { data, error } = await supabase.from('medical_reports').insert({
      patient_user_id: user.id,
      title,
      report_type: reportType || null,
      report_date: reportDate || null,
      file_name: fileName || null,
      tags: reportType ? [reportType] : [],
    }).select().single();

    if (error) {
      showToast(error.message, 'error');
      setUploading(false);
      return;
    }

    showToast('Report uploaded successfully!', 'success');
    setTitle('');
    setReportType('');
    setReportDate('');
    setFileName('');
    setShowUpload(false);
    setUploading(false);
    loadReports();
  };

  const handleGenerateAI = async (report: MedicalReport) => {
    setGeneratingAI(report.id);
    const result = generateAISummary(report.title, report.report_type ?? undefined);

    const { error } = await supabase
      .from('medical_reports')
      .update({
        ai_summary: result.summary,
        ai_explanation: { items: result.items, recommendation: result.recommendation },
      })
      .eq('id', report.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('AI summary generated!', 'success');
      loadReports();
    }
    setGeneratingAI(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('medical_reports').delete().eq('id', id);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Report deleted', 'info');
      loadReports();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medical Records</h1>
          <p className="mt-1 text-sm text-slate-500">Your encrypted digital health locker</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary">
          <Upload className="h-4 w-4" /> Upload Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No reports yet</h3>
          <p className="mt-1 text-sm text-slate-500">Upload your first medical report to get started.</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">
            <FilePlus2 className="h-4 w-4" /> Upload Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <div key={report.id} className="card p-5 transition-all hover:shadow-glow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-500">
                      {report.report_type ?? 'Medical Report'}
                      {report.report_date && ` • ${new Date(report.report_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                    {report.file_name && (
                      <p className="mt-1 text-xs text-slate-400 truncate max-w-[200px]">{report.file_name}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(report.id)} className="text-slate-400 transition-colors hover:text-error-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {report.ai_summary ? (
                <div className="mt-4 rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <p className="text-sm font-semibold text-teal-900">AI Summary</p>
                  </div>
                  <p className="mt-1.5 text-xs text-teal-700 line-clamp-3">{report.ai_summary}</p>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerateAI(report)}
                  disabled={generatingAI === report.id}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 py-2.5 text-sm font-semibold text-primary-700 ring-1 ring-primary-100 transition-all hover:from-primary-100 hover:to-teal-100"
                >
                  {generatingAI === report.id ? <LoadingSpinner size="sm" /> : <><Brain className="h-4 w-4" /> Generate AI Summary</>}
                </button>
              )}

              {report.ai_summary && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-success-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> AI analysis complete
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-md card p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Upload Medical Report</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label-field">Report Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-field" placeholder="e.g., CBC Blood Test - August 2026" />
              </div>
              <div>
                <label className="label-field">Report Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
                  <option value="">Select type</option>
                  {reportTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-field">Report Date</label>
                <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">Upload File (optional)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 transition-colors hover:border-primary-300 hover:bg-primary-50/50">
                  <Upload className="h-5 w-5" />
                  {fileName || 'Click to select a file'}
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png,.docx" />
                </label>
              </div>
              <button type="submit" disabled={uploading} className="btn-primary w-full">
                {uploading ? <LoadingSpinner size="sm" className="text-white" /> : 'Save Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
