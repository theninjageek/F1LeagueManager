import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { PaddockLayout } from './features/paddock/PaddockLayout';

// Pages & Features
import { Grandstand } from './pages/Grandstand';
import { RaceCalendar } from './features/calendar/RaceCalendar';
import { EventResults } from './features/calendar/EventResults';
import { UserManagement } from './pages/UserManagement';

// Paddock Views
import { PaddockDashboard } from './features/paddock/PaddockDashboard';
import { RaceControl } from './features/paddock/RaceControl';
import { DriverMarket } from './features/paddock/DriverMarket';
import { SeasonManager } from './features/paddock/SeasonManager';
import { TeamManager } from './features/paddock/TeamManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route path="/" element={<MainLayout><Grandstand /></MainLayout>} />
              <Route path="/calendar" element={<MainLayout><RaceCalendar /></MainLayout>} />
              <Route path="/results/:eventId" element={<MainLayout><EventResults /></MainLayout>} />

              {/* Protected Admin Paddock Routes */}
              <Route path="/paddock/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PaddockLayout>
                      <Routes>
                        <Route index element={<PaddockDashboard />} />
                        <Route path="race-control" element={<RaceControl />} />
                        <Route path="drivers" element={<DriverMarket />} />
                        <Route path="seasons" element={<SeasonManager />} />
                        <Route path="teams" element={<TeamManager />} />
                        <Route path="users" element={<UserManagement />} />
                      </Routes>
                    </PaddockLayout>
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;