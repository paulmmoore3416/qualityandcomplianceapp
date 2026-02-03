import { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { useAuthStore } from './stores/auth-store';
import { initializeKeyboardShortcuts } from './stores/keyboard-store';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import CommandPalette from './components/CommandPalette';
import React, { Suspense } from 'react';
const Dashboard = React.lazy(() => import('./components/views/Dashboard'));
const MetricsView = React.lazy(() => import('./components/views/MetricsView'));
const RiskMatrixView = React.lazy(() => import('./components/views/RiskMatrixView'));
const CAPAView = React.lazy(() => import('./components/views/CAPAView'));
const NCRView = React.lazy(() => import('./components/views/NCRView'));
const LifecycleView = React.lazy(() => import('./components/views/LifecycleView'));
const AuditView = React.lazy(() => import('./components/views/AuditView'));
const SettingsView = React.lazy(() => import('./components/views/SettingsView'));
const VigilanceView = React.lazy(() => import('./components/views/VigilanceView'));
const SupplierView = React.lazy(() => import('./components/views/SupplierView'));
const TrainingView = React.lazy(() => import('./components/views/TrainingView'));
const ChangeControlView = React.lazy(() => import('./components/views/ChangeControlView'));
const DocumentsView = React.lazy(() => import('./components/views/DocumentsView'));
const AdminView = React.lazy(() => import('./components/views/AdminView'));
const AIAgentsView = React.lazy(() => import('./components/views/AIAgentsView'));
const ValidationView = React.lazy(() => import('./components/views/ValidationView'));
const AnalyticsDashboard = React.lazy(() => import('./components/views/AnalyticsDashboard'));
import { EnhancedLoginView } from './components/views/EnhancedLoginView';

// Initialize keyboard shortcuts on app load
initializeKeyboardShortcuts();

function App() {
  const { activeView, loadData } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <EnhancedLoginView />
        <ToastContainer />
      </ErrorBoundary>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'metrics':
        return <MetricsView />;
      case 'risk':
        return <RiskMatrixView />;
      case 'capa':
        return <CAPAView />;
      case 'ncr':
        return <NCRView />;
      case 'vigilance':
        return <VigilanceView />;
      case 'lifecycle':
        return <LifecycleView />;
      case 'changecontrol':
        return <ChangeControlView />;
      case 'suppliers':
        return <SupplierView />;
      case 'training':
        return <TrainingView />;
      case 'documents':
        return <DocumentsView />;
      case 'aiagents':
        return <AIAgentsView />;
      case 'admin':
        return <AdminView />;
      case 'audit':
        return <AuditView />;
      case 'settings':
        return <SettingsView />;
      case 'validation':
        return <ValidationView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          {renderView()}
        </Suspense>
      </Layout>
      <CommandPalette />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
