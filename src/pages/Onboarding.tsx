import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Stethoscope, Hospital, BadgeCheck } from 'lucide-react';
import type { UserRole } from '@/types';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const role = (profile?.role ?? 'patient') as UserRole;

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

  const [specialization, setSpecialization] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [hospital, setHospital] = useState('');
  const [yearsExp, setYearsExp] = useState('');

  useEffect(() => {
    if (profile) setFullName(profile.full_name);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    if (profile?.full_name !== fullName || profile?.phone !== phone) {
      await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    }

    if (role === 'patient') {
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

      if (error) {
        showToast(error.message, 'error');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('doctors').upsert({
        user_id: user.id,
        specialization: specialization || null,
        registration_number: regNumber || null,
        hospital: hospital || null,
        years_experience: yearsExp ? parseInt(yearsExp) : null,
      });

      if (error) {
        showToast(error.message, 'error');
        setLoading(false);
        return;
      }
    }

    await refreshProfile();
    showToast('Profile saved successfully!', 'success');
    setLoading(false);
    onComplete();
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-soft">
            {role === 'doctor' ? <Stethoscope className="h-8 w-8 text-white" /> : <BadgeCheck className="h-8 w-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complete your profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            {role === 'doctor' ? 'Set up your doctor profile to start receiving patient consent requests.' : 'Set up your health profile to get the most out of ONCLA.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="label-field">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>

          {role === 'patient' ? (
            <>
              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Health Information</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label-field">Blood Group</label>
                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="input-field">
                      <option value="">Select</option>
                      {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Date of Birth</label>
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
                    <label className="label-field">Allergies</label>
                    <input value={allergies} onChange={(e) => setAllergies(e.target.value)} className="input-field" placeholder="e.g., Penicillin, Peanuts" />
                  </div>
                  <div>
                    <label className="label-field">Existing Conditions</label>
                    <input value={conditions} onChange={(e) => setConditions(e.target.value)} className="input-field" placeholder="e.g., Diabetes, Hypertension" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Insurance & Employment</h3>
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

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Emergency Contact</h3>
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
            </>
          ) : (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Professional Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Specialization</label>
                  <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="input-field" placeholder="e.g., Cardiology" />
                </div>
                <div>
                  <label className="label-field">Medical Registration No.</label>
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
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-base">
            {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
