import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Command,
  Search,
  Home,
  BarChart3,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Box,
  Settings,
  Moon,
  Sun,
  LogOut,
  FlaskConical,
  ClipboardList,
  GraduationCap,
  Factory,
  Cpu,
  RefreshCw,
  Download,
  Plus,
  Eye,
} from 'lucide-react';
import { useKeyboardStore } from '../stores/keyboard-store';
import { useAppStore } from '../stores/app-store';
import { useAuthStore } from '../stores/auth-store';
import { useThemeStore } from '../stores/theme-store';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: 'navigation' | 'actions' | 'settings' | 'recent';
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isCommandPaletteOpen, closeCommandPalette } = useKeyboardStore();
  const { setActiveView, saveData, exportAuditReport } = useAppStore();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', title: 'Go to Dashboard', icon: <Home className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('dashboard'), keywords: ['home', 'main'] },
    { id: 'nav-metrics', title: 'Go to Metrics', icon: <BarChart3 className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('metrics'), keywords: ['kpi', 'performance'] },
    { id: 'nav-capa', title: 'Go to CAPA', icon: <Shield className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('capa'), keywords: ['corrective', 'preventive'] },
    { id: 'nav-ncr', title: 'Go to NCR', icon: <AlertTriangle className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('ncr'), keywords: ['nonconformance', 'defect'] },
    { id: 'nav-risk', title: 'Go to Risk Matrix', icon: <AlertTriangle className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('risk'), keywords: ['hazard', 'iso14971'] },
    { id: 'nav-documents', title: 'Go to Documents', icon: <FileText className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('documents'), keywords: ['files', 'dms'] },
    { id: 'nav-suppliers', title: 'Go to Suppliers', icon: <Box className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('suppliers'), keywords: ['vendor', 'asl'] },
    { id: 'nav-training', title: 'Go to Training', icon: <GraduationCap className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('training'), keywords: ['education', 'certification'] },
    { id: 'nav-change', title: 'Go to Change Control', icon: <ClipboardList className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('changecontrol'), keywords: ['ecn', 'revision'] },
    { id: 'nav-validation', title: 'Go to Validation', icon: <FlaskConical className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('validation'), keywords: ['evt', 'dvt', 'pvt', 'dvpr'] },
    { id: 'nav-vigilance', title: 'Go to Vigilance', icon: <Eye className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('vigilance'), keywords: ['complaint', 'adverse'] },
    { id: 'nav-lifecycle', title: 'Go to Lifecycle', icon: <Factory className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('lifecycle'), keywords: ['product', 'phase'] },
    { id: 'nav-ai', title: 'Go to AI Agents', icon: <Cpu className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('aiagents'), keywords: ['llm', 'automation'] },
    { id: 'nav-admin', title: 'Go to Admin', icon: <Users className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('admin'), keywords: ['users', 'roles'] },
    { id: 'nav-settings', title: 'Go to Settings', icon: <Settings className="w-4 h-4" />, category: 'navigation', action: () => setActiveView('settings'), keywords: ['preferences', 'config'] },

    // Actions
    { id: 'action-new-capa', title: 'Create New CAPA', subtitle: 'Corrective/Preventive Action', icon: <Plus className="w-4 h-4" />, category: 'actions', action: () => { setActiveView('capa'); }, keywords: ['add'] },
    { id: 'action-new-ncr', title: 'Create New NCR', subtitle: 'Non-Conformance Report', icon: <Plus className="w-4 h-4" />, category: 'actions', action: () => { setActiveView('ncr'); }, keywords: ['add'] },
    { id: 'action-save', title: 'Save All Data', icon: <RefreshCw className="w-4 h-4" />, category: 'actions', action: () => saveData(), keywords: ['persist', 'store'] },
    { id: 'action-export', title: 'Export Audit Report', icon: <Download className="w-4 h-4" />, category: 'actions', action: () => exportAuditReport(), keywords: ['download', 'pdf'] },

    // Settings
    { id: 'settings-theme', title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, category: 'settings', action: toggleTheme, keywords: ['color', 'appearance'] },
    { id: 'settings-logout', title: 'Sign Out', icon: <LogOut className="w-4 h-4" />, category: 'settings', action: logout, keywords: ['exit', 'leave'] },
  ], [theme, setActiveView, toggleTheme, logout, saveData, exportAuditReport]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const q = query.toLowerCase();
    return commands.filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(q);
      const subtitleMatch = cmd.subtitle?.toLowerCase().includes(q);
      const keywordMatch = cmd.keywords?.some((k) => k.includes(q));
      return titleMatch || subtitleMatch || keywordMatch;
    });
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      actions: [],
      settings: [],
    };
    filteredCommands.forEach((cmd) => {
      groups[cmd.category]?.push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            closeCommandPalette();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    settings: 'Settings',
  };

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCommandPalette} />

      {/* Command Palette */}
      <div className="relative min-h-full flex items-start justify-center pt-[15vh] px-4 pb-20">
        <div className="relative w-full max-w-xl bg-white dark:bg-gh-surface rounded-xl shadow-2xl border border-surface-200 dark:border-gh-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-gh-border">
            <Command className="w-5 h-5 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-surface-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-surface-500 bg-surface-100 dark:bg-gh-overlay rounded">
              ESC
            </kbd>
          </div>

          {/* Commands */}
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-surface-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => {
                if (items.length === 0) return null;

                return (
                  <div key={category} className="mb-2">
                    <div className="px-4 py-1.5 text-xs font-medium text-surface-500 uppercase tracking-wider">
                      {categoryLabels[category]}
                    </div>
                    {items.map((cmd) => {
                      const currentIndex = flatIndex++;
                      const isSelected = currentIndex === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            closeCommandPalette();
                          }}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'bg-primary-50 dark:bg-gh-blue-strong/15 text-primary-900 dark:text-gh-blue'
                              : 'hover:bg-surface-50 dark:hover:bg-gh-overlay text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <span className={`flex-shrink-0 ${isSelected ? 'text-primary-600 dark:text-gh-blue' : 'text-surface-500'}`}>
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{cmd.title}</span>
                            {cmd.subtitle && (
                              <span className="ml-2 text-sm text-surface-500">{cmd.subtitle}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-surface-50 dark:bg-gh-overlay border-t border-surface-200 dark:border-gh-border flex items-center justify-between text-xs text-surface-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-gh-border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-gh-border rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-gh-border rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-surface-200 dark:bg-gh-border rounded">⌘K</kbd>
                Toggle
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
