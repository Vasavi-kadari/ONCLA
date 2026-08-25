import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  UserRound, Droplet, Calendar, AlertTriangle, Activity, Shield,
  Building2, Phone, Save, LogOut,
} from 'lucide-react';
import type { PatientData, Profile } from '@/types';

export function PatientProfile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  const [bloodGroup, setBloodGroup] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicy, setInsurancePolicy] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emRelation, setEmRelation] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle();
      const p = data as PatientData | null;
      setPatient(p);
      if (p) {
        setBloodGroup(p.blood_group ?? '');
        setDob(p.date_of_birth ?? '');
        setGender(p.gender ?? '');
        setAllergies(p.allergies ?? '');
        setConditions(p.existing_conditions ?? '');
        setInsuranceProvider(p.insurance_provider ?? '');
        setInsurancePolicy(p.insurance_policy_number ?? '');
        setEmployeeType(p.employee_type ?? '');
        setEmName(p.emergency_contact_name ?? '');
        setEmPhone(p.emergency_contact_phone ?? '');
        setEmRelation(p.emergency_contact_relation ?? '');
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

    const { error } = await supabase.from('patients').upsert({
      user_id: user.id,
      blood_group: bloodGroup || null,
      date_of_birth: dob || null,
      gender: gender || null,
      allergies: allergies || null,
      existing_conditions: conditions || null,
      insurance_provider: insuranceProvider || null,
      insurance_policy_number: insurancePolicy || null,
      employee_type: employeeType || null,
      emergency_contact_name: emName || null,
      emergency_contact_phone: emPhone || null,
      emergency_contact_relation: emRelation || null,
      updated_at: new Date().toISOString(),
    });

    if (error) { showToast(error.message, 'error'); setSaving(false); return; }
    showToast('Profile updated successfully!', 'success');
    setSaving(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your health information and emergency contacts</p>
        </div>
        <button onClick={signOut} className="btn-secondary">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <UserRound className="h-5 w-5 text-primary-600" /> Basic Information
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
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input value={profile?.aadhaar_ref ?? ''} disabled className="input-field bg-slate-50 pl-11 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Health info */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Activity className="h-5 w-5 text-primary-600" /> Health Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field"><Droplet className="inline h-4 w-4 mr-1" />Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="input-field">
                <option value="">Select</option>
                {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field"><Calendar className="inline h-4 w-4 mr-1" />Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field"><AlertTriangle className="inline h-4 w-4 mr-1" />Allergies</label>
              <input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="input-field" placeholder="e.g., Penicillin, Peanuts" />
            </div>
            <div>
              <label className="label-field">Existing Conditions</label>
              <input value={conditions} onChange={(e) => setConditions(e.target.value)} className="input-field" placeholder="e.g., Diabetes, Hypertension" />
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="h-5 w-5 text-primary-600" /> Insurance & Employment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Insurance Provider</label>
              <input value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} className="input-field" placeholder="e.g., Star Health" />
            </div>
            <div>
              <label className="label-field">Policy Number</label>
              <input value={insurancePolicy} onChange={(e) => setInsurancePolicy(e.target.value)} className="input-field" placeholder="Policy number" />
            </div>
            <div>
              <label className="label-field">Employee Type</label>
              <select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} className="input-field">
                <option value="">Select</option>
                <option value="salaried">Salaried</option>
                <option value="self-employed">Self-Employed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
                <option value="homemaker">Homemaker</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="card p-6 ring-2 ring-error-100">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
            <Phone className="h-5 w-5 text-error-600" /> Emergency Contact
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field">Contact Name</label>
              <input value={emName} onChange={(e) => setEmName(e.target.value)} className="input-field" placeholder="Emergency contact" />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} className="input-field" placeholder="Phone number" />
            </div>
            <div>
              <label className="label-field">Relation</label>
              <input value={emRelation} onChange={(e) => setEmRelation(e.target.value)} className="input-field" placeholder="e.g., Spouse, Parent" />
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
