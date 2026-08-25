export type UserRole = 'patient' | 'doctor';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  aadhaar_ref: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface PatientData {
  id: string;
  user_id: string;
  blood_group: string | null;
  date_of_birth: string | null;
  gender: string | null;
  allergies: string | null;
  existing_conditions: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  employee_type: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorData {
  id: string;
  user_id: string;
  specialization: string | null;
  registration_number: string | null;
  hospital: string | null;
  years_experience: number | null;
  created_at: string;
}

export interface MedicalReport {
  id: string;
  patient_user_id: string;
  title: string;
  report_type: string | null;
  file_url: string | null;
  file_name: string | null;
  report_date: string | null;
  ai_summary: string | null;
  ai_explanation: Record<string, unknown> | null;
  tags: string[] | null;
  created_at: string;
}

export interface ConsentRequest {
  id: string;
  patient_user_id: string;
  doctor_user_id: string;
  otp: string | null;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  purpose: string | null;
  scope: string | null;
  expires_at: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AuditLog {
  id: string;
  patient_user_id: string;
  doctor_user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  reason: string;
  consent_id: string | null;
  created_at: string;
}

export interface MedicineReminder {
  id: string;
  patient_user_id: string;
  medicine_name: string;
  dosage: string | null;
  time: string;
  frequency: string;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export type VitalType = 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'temperature' | 'spo2' | 'weight';
export type VitalStatus = 'normal' | 'high' | 'low' | 'critical';

export interface Vital {
  id: string;
  patient_user_id: string;
  type: VitalType;
  value: string;
  secondary_value: string | null;
  status: VitalStatus;
  note: string | null;
  recorded_at: string;
}

export interface EmergencyAlert {
  id: string;
  patient_user_id: string;
  location_lat: number | null;
  location_lng: number | null;
  location_text: string | null;
  status: 'active' | 'resolved' | 'cancelled';
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ConsentWithProfiles extends ConsentRequest {
  patient: Pick<Profile, 'id' | 'full_name'>;
  doctor: Pick<Profile, 'id' | 'full_name'>;
}
