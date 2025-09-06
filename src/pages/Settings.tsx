/**
 * Settings Page
 * 
 * Comprehensive settings and preferences management for the MBS Analytics System.
 * Includes user preferences, system configuration, export settings, and accessibility options.
 * 
 * Features:
 * - User profile settings
 * - Display preferences (theme, language, timezone)
 * - Export and report configurations
 * - Accessibility settings
 * - Notification preferences
 * - System diagnostics
 */

import React, { useState, useEffect, useCallback } from 'react';
import './Settings.css';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: 'doctor' | 'nurse' | 'admin' | 'analyst';
  specialization?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr' | 'de';
  timezone: string;
  dateFormat: 'US' | 'EU' | 'ISO';
  currency: 'AUD' | 'USD' | 'EUR';
  defaultExportFormat: 'pdf' | 'excel' | 'html';
  autoRefreshInterval: 10 | 30 | 60 | 300; // seconds
  showConfidenceScores: boolean;
  enableRealTimeUpdates: boolean;
  compactView: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  auditAlerts: boolean;
  systemMaintenance: boolean;
  weeklyReports: boolean;
  conflictAlerts: boolean;
  lowConfidenceWarnings: boolean;
  exportComplete: boolean;
}

interface SystemDiagnostics {
  version: string;
  buildNumber: string;
  lastUpdated: string;
  storageUsed: string;
  cacheSize: string;
  apiStatus: 'online' | 'offline' | 'degraded';
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ============================================================================
// Main Settings Component
// ============================================================================

const Settings: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@clinic.com',
    organization: 'Melbourne General Practice',
    role: 'doctor',
    specialization: 'General Practice',
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'Australia/Melbourne',
      dateFormat: 'EU',
      currency: 'AUD',
      defaultExportFormat: 'pdf',
      autoRefreshInterval: 30,
      showConfidenceScores: true,
      enableRealTimeUpdates: true,
      compactView: false,
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      screenReaderOptimized: false
    }
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    auditAlerts: true,
    systemMaintenance: true,
    weeklyReports: true,
    conflictAlerts: true,
    lowConfidenceWarnings: false,
    exportComplete: true
  });

  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>({
    version: '1.2.4',
    buildNumber: '2024.08.31.001',
    lastUpdated: '2024-08-31',
    storageUsed: '127 MB',
    cacheSize: '45 MB',
    apiStatus: 'online',
    connectionQuality: 'excellent'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('mbsSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setUserProfile(prev => ({ ...prev, ...parsed.userProfile }));
        setNotifications(prev => ({ ...prev, ...parsed.notifications }));
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    }
  }, []);

  // Apply theme changes immediately
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userProfile.preferences.theme);
    if (userProfile.preferences.reducedMotion) {
      document.documentElement.style.setProperty('--motion-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--motion-duration');
    }
  }, [userProfile.preferences.theme, userProfile.preferences.reducedMotion]);

  // Save settings
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const settingsToSave = {
        userProfile,
        notifications,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('mbsSettings', JSON.stringify(settingsToSave));
      
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setHasUnsavedChanges(false);
      setSaveMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings');
      console.error('Settings save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [userProfile, notifications]);

  // Update profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Update notifications
  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  // Clear cache
  const handleClearCache = useCallback(async () => {
    if (confirm('Are you sure you want to clear the cache? This may temporarily slow down the application.')) {
      try {
        localStorage.removeItem('mbsCache');
        sessionStorage.clear();
        
        // Update diagnostics
        setDiagnostics(prev => ({
          ...prev,
          cacheSize: '0 MB',
          storageUsed: '85 MB'
        }));
        
        setSaveMessage('Cache cleared successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        setSaveMessage('Failed to clear cache');
      }
    }
  }, []);

  // Export settings
  const handleExportSettings = useCallback(() => {
    const exportData = {
      userProfile,
      notifications,
      exportedAt: new Date().toISOString(),
      version: diagnostics.version
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mbs_settings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [userProfile, notifications, diagnostics.version]);

  // Import settings
  const handleImportSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.userProfile) {
          setUserProfile(imported.userProfile);
        }
        if (imported.notifications) {
          setNotifications(imported.notifications);
        }
        setHasUnsavedChanges(true);
        setSaveMessage('Settings imported successfully');
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        setSaveMessage('Failed to import settings');
      }
    };
    reader.readAsText(file);
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderProfileTab = () => (
    <div className="settings-section">
      <h3 className="section-title">User Profile</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={userProfile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={userProfile.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">Organization</label>
          <input
            type="text"
            id="organization"
            value={userProfile.organization}
            onChange={(e) => updateProfile({ organization: e.target.value })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={userProfile.role}
            onChange={(e) => updateProfile({ role: e.target.value as UserProfile['role'] })}
            className="form-select"
          >
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="admin">Administrator</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>

        <div className="form-group form-group--full">
          <label htmlFor="specialization">Specialization</label>
          <input
            type="text"
            id="specialization"
            value={userProfile.specialization || ''}
            onChange={(e) => updateProfile({ specialization: e.target.value })}
            className="form-input"
            placeholder="e.g., General Practice, Cardiology"
          />
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Display Preferences</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={userProfile.preferences.theme}
            onChange={(e) => updatePreferences({ theme: e.target.value as UserPreferences['theme'] })}
            className="form-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={userProfile.preferences.language}
            onChange={(e) => updatePreferences({ language: e.target.value as UserPreferences['language'] })}
            className="form-select"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select
            id="timezone"
            value={userProfile.preferences.timezone}
            onChange={(e) => updatePreferences({ timezone: e.target.value })}
            className="form-select"
          >
            <option value="Australia/Melbourne">Melbourne (AEDT)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
            <option value="Australia/Perth">Perth (AWST)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dateFormat">Date Format</label>
          <select
            id="dateFormat"
            value={userProfile.preferences.dateFormat}
            onChange={(e) => updatePreferences({ dateFormat: e.target.value as UserPreferences['dateFormat'] })}
            className="form-select"
          >
            <option value="US">US (MM/DD/YYYY)</option>
            <option value="EU">EU (DD/MM/YYYY)</option>
            <option value="ISO">ISO (YYYY-MM-DD)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={userProfile.preferences.currency}
            onChange={(e) => updatePreferences({ currency: e.target.value as UserPreferences['currency'] })}
            className="form-select"
          >
            <option value="AUD">Australian Dollar (AUD)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="refreshInterval">Auto Refresh</label>
          <select
            id="refreshInterval"
            value={userProfile.preferences.autoRefreshInterval}
            onChange={(e) => updatePreferences({ autoRefreshInterval: parseInt(e.target.value) as UserPreferences['autoRefreshInterval'] })}
            className="form-select"
          >
            <option value="10">Every 10 seconds</option>
            <option value="30">Every 30 seconds</option>
            <option value="60">Every minute</option>
            <option value="300">Every 5 minutes</option>
          </select>
        </div>
      </div>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.showConfidenceScores}
            onChange={(e) => updatePreferences({ showConfidenceScores: e.target.checked })}
          />
          Show confidence scores
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.enableRealTimeUpdates}
            onChange={(e) => updatePreferences({ enableRealTimeUpdates: e.target.checked })}
          />
          Enable real-time updates
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.compactView}
            onChange={(e) => updatePreferences({ compactView: e.target.checked })}
          />
          Compact view mode
        </label>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Notification Preferences</h3>
      
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.emailNotifications}
            onChange={(e) => updateNotifications({ emailNotifications: e.target.checked })}
          />
          Email notifications
          <span className="checkbox-description">Receive notifications via email</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.pushNotifications}
            onChange={(e) => updateNotifications({ pushNotifications: e.target.checked })}
          />
          Push notifications
          <span className="checkbox-description">Browser push notifications</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.auditAlerts}
            onChange={(e) => updateNotifications({ auditAlerts: e.target.checked })}
          />
          Audit alerts
          <span className="checkbox-description">Important audit and compliance alerts</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.systemMaintenance}
            onChange={(e) => updateNotifications({ systemMaintenance: e.target.checked })}
          />
          System maintenance
          <span className="checkbox-description">Scheduled maintenance notifications</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.weeklyReports}
            onChange={(e) => updateNotifications({ weeklyReports: e.target.checked })}
          />
          Weekly reports
          <span className="checkbox-description">Automated weekly analytics reports</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.conflictAlerts}
            onChange={(e) => updateNotifications({ conflictAlerts: e.target.checked })}
          />
          Conflict alerts
          <span className="checkbox-description">MBS code conflict notifications</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.lowConfidenceWarnings}
            onChange={(e) => updateNotifications({ lowConfidenceWarnings: e.target.checked })}
          />
          Low confidence warnings
          <span className="checkbox-description">Warnings for low-confidence recommendations</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={notifications.exportComplete}
            onChange={(e) => updateNotifications({ exportComplete: e.target.checked })}
          />
          Export completion
          <span className="checkbox-description">Notifications when reports finish exporting</span>
        </label>
      </div>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Accessibility Options</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="fontSize">Font Size</label>
          <select
            id="fontSize"
            value={userProfile.preferences.fontSize}
            onChange={(e) => updatePreferences({ fontSize: e.target.value as UserPreferences['fontSize'] })}
            className="form-select"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>
      </div>

      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.highContrast}
            onChange={(e) => updatePreferences({ highContrast: e.target.checked })}
          />
          High contrast mode
          <span className="checkbox-description">Improved visibility for users with visual impairments</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.reducedMotion}
            onChange={(e) => updatePreferences({ reducedMotion: e.target.checked })}
          />
          Reduced motion
          <span className="checkbox-description">Minimize animations and transitions</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userProfile.preferences.screenReaderOptimized}
            onChange={(e) => updatePreferences({ screenReaderOptimized: e.target.checked })}
          />
          Screen reader optimized
          <span className="checkbox-description">Enhanced compatibility with screen readers</span>
        </label>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="settings-section">
      <h3 className="section-title">Advanced Settings</h3>
      
      <div className="form-group">
        <label htmlFor="defaultExportFormat">Default Export Format</label>
        <select
          id="defaultExportFormat"
          value={userProfile.preferences.defaultExportFormat}
          onChange={(e) => updatePreferences({ defaultExportFormat: e.target.value as UserPreferences['defaultExportFormat'] })}
          className="form-select"
        >
          <option value="pdf">PDF Document</option>
          <option value="excel">Excel Spreadsheet</option>
          <option value="html">HTML Report</option>
        </select>
      </div>

      <div className="section-divider">
        <h4>System Diagnostics</h4>
        <div className="diagnostics-grid">
          <div className="diagnostic-item">
            <span className="diagnostic-label">Version:</span>
            <span className="diagnostic-value">{diagnostics.version}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Build:</span>
            <span className="diagnostic-value">{diagnostics.buildNumber}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Storage Used:</span>
            <span className="diagnostic-value">{diagnostics.storageUsed}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Cache Size:</span>
            <span className="diagnostic-value">{diagnostics.cacheSize}</span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">API Status:</span>
            <span className={`diagnostic-value status-${diagnostics.apiStatus}`}>
              {diagnostics.apiStatus}
            </span>
          </div>
          <div className="diagnostic-item">
            <span className="diagnostic-label">Connection:</span>
            <span className={`diagnostic-value quality-${diagnostics.connectionQuality}`}>
              {diagnostics.connectionQuality}
            </span>
          </div>
        </div>
      </div>

      <div className="section-divider">
        <h4>Data Management</h4>
        <div className="button-group">
          <button className="settings-button secondary" onClick={handleClearCache}>
            Clear Cache
          </button>
          <button className="settings-button secondary" onClick={handleExportSettings}>
            Export Settings
          </button>
          <div className="import-settings">
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              id="import-file"
              className="file-input"
            />
            <label htmlFor="import-file" className="settings-button secondary">
              Import Settings
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page" data-testid="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your preferences and system options</p>
        
        <div className="header-actions">
          {hasUnsavedChanges && (
            <div className="unsaved-indicator">
              <span className="indicator-dot"></span>
              Unsaved changes
            </div>
          )}
          
          <button
            className={`save-button ${hasUnsavedChanges ? 'active' : ''}`}
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <>
                <span className="save-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                💾 Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="settings-container">
        <nav className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="settings-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'display' && renderDisplayTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'accessibility' && renderAccessibilityTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
        </main>
      </div>
    </div>
  );
};

export default Settings;