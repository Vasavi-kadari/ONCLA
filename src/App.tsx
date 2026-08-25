import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { FullPageLoader } from '@/components/LoadingSpinner';
import { AppShell, type NavPage } from '@/components/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { Onboarding } from '@/pages/Onboarding';
import { PatientDashboard } from '@/pages/patient/PatientDashboard';
import { MedicalRecords } from '@/pages/patient/MedicalRecords';
import { AIHealthSummary } from '@/pages/patient/AIHealthSummary';
import { MedicineReminders } from '@/pages/patient/MedicineReminders';
import { ConsentQR } from '@/pages/patient/ConsentQR';
import { EmergencySOS } from '@/pages/patient/EmergencySOS';
import { PatientProfile } from '@/pages/patient/PatientProfile';
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard';
import { PatientSearch } from '@/pages/doctor/PatientSearch';
import { DoctorConsent } from '@/pages/doctor/DoctorConsent';
import { DoctorProfile } from '@/pages/doctor/DoctorProfile';
import { supabase } from '@/lib/supabase';
import type { UserRole, PatientData, DoctorData } from '@/types';

type AppState = 'landing' | 'auth' | 'onboarding' | 'app';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');
  const [authRole, setAuthRole] = useState<UserRole>('patient');
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profile) {
      // Check if onboarding is complete
      (async () => {
        if (profile.role === 'patient') {
          const { data } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
          if (data) {
            setHasCompletedOnboarding(true);
            setAppState('app');
            setCurrentPage('dashboard');
          } else {
            setAppState('onboarding');
          }
        } else {
          const { data } = await supabase.from('doctors').select('id').eq('user_id', user.id).maybeSingle();
          if (data) {
            setHasCompletedOnboarding(true);
            setAppState('app');
            setCurrentPage('doctor-dashboard');
          } else {
            setAppState('onboarding');
          }
        }
      })();
    } else if (user && !profile) {
      // Profile not loaded yet, wait
      setAppState('onboarding');
    } else {
      setAppState('landing');
    }
  }, [user, profile, loading]);

  const handleGetStarted = (role: UserRole) => {
    setAuthRole(role);
    setAppState('auth');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAppState('landing');
    setHasCompletedOnboarding(false);
  };

  if (loading) return <FullPageLoader message="Loading ONCLA..." />;

  if (appState === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (appState === 'auth') {
    return <AuthPage role={authRole} onBack={() => setAppState('landing')} />;
  }

  if (appState === 'onboarding' && user) {
    return (
      <Onboarding
        onComplete={() => {
          setHasCompletedOnboarding(true);
          setAppState('app');
          setCurrentPage(profile?.role === 'doctor' ? 'doctor-dashboard' : 'dashboard');
        }}
      />
    );
  }

  if (appState === 'app' && user && profile) {
    const isDoctor = profile.role === 'doctor';

    const renderPage = () => {
      if (isDoctor) {
        switch (currentPage) {
          case 'doctor-dashboard': return <DoctorDashboard onNavigate={setCurrentPage} />;
          case 'patients': return <PatientSearch />;
          case 'doctor-consent': return <DoctorConsent />;
          case 'doctor-profile': return <DoctorProfile />;
          default: return <DoctorDashboard onNavigate={setCurrentPage} />;
        }
      } else {
        switch (currentPage) {
          case 'dashboard': return <PatientDashboard onNavigate={setCurrentPage} />;
          case 'records': return <MedicalRecords />;
          case 'ai-summary': return <AIHealthSummary />;
          case 'reminders': return <MedicineReminders />;
          case 'consent': return <ConsentQR />;
          case 'emergency': return <EmergencySOS />;
          case 'profile': return <PatientProfile />;
          default: return <PatientDashboard onNavigate={setCurrentPage} />;
        }
      }
    };

    return (
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage} onSignOut={handleSignOut}>
        {renderPage()}
      </AppShell>
    );
  }

  return <FullPageLoader message="Loading ONCLA..." />;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
