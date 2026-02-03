import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, AlertCircle, Shield, Users, Box, FlaskConical, ArrowRight, Clock } from 'lucide-react';
import { useAppStore } from '../stores/app-store';

export type SearchResultType = 'capa' | 'ncr' | 'risk' | 'document' | 'supplier' | 'training' | 'change_control' | 'validation' | 'metric';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  status?: string;
  matchedField?: string;
  matchHighlight?: string;
}

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  capa: <Shield className="w-4 h-4" />,
  ncr: <AlertCircle className="w-4 h-4" />,
  risk: <AlertCircle className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  supplier: <Box className="w-4 h-4" />,
  training: <Users className="w-4 h-4" />,
  change_control: <FileText className="w-4 h-4" />,
  validation: <FlaskConical className="w-4 h-4" />,
  metric: <FileText className="w-4 h-4" />,
};

const typeColors: Record<SearchResultType, string> = {
  capa: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ncr: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  risk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  document: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  supplier: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  training: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  change_control: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  validation: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  metric: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const typeLabels: Record<SearchResultType, string> = {
  capa: 'CAPA',
  ncr: 'NCR',
  risk: 'Risk',
  document: 'Document',
  supplier: 'Supplier',
  training: 'Training',
  change_control: 'Change Control',
  validation: 'Validation',
  metric: 'Metric',
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: SearchResultType, id: string) => void;
}

export default function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { capas, ncrs, suppliers, trainingRecords, changeControls, validationReports } = useAppStore();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medtech-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const saveRecentSearch = (search: string) => {
    const updated = [search, ...recentSearches.filter((s) => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('medtech-recent-searches', JSON.stringify(updated));
  };

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const found: SearchResult[] = [];

    // Search CAPAs
    capas.forEach((capa) => {
      if (
        capa.title.toLowerCase().includes(q) ||
        capa.id.toLowerCase().includes(q) ||
        capa.description?.toLowerCase().includes(q)
      ) {
        found.push({
          id: capa.id,
          type: 'capa',
          title: capa.title,
          subtitle: `${capa.type} • ${capa.priority} Priority`,
          status: capa.status,
          matchedField: capa.title.toLowerCase().includes(q) ? 'title' : 'description',
        });
      }
    });

    // Search NCRs
    ncrs.forEach((ncr) => {
      if (
        ncr.title.toLowerCase().includes(q) ||
        ncr.id.toLowerCase().includes(q) ||
        ncr.description?.toLowerCase().includes(q)
      ) {
        found.push({
          id: ncr.id,
          type: 'ncr',
          title: ncr.title,
          subtitle: `${ncr.type} • ${ncr.lotNumber || 'No lot'}`,
          status: ncr.status,
        });
      }
    });

    // Search Suppliers
    suppliers.forEach((supplier) => {
      if (
        supplier.name.toLowerCase().includes(q) ||
        supplier.supplierCode.toLowerCase().includes(q)
      ) {
        found.push({
          id: supplier.id,
          type: 'supplier',
          title: supplier.name,
          subtitle: `${supplier.category} • ${supplier.supplierCode}`,
          status: supplier.status,
        });
      }
    });

    // Search Training Records
    trainingRecords.forEach((record) => {
      if (
        record.trainingTitle.toLowerCase().includes(q) ||
        record.employeeName.toLowerCase().includes(q)
      ) {
        found.push({
          id: record.id,
          type: 'training',
          title: record.trainingTitle,
          subtitle: `${record.employeeName} • ${record.department}`,
          status: record.status,
        });
      }
    });

    // Search Change Controls
    changeControls.forEach((cc) => {
      if (
        cc.title.toLowerCase().includes(q) ||
        cc.referenceNumber.toLowerCase().includes(q)
      ) {
        found.push({
          id: cc.id,
          type: 'change_control',
          title: cc.title,
          subtitle: `${cc.type} • ${cc.referenceNumber}`,
          status: cc.status,
        });
      }
    });

    // Search Validation Reports
    validationReports.forEach((vr) => {
      if (
        vr.title.toLowerCase().includes(q) ||
        vr.reportNumber.toLowerCase().includes(q)
      ) {
        found.push({
          id: vr.id,
          type: 'validation',
          title: vr.title,
          subtitle: `${vr.type} • ${vr.reportNumber}`,
          status: vr.status,
        });
      }
    });

    setResults(found.slice(0, 20));
    setSelectedIndex(0);
  }, [capas, ncrs, suppliers, trainingRecords, changeControls, validationReports]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(result.title);
    onNavigate(result.type, result.id);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search Modal */}
      <div className="relative min-h-full flex items-start justify-center pt-[15vh] px-4 pb-20">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gh-surface rounded-xl shadow-2xl border border-surface-200 dark:border-gh-border overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-gh-border">
            <Search className="w-5 h-5 text-surface-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search CAPAs, NCRs, documents, suppliers..."
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-surface-400 focus:outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded hover:bg-surface-100 dark:hover:bg-gh-overlay"
              >
                <X className="w-4 h-4 text-surface-400" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-surface-500 bg-surface-100 dark:bg-gh-overlay rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary-50 dark:bg-gh-blue-strong/15'
                        : 'hover:bg-surface-50 dark:hover:bg-gh-overlay'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${typeColors[result.type]}`}>
                      {typeIcons[result.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[result.type]}`}>
                          {typeLabels[result.type]}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-surface-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    {result.status && (
                      <span className="text-xs px-2 py-1 bg-surface-100 dark:bg-gh-overlay text-surface-600 dark:text-surface-400 rounded-full">
                        {result.status}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-surface-400" />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500">No results found for "{query}"</p>
                <p className="text-sm text-surface-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-6">
                {recentSearches.length > 0 && (
                  <div className="px-4 mb-4">
                    <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => setQuery(search)}
                          className="px-3 py-1.5 text-sm bg-surface-100 dark:bg-gh-overlay hover:bg-surface-200 dark:hover:bg-gh-border text-surface-700 dark:text-surface-300 rounded-lg transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-4">
                  <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">
                    Search Tips
                  </h3>
                  <ul className="text-sm text-surface-500 space-y-1">
                    <li>• Search by CAPA ID, NCR number, or title</li>
                    <li>• Find suppliers by name or code</li>
                    <li>• Search training records by employee or course</li>
                    <li>• Press Enter to select, Esc to close</li>
                  </ul>
                </div>
              </div>
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
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
