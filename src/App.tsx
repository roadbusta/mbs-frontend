/**
 * Main Application Component
 * 
 * Root component that provides routing and dashboard navigation for the
 * MBS Coding Assistant. Integrates existing consultation analysis with
 * new dashboard analytics and navigation system.
 * 
 * Features:
 * - React Router integration for navigation
 * - Dashboard layout with sidebar navigation
 * - Existing consultation analysis functionality
 * - Analytics dashboard overview
 * - Audit trail integration
 */

import React from 'react';
import AppRouter from './AppRouter';
import './styles/App.css';

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <AppRouter />
    </div>
  );
};

export default App;