/**
 * Application Router
 * 
 * Main routing configuration for the MBS frontend application.
 * Integrates the new dashboard with the existing consultation analysis interface.
 * 
 * Routes:
 * - /dashboard - Analytics dashboard overview
 * - / - MBS consultation analysis (existing functionality)  
 * - /performance - Performance metrics (placeholder)
 * - /audit - Audit and compliance (placeholder)
 * - /settings - Application settings (placeholder)
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ConsultationAnalysis from './pages/ConsultationAnalysis';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import AuditCompliance from './pages/AuditCompliance';
import Settings from './pages/Settings';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard routes with layout */}
        <Route path="/dashboard" element={
          <DashboardLayout pageTitle="Dashboard Overview">
            <DashboardOverview />
          </DashboardLayout>
        } />
        
        <Route path="/performance" element={
          <DashboardLayout pageTitle="Performance Analytics">
            <PerformanceAnalytics />
          </DashboardLayout>
        } />
        
        <Route path="/audit" element={
          <DashboardLayout pageTitle="Audit & Compliance">
            <AuditCompliance />
          </DashboardLayout>
        } />
        
        <Route path="/settings" element={
          <DashboardLayout pageTitle="Settings">
            <Settings />
          </DashboardLayout>
        } />

        {/* MBS Analysis page (existing functionality) - wrapped in dashboard layout */}
        <Route path="/" element={
          <DashboardLayout pageTitle="MBS Analysis">
            <ConsultationAnalysis />
          </DashboardLayout>
        } />
      </Routes>
    </Router>
  );
};

export default AppRouter;