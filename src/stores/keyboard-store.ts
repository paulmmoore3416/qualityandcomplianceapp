import { create } from 'zustand';

export interface KeyboardShortcut {
  id: string;
  keys: string[]; // e.g., ['cmd', 'k'] or ['ctrl', 'shift', 'p']
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'search' | 'modal' | 'system';
  enabled: boolean;
}

interface KeyboardState {
  shortcuts: KeyboardShortcut[];
  isCommandPaletteOpen: boolean;
  isEnabled: boolean;

  // Actions
  registerShortcut: (shortcut: Omit<KeyboardShortcut, 'enabled'>) => void;
  unregisterShortcut: (id: string) => void;
  toggleShortcut: (id: string, enabled: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setEnabled: (enabled: boolean) => void;
  getShortcutsByCategory: (category: KeyboardShortcut['category']) => KeyboardShortcut[];
}

export const useKeyboardStore = create<KeyboardState>()((set, get) => ({
  shortcuts: [],
  isCommandPaletteOpen: false,
  isEnabled: true,

  registerShortcut: (shortcut) => {
    set((state) => ({
      shortcuts: [
        ...state.shortcuts.filter((s) => s.id !== shortcut.id),
        { ...shortcut, enabled: true },
      ],
    }));
  },

  unregisterShortcut: (id) => {
    set((state) => ({
      shortcuts: state.shortcuts.filter((s) => s.id !== id),
    }));
  },

  toggleShortcut: (id, enabled) => {
    set((state) => ({
      shortcuts: state.shortcuts.map((s) =>
        s.id === id ? { ...s, enabled } : s
      ),
    }));
  },

  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  setEnabled: (enabled) => set({ isEnabled: enabled }),

  getShortcutsByCategory: (category) => {
    return get().shortcuts.filter((s) => s.category === category && s.enabled);
  },
}));

// Keyboard event handler hook setup
let isInitialized = false;

export function initializeKeyboardShortcuts() {
  if (isInitialized) return;
  isInitialized = true;

  const handleKeyDown = (e: KeyboardEvent) => {
    const state = useKeyboardStore.getState();
    if (!state.isEnabled) return;

    // Handle Cmd+K / Ctrl+K for command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      state.toggleCommandPalette();
      return;
    }

    // Handle Escape to close command palette
    if (e.key === 'Escape' && state.isCommandPaletteOpen) {
      e.preventDefault();
      state.closeCommandPalette();
      return;
    }

    // Check other shortcuts
    for (const shortcut of state.shortcuts) {
      if (!shortcut.enabled) continue;

      const keys = shortcut.keys.map((k) => k.toLowerCase());
      const eventKeys: string[] = [];

      if (e.metaKey || e.ctrlKey) eventKeys.push('cmd');
      if (e.shiftKey) eventKeys.push('shift');
      if (e.altKey) eventKeys.push('alt');
      eventKeys.push(e.key.toLowerCase());

      const matches =
        keys.length === eventKeys.length &&
        keys.every((k) => eventKeys.includes(k === 'ctrl' ? 'cmd' : k));

      if (matches) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}
