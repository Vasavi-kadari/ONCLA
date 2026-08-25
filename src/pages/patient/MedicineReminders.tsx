import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Bell, Plus, Trash2, Clock, Pill, X, Calendar } from 'lucide-react';
import type { MedicineReminder } from '@/types';

export function MedicineReminders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadReminders(); }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('medicine_reminders')
      .select('*')
      .eq('patient_user_id', user.id)
      .order('active', { ascending: false })
      .order('time', { ascending: true });
    setReminders(data as MedicineReminder[] ?? []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !time) return;
    const { error } = await supabase.from('medicine_reminders').insert({
      patient_user_id: user.id,
      medicine_name: name,
      dosage: dosage || null,
      time,
      frequency,
      notes: notes || null,
    });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Reminder added!', 'success');
    setName(''); setDosage(''); setTime(''); setFrequency('daily'); setNotes('');
    setShowAdd(false);
    loadReminders();
  };

  const handleToggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from('medicine_reminders').update({ active: !active }).eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    loadReminders();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('medicine_reminders').delete().eq('id', id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Reminder deleted', 'info');
    loadReminders();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  const active = reminders.filter((r) => r.active);
  const inactive = reminders.filter((r) => !r.active);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medicine Reminders</h1>
          <p className="mt-1 text-sm text-slate-500">Never miss a dose with smart reminders</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Bell className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No reminders yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add your first medicine reminder to stay on track.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Add Reminder
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="flex h-2 w-2 rounded-full bg-success-500" /> Active ({active.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((r) => (
                  <div key={r.id} className="card p-4 transition-all hover:shadow-glow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                          <Pill className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{r.medicine_name}</p>
                          {r.dosage && <p className="text-xs text-slate-500">{r.dosage}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-error-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{formatTime(r.time)}</span>
                      <span className="badge bg-slate-100 text-slate-600">{r.frequency}</span>
                    </div>
                    {r.notes && <p className="mt-2 text-xs text-slate-400">{r.notes}</p>}
                    <button onClick={() => handleToggle(r.id, true)} className="mt-3 w-full rounded-lg bg-slate-50 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100">
                      Pause Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="flex h-2 w-2 rounded-full bg-slate-300" /> Paused ({inactive.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inactive.map((r) => (
                  <div key={r.id} className="card p-4 opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                          <Pill className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{r.medicine_name}</p>
                          {r.dosage && <p className="text-xs text-slate-500">{r.dosage}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-error-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{formatTime(r.time)}</span>
                    </div>
                    <button onClick={() => handleToggle(r.id, false)} className="mt-3 w-full rounded-lg bg-primary-50 py-2 text-xs font-medium text-primary-600 hover:bg-primary-100">
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md card p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Medicine Reminder</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label-field">Medicine Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" placeholder="e.g., Metformin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Dosage</label>
                  <input value={dosage} onChange={(e) => setDosage(e.target.value)} className="input-field" placeholder="e.g., 500mg" />
                </div>
                <div>
                  <label className="label-field">Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-field">Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-field">
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="thrice_daily">Thrice Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="label-field">Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" placeholder="e.g., Take after meals" />
              </div>
              <button type="submit" className="btn-primary w-full">
                <Calendar className="h-4 w-4" /> Add Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
