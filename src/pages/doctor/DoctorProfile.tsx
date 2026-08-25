import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Stethoscope, Hospital, BadgeCheck, Save, LogOut,
} from 'lucide-react';
import type { DoctorData } from '@/types';

export function DoctorProfile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [specialization, setSpecialization] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [yearsExp, setYearsExp] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle();
      const d = data as DoctorData | null;
      setDoctor(d);
      if (d) {
        setSpecialization(d.specialization ?? '');
        setRegNumber(d.registration_number ?? '');
        setHospital(d.hospital ?? '');
        setYearsExp(d.years_experience?.toString() ?? '');
      }
      setLoading(false);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    if (profile?.full_name !== fullName || profile?.phone !== phone) {
      await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
      await refreshProfile();
    }

    const { error } = await supabase.from('doctors').upsert({
      user_id: user.id,
      specialization: specialization || null,
      registration_number: regNumber || null,
      hospital: hospital || null,
      years_experience: yearsExp ? parseInt(yearsExp) : null,
    });

    if (error) { showToast(error.message, 'error'); setSaving(false); return; }
    showToast('Profile updated successfully!', 'success');
    setSaving(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your professional information</p>
        </div>
        <button onClick={signOut} className="btn-secondary">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Stethoscope className="h-5 w-5 text-primary-600" /> Basic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input value={user?.email ?? ''} disabled className="input-field bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="label-field">Aadhaar Reference</label>
              <input value={profile?.aadhaar_ref ?? ''} disabled className="input-field bg-slate-50 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Professional info */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Hospital className="h-5 w-5 text-primary-600" /> Professional Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Specialization</label>
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="input-field" placeholder="e.g., Cardiology" />
            </div>
            <div>
              <label className="label-field"><BadgeCheck className="inline h-4 w-4 mr-1" />Medical Registration No.</label>
              <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="input-field" placeholder="Registration number" />
            </div>
            <div>
              <label className="label-field"><Hospital className="inline h-4 w-4 mr-1" />Hospital/Clinic</label>
              <input value={hospital} onChange={(e) => setHospital(e.target.value)} className="input-field" placeholder="Hospital name" />
            </div>
            <div>
              <label className="label-field">Years of Experience</label>
              <input type="number" min="0" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} className="input-field" placeholder="Years" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? <LoadingSpinner size="sm" className="text-white" /> : <><Save className="h-4 w-4" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
