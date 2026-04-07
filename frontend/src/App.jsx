import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { PaddockLayout } from './features/paddock/PaddockLayout';

// Pages & Features
import { Grandstand } from './pages/Grandstand';
import { RaceCalendar } from './features/calendar/RaceCalendar';
import { EventResults } from './features/calendar/EventResults';

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
        <BrowserRouter>
          <MainLayout>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Grandstand />} />
              <Route path="/calendar" element={<RaceCalendar />} />
              <Route path="/results/:eventId" element={<EventResults />} />

              {/* ADMIN PADDOCK (Nested Routes) */}
              <Route path="/paddock/*" element={
                <PaddockLayout>
                  <Routes>
                    <Route index element={<PaddockDashboard />} />
                    <Route path="race-control" element={<RaceControl />} />
                    <Route path="drivers" element={<DriverMarket />} />
                    <Route path="seasons" element={<SeasonManager />} />
                    <Route path="teams" element={<TeamManager />} />
                  </Routes>
                </PaddockLayout>
              } />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;