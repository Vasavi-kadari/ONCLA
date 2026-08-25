import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Brain, Sparkles, FileText, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import type { MedicalReport } from '@/types';
import type { AISummaryResult } from '@/lib/ai';

export function AIHealthSummary() {
  const { user } = useAuth();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('patient_user_id', user.id)
        .order('created_at', { ascending: false });
      setReports(data as MedicalReport[] ?? []);
      if (data && data.length > 0) setSelectedId(data[0].id);
      setLoading(false);
    })();
  }, [user]);

  const selected = reports.find((r) => r.id === selectedId);

  const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
    normal: { color: 'text-success-700', bg: 'bg-success-50 ring-success-100', icon: CheckCircle2 },
    high: { color: 'text-warning-700', bg: 'bg-warning-50 ring-warning-100', icon: AlertTriangle },
    low: { color: 'text-warning-700', bg: 'bg-warning-50 ring-warning-100', icon: AlertTriangle },
    critical: { color: 'text-error-700', bg: 'bg-error-50 ring-error-100', icon: AlertTriangle },
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading...</p></div>;

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Health Summary</h1>
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Brain className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No reports to analyze</h3>
          <p className="mt-1 text-sm text-slate-500">Upload a medical report first, then generate an AI summary to see it here.</p>
        </div>
      </div>
    );
  }

  let aiData: AISummaryResult | null = null;
  if (selected?.ai_explanation) {
    const expl = selected.ai_explanation as { items: AISummaryResult['items']; recommendation: string };
    aiData = {
      summary: selected.ai_summary ?? '',
      items: expl.items ?? [],
      recommendation: expl.recommendation ?? '',
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Health Summary</h1>
        <p className="mt-1 text-sm text-slate-500">Understand your medical reports in simple language</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report list */}
        <div className="card p-4 lg:col-span-1">
          <h3 className="mb-3 px-2 text-sm font-semibold text-slate-900">Your Reports</h3>
          <div className="space-y-1.5">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  selectedId === report.id ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-slate-50'
                }`}
              >
                <FileText className={`h-5 w-5 flex-shrink-0 ${selectedId === report.id ? 'text-primary-600' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{report.title}</p>
                  <p className="text-xs text-slate-500">{report.report_type ?? 'Report'}</p>
                </div>
                {report.ai_summary && <Sparkles className="h-4 w-4 flex-shrink-0 text-teal-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* AI Summary detail */}
        <div className="lg:col-span-2">
          {selected && aiData ? (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-teal-600 p-5 text-white">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    <h2 className="font-semibold">AI Analysis: {selected.title}</h2>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-700 leading-relaxed">{aiData.summary}</p>
                </div>
              </div>

              {/* Items */}
              <div className="card p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-primary-600" /> Parameter Breakdown
                </h3>
                <div className="space-y-3">
                  {aiData.items.map((item, i) => {
                    const cfg = statusConfig[item.status] ?? statusConfig.normal;
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className={`rounded-xl p-4 ring-1 ${cfg.bg}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${cfg.color}`} />
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.parameter}</p>
                              <p className="text-xs text-slate-500">{item.value}</p>
                            </div>
                          </div>
                          <span className={`badge ${cfg.bg} ${cfg.color} ring-1 capitalize`}>{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{item.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation */}
              <div className="card p-5 ring-2 ring-accent-100">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50">
                    <Lightbulb className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Suggested Next Steps</h3>
                    <p className="mt-1 text-sm text-slate-600">{aiData.recommendation}</p>
                  </div>
                </div>
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  AI provides explanations only. Your doctor makes the final diagnosis and treatment decisions.
                </p>
              </div>
            </div>
          ) : selected ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Brain className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No AI summary yet</h3>
              <p className="mt-1 text-sm text-slate-500">Go to Medical Records to generate an AI summary for this report.</p>
            </div>
          ) : (
            <div className="card flex items-center justify-center py-16 text-slate-400">Select a report to view its AI summary</div>
          )}
        </div>
      </div>
    </div>
  );
}
