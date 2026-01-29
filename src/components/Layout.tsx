import React from 'react';
import { useAppStore } from '../stores/app-store';
import Sidebar from './Sidebar';
import Header from './Header';
import ComplianceGuardrail from './ComplianceGuardrail';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen, auditMode } = useAppStore();

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <Header />

        {/* Main Content with Optional Guardrail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Page Content */}
          <main className={`flex-1 overflow-y-auto p-6 ${auditMode ? 'mr-80' : ''}`}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Compliance Guardrail Sidebar (visible in audit mode) */}
          {auditMode && (
            <div className="w-80 border-l border-surface-200 bg-white overflow-y-auto">
              <ComplianceGuardrail />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
