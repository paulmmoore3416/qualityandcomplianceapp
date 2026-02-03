import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Add transition class for smooth theme switch
  root.classList.add('theme-transition');
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Remove transition class after animation completes
  setTimeout(() => root.classList.remove('theme-transition'), 300);
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('medtech-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable
  }
  // Default to system preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Apply theme immediately on module load to prevent flash
const initialTheme = getInitialTheme();
if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('medtech-theme', next); } catch { /* noop */ }
      return { theme: next };
    });
  },

  setTheme: (theme: Theme) => {
    applyTheme(theme);
    try { localStorage.setItem('medtech-theme', theme); } catch { /* noop */ }
    set({ theme });
  },
}));
