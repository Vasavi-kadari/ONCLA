/*
# ONCLA Core Schema

## Overview
Creates the core database tables for ONCLA — an AI-powered digital healthcare platform
that connects patients and doctors through consent-based medical record sharing.

## New Tables
1. `profiles` — User profiles linked to auth.users. Stores role (patient/doctor),
   full name, phone, and Aadhaar reference (masked). A single profile row per auth user.
2. `patients` — Patient-specific health data: blood group, DOB, allergies, existing
   conditions, insurance provider, policy number, employee type, emergency contacts.
3. `doctors` — Doctor-specific data: specialization, registration number, hospital,
   years of experience.
4. `medical_reports` — Uploaded medical reports for a patient: title, type, file URL,
   AI summary, AI explanation, upload date.
5. `consent_requests` — Consent requests from doctors to access a patient's records:
   OTP, status (pending/approved/denied/expired), expiry, granted scope.
6. `audit_logs` — Audit trail of every record access: who accessed, which patient,
   when, why (routine/emergency), consent reference.
7. `medicine_reminders` — Patient medicine reminders: medicine name, dosage, time,
   frequency, active status.
8. `vitals` — Patient vital readings: type (BP/sugar/heart rate), value, recorded at,
   status (normal/high/low), AI note.
9. `emergency_alerts` — Emergency SOS events: patient, location, timestamp, resolved status.

## Security
- RLS enabled on all tables.
- Owner-scoped policies for patient-facing tables (profiles, patients, medical_reports,
  medicine_reminders, vitals, emergency_alerts) — each authenticated user sees only their own rows.
- Consent requests: patient owns rows where patient_user_id matches; doctor can see rows they created.
- Audit logs: patient can see logs about their own records; doctor can see logs they generated.
- Doctors table: any authenticated user can read (so patients can see doctor info via consent),
  but only owner can update.
- All owner columns default to auth.uid() so inserts work without explicitly passing user_id.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor')),
  phone text,
  aadhaar_ref text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Patients health data
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  blood_group text,
  date_of_birth date,
  gender text,
  allergies text,
  existing_conditions text,
  insurance_provider text,
  insurance_policy_number text,
  employee_type text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_patient" ON patients;
CREATE POLICY "select_own_patient" ON patients
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_patient" ON patients;
CREATE POLICY "insert_own_patient" ON patients
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_patient" ON patients;
CREATE POLICY "update_own_patient" ON patients
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_patient" ON patients;
CREATE POLICY "delete_own_patient" ON patients
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Doctors data
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  specialization text,
  registration_number text,
  hospital text,
  years_experience int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_doctors" ON doctors;
CREATE POLICY "select_doctors" ON doctors
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_doctor" ON doctors;
CREATE POLICY "insert_own_doctor" ON doctors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_doctor" ON doctors;
CREATE POLICY "update_own_doctor" ON doctors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Medical reports
CREATE TABLE IF NOT EXISTS medical_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_type text,
  file_url text,
  file_name text,
  report_date date,
  ai_summary text,
  ai_explanation jsonb,
  tags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON medical_reports;
CREATE POLICY "select_own_reports" ON medical_reports
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "insert_own_reports" ON medical_reports;
CREATE POLICY "insert_own_reports" ON medical_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "update_own_reports" ON medical_reports;
CREATE POLICY "update_own_reports" ON medical_reports
  FOR UPDATE TO authenticated USING (auth.uid() = patient_user_id) WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "delete_own_reports" ON medical_reports;
CREATE POLICY "delete_own_reports" ON medical_reports
  FOR DELETE TO authenticated USING (auth.uid() = patient_user_id);

-- Consent requests
CREATE TABLE IF NOT EXISTS consent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  otp text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  purpose text,
  scope text DEFAULT 'all',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_consent_parties" ON consent_requests;
CREATE POLICY "select_consent_parties" ON consent_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id OR auth.uid() = doctor_user_id);

DROP POLICY IF EXISTS "insert_consent_doctor" ON consent_requests;
CREATE POLICY "insert_consent_doctor" ON consent_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);

DROP POLICY IF EXISTS "update_consent_patient" ON consent_requests;
CREATE POLICY "update_consent_patient" ON consent_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = patient_user_id OR auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = patient_user_id OR auth.uid() = doctor_user_id);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  reason text DEFAULT 'routine',
  consent_id uuid REFERENCES consent_requests(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_audit_logs" ON audit_logs;
CREATE POLICY "select_audit_logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id OR auth.uid() = doctor_user_id);

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Medicine reminders
CREATE TABLE IF NOT EXISTS medicine_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text,
  time text NOT NULL,
  frequency text DEFAULT 'daily',
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medicine_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reminders" ON medicine_reminders;
CREATE POLICY "select_own_reminders" ON medicine_reminders
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "insert_own_reminders" ON medicine_reminders;
CREATE POLICY "insert_own_reminders" ON medicine_reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "update_own_reminders" ON medicine_reminders;
CREATE POLICY "update_own_reminders" ON medicine_reminders
  FOR UPDATE TO authenticated USING (auth.uid() = patient_user_id) WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "delete_own_reminders" ON medicine_reminders;
CREATE POLICY "delete_own_reminders" ON medicine_reminders
  FOR DELETE TO authenticated USING (auth.uid() = patient_user_id);

-- Vitals
CREATE TABLE IF NOT EXISTS vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('blood_pressure', 'blood_sugar', 'heart_rate', 'temperature', 'spo2', 'weight')),
  value text NOT NULL,
  secondary_value text,
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'high', 'low', 'critical')),
  note text,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vitals" ON vitals;
CREATE POLICY "select_own_vitals" ON vitals
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "insert_own_vitals" ON vitals;
CREATE POLICY "insert_own_vitals" ON vitals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "update_own_vitals" ON vitals;
CREATE POLICY "update_own_vitals" ON vitals
  FOR UPDATE TO authenticated USING (auth.uid() = patient_user_id) WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "delete_own_vitals" ON vitals;
CREATE POLICY "delete_own_vitals" ON vitals
  FOR DELETE TO authenticated USING (auth.uid() = patient_user_id);

-- Emergency alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  location_lat float,
  location_lng float,
  location_text text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON emergency_alerts;
CREATE POLICY "select_own_alerts" ON emergency_alerts
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "insert_own_alerts" ON emergency_alerts;
CREATE POLICY "insert_own_alerts" ON emergency_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "update_own_alerts" ON emergency_alerts;
CREATE POLICY "update_own_alerts" ON emergency_alerts
  FOR UPDATE TO authenticated USING (auth.uid() = patient_user_id) WITH CHECK (auth.uid() = patient_user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_patient ON medical_reports(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON medicine_reminders(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_consent_patient ON consent_requests(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_consent_doctor ON consent_requests(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_logs(patient_user_id);