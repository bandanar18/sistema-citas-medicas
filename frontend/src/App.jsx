import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import TopHeader from './components/Layout/TopHeader';

import Login          from './pages/Login';
import Search         from './pages/Search';
import PatientForm    from './pages/Patients/PatientForm';
import PatientDetail  from './pages/Patients/PatientDetail';
import AppointmentForm from './pages/Appointments/AppointmentForm';
import Reports        from './pages/Reports';
import History        from './pages/History';

const DashboardLayout = () => {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
        <TopHeader pathname={location.pathname} />
        <main style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: 'var(--blanco-fondo)' }}>
          <Routes>
            <Route path="/"                  element={<Search />} />
            <Route path="/patients/new"      element={<PatientForm mode="create" />} />
            <Route path="/patients/:id"      element={<PatientDetail />} />
            <Route path="/patients/:id/edit" element={<PatientForm mode="edit" />} />
            <Route path="/appointments/new"  element={<AppointmentForm />} />
            <Route path="/reports"           element={<Reports />} />
            <Route path="/history"           element={<History />} />
            <Route path="*"                  element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
