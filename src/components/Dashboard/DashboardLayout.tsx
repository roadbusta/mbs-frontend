/**
 * Dashboard Layout Component
 * 
 * Professional healthcare dashboard layout with sidebar navigation and main content area.
 * Based on the NeuAID AutoMBS interface shown in screenshots with modern medical-grade design.
 * 
 * Features:
 * - Responsive sidebar navigation with collapsible menu
 * - Professional healthcare UI with medical-grade styling
 * - Breadcrumb navigation and page titles
 * - Mobile-first responsive design
 * - Accessibility compliance with ARIA support
 */

import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
  /** Optional page title override */
  pageTitle?: string;
  /** Optional breadcrumb items */
  breadcrumbs?: { label: string; path?: string }[];
  /** Whether sidebar is collapsed by default */
  defaultCollapsed?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  breadcrumbs = [],
  defaultCollapsed = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items based on screenshots
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      description: 'Overview and key metrics'
    },
    {
      id: 'mbs-analysis',
      label: 'MBS Analysis',
      path: '/',
      icon: '🔍',
      description: 'Analyse consultation notes'
    },
    {
      id: 'performance',
      label: 'Performance',
      path: '/performance',
      icon: '📈',
      description: 'Analytics and metrics'
    },
    {
      id: 'audit-compliance',
      label: 'Audit & Compliance',
      path: '/audit',
      icon: '🛡️',
      description: 'Audit trails and compliance'
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: '⚙️',
      description: 'Application settings'
    }
  ];

  // Handle navigation
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  }, [navigate]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Get current page info
  const getCurrentPageInfo = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return {
      title: pageTitle || currentItem?.label || 'Dashboard',
      description: currentItem?.description || ''
    };
  };

  const currentPage = getCurrentPageInfo();

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    if (breadcrumbs.length > 0) return breadcrumbs;
    
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    if (!currentItem) return [{ label: 'Dashboard', path: '/dashboard' }];
    
    const crumbs = [{ label: 'Home', path: '/dashboard' }];
    if (currentItem.path !== '/dashboard') {
      crumbs.push({ label: currentItem.label, path: currentItem.path });
    }
    
    return crumbs;
  };

  const breadcrumbItems = getBreadcrumbs();

  return (
    <div className={`dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <nav 
        className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="brand-info">
            <div className="brand-logo">🧠</div>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <h1 className="brand-title">NeuAID</h1>
                <p className="brand-subtitle">AutoMBS</p>
              </div>
            )}
          </div>
          
          {/* Desktop toggle */}
          <button
            className="sidebar-toggle desktop-only"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="navigation-menu">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                aria-current={isActive ? 'page' : undefined}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    {item.description && (
                      <span className="nav-description">{item.description}</span>
                    )}
                  </div>
                )}
                {item.badge && !sidebarCollapsed && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="footer-info">
              <p className="system-status">System Online</p>
              <p className="version-info">v2.1.0</p>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main id="main-content" className="dashboard-main" role="main">
        {/* Header */}
        <header className="dashboard-header">
          {/* Mobile menu button */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Open navigation menu"
          >
            ☰
          </button>

          {/* Breadcrumbs */}
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
              {breadcrumbItems.map((crumb, index) => (
                <li key={index} className="breadcrumb-item">
                  {crumb.path && index < breadcrumbItems.length - 1 ? (
                    <button
                      className="breadcrumb-link"
                      onClick={() => handleNavigation(crumb.path!)}
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="breadcrumb-current" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbItems.length - 1 && (
                    <span className="breadcrumb-separator">→</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Page Title */}
          <div className="page-header">
            <h1 className="page-title">{currentPage.title}</h1>
            {currentPage.description && (
              <p className="page-description">{currentPage.description}</p>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;