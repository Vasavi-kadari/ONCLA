import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Siren, MapPin, Phone, Droplet, AlertTriangle, Activity, Shield,
  Navigation, Hospital, CheckCircle2, X, User2,
} from 'lucide-react';
import type { PatientData, EmergencyAlert } from '@/types';

export function EmergencySOS() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; text: string } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const [patientRes, alertsRes] = await Promise.all([
        supabase.from('patients').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('emergency_alerts').select('*').eq('patient_user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setPatient(patientRes.data as PatientData | null);
      setAlerts(alertsRes.data as EmergencyAlert[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  const handleSOS = async () => {
    if (!user) return;
    setGettingLocation(true);

    const getLocation = () => new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });

    let lat: number | null = null;
    let lng: number | null = null;
    let locText = 'Location unavailable';

    try {
      const pos = await getLocation();
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      locText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocation({ lat, lng, text: locText });
    } catch {
      locText = 'Location sharing denied — sharing emergency info only';
    }

    setGettingLocation(false);

    const { error } = await supabase.from('emergency_alerts').insert({
      patient_user_id: user.id,
      location_lat: lat,
      location_lng: lng,
      location_text: locText,
      status: 'active',
    });

    if (error) { showToast(error.message, 'error'); return; }

    setSosActive(true);
    showToast('Emergency alert activated. Sharing your critical medical info with nearby hospitals.', 'error');

    // Refresh alerts
    const { data } = await supabase.from('emergency_alerts').select('*').eq('patient_user_id', user.id).order('created_at', { ascending: false }).limit(5);
    setAlerts(data as EmergencyAlert[] ?? []);
  };

  const handleCancel = async () => {
    if (!user) return;
    const activeAlert = alerts.find((a) => a.status === 'active');
    if (activeAlert) {
      await supabase.from('emergency_alerts').update({ status: 'cancelled', resolved_at: new Date().toISOString() }).eq('id', activeAlert.id);
    }
    setSosActive(false);
    showToast('Emergency alert cancelled', 'info');
    const { data } = await supabase.from('emergency_alerts').select('*').eq('patient_user_id', user.id).order('created_at', { ascending: false }).limit(5);
    setAlerts(data as EmergencyAlert[] ?? []);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;

  const emergencyInfo = [
    { icon: Droplet, label: 'Blood Group', value: patient?.blood_group ?? 'Not set', color: 'text-error-600', bg: 'bg-error-50' },
    { icon: AlertTriangle, label: 'Allergies', value: patient?.allergies ?? 'None recorded', color: 'text-warning-600', bg: 'bg-warning-50' },
    { icon: Activity, label: 'Existing Conditions', value: patient?.existing_conditions ?? 'None recorded', color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  const hasEmergencyContact = !!(patient?.emergency_contact_name || patient?.emergency_contact_phone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emergency SOS</h1>
        <p className="mt-1 text-sm text-slate-500">One tap shares your critical medical info with nearby hospitals</p>
      </div>

      {/* SOS Button */}
      <div className="card p-8">
        {!sosActive ? (
          <div className="flex flex-col items-center text-center">
            <button
              onClick={handleSOS}
              disabled={gettingLocation}
              className="group relative flex h-40 w-40 items-center justify-center rounded-full bg-error-500 shadow-glow transition-all hover:bg-error-600 active:scale-95 disabled:opacity-50"
            >
              <span className="absolute inset-0 rounded-full bg-error-400 animate-pulse-ring opacity-50" />
              {gettingLocation ? <LoadingSpinner size="lg" className="text-white" /> : (
                <div className="relative flex flex-col items-center">
                  <Siren className="h-10 w-10 text-white" />
                  <span className="mt-2 text-xl font-bold text-white">SOS</span>
                </div>
              )}
            </button>
            <p className="mt-6 text-sm font-medium text-slate-600">Press to activate emergency alert</p>
            <p className="mt-1 text-xs text-slate-400">This will share your location, blood group, allergies, and emergency contact</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center animate-scale-in">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-error-500 shadow-glow">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 text-white" />
                <span className="mt-2 text-sm font-bold text-white">ACTIVE</span>
              </div>
            </div>
            <p className="mt-6 text-base font-semibold text-error-600">Emergency alert is active</p>
            <p className="mt-1 text-sm text-slate-500">Your critical medical information is being shared with nearby hospitals.</p>
            {location && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-primary-500" />
                {location.text}
              </div>
            )}
            <button onClick={handleCancel} className="btn-secondary mt-6">
              <X className="h-4 w-4" /> Cancel Alert
            </button>
          </div>
        )}
      </div>

      {/* Emergency info preview */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <Shield className="h-5 w-5 text-primary-600" /> Emergency Medical Info
        </h2>
        <p className="mb-4 text-xs text-slate-500">This is the information that will be shared with hospitals during an emergency.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {emergencyInfo.map((info) => (
            <div key={info.label} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${info.bg}`}>
                <info.icon className={`h-5 w-5 ${info.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{info.label}</p>
                <p className="text-sm font-semibold text-slate-900 break-words">{info.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency contact — highlighted separately */}
        <div className="mt-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <User2 className="h-4 w-4 text-error-500" /> Emergency Contact
          </h3>
          {hasEmergencyContact ? (
            <div className="flex flex-col gap-3 rounded-xl bg-error-50 p-4 ring-1 ring-error-100 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-error-100">
                <User2 className="h-6 w-6 text-error-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{patient?.emergency_contact_name ?? 'Unknown'}</p>
                {patient?.emergency_contact_relation && (
                  <p className="text-xs text-slate-500">{patient.emergency_contact_relation}</p>
                )}
                {patient?.emergency_contact_phone && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-error-500" /> {patient.emergency_contact_phone}
                  </p>
                )}
              </div>
              {patient?.emergency_contact_phone && (
                <a href={`tel:${patient.emergency_contact_phone}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-500 text-white transition-colors hover:bg-success-600">
                  <Phone className="h-5 w-5" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No emergency contact set. Add one in your profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nearby hospitals (mock) */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <Hospital className="h-5 w-5 text-primary-600" /> Nearby Hospitals
        </h2>
        <div className="space-y-3">
          {[
            { name: 'City General Hospital', distance: '2.3 km', phone: '+91 80 1234 5678', emergency: true },
            { name: 'Apollo Medical Center', distance: '4.1 km', phone: '+91 80 2345 6789', emergency: true },
            { name: 'Sunrise Health Clinic', distance: '5.7 km', phone: '+91 80 3456 7890', emergency: false },
          ].map((h) => (
            <div key={h.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Hospital className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{h.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Navigation className="h-3 w-3" /> {h.distance}
                    {h.emergency && <span className="ml-2 badge bg-error-100 text-error-700">24/7 Emergency</span>}
                  </p>
                </div>
              </div>
              <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-600 hover:bg-success-100">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Alert history */}
      {alerts.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Alert History</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  alert.status === 'active' ? 'bg-error-50' : alert.status === 'resolved' ? 'bg-success-50' : 'bg-slate-100'
                }`}>
                  <Siren className={`h-4 w-4 ${
                    alert.status === 'active' ? 'text-error-500' : alert.status === 'resolved' ? 'text-success-500' : 'text-slate-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(alert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-500">{alert.location_text}</p>
                </div>
                <span className={`badge capitalize ${
                  alert.status === 'active' ? 'bg-error-100 text-error-700' :
                  alert.status === 'resolved' ? 'bg-success-100 text-success-700' :
                  'bg-slate-200 text-slate-600'
                }`}>{alert.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
