import React, { useState, useEffect } from 'react';
import { Users, Circle, Clock, Edit3 } from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';

// Simulated active users - in production, this would come from a WebSocket connection
interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  currentView: string;
  lastActivity: Date;
  isEditing?: boolean;
  editingEntity?: string;
}

const USER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

// Simulated presence system
function usePresence() {
  const { currentUser } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    // Simulate other active users
    const mockUsers: ActiveUser[] = [
      {
        id: 'user-1',
        name: 'Sarah Johnson',
        color: USER_COLORS[0],
        currentView: 'capa',
        lastActivity: new Date(),
        isEditing: true,
        editingEntity: 'CAPA-2024-042',
      },
      {
        id: 'user-2',
        name: 'Mike Chen',
        color: USER_COLORS[1],
        currentView: 'ncr',
        lastActivity: new Date(Date.now() - 120000),
      },
      {
        id: 'user-3',
        name: 'Emily Davis',
        color: USER_COLORS[2],
        currentView: 'dashboard',
        lastActivity: new Date(Date.now() - 60000),
      },
    ];

    // Filter out current user and add them
    if (currentUser) {
      mockUsers.push({
        id: currentUser.id,
        name: currentUser.fullName,
        color: USER_COLORS[3],
        currentView: 'dashboard',
        lastActivity: new Date(),
      });
    }

    setActiveUsers(mockUsers.filter(u => u.id !== currentUser?.id));

    // Simulate activity updates
    const interval = setInterval(() => {
      setActiveUsers(prev =>
        prev.map(u => ({
          ...u,
          lastActivity: Math.random() > 0.7 ? new Date() : u.lastActivity,
          isEditing: Math.random() > 0.8 ? !u.isEditing : u.isEditing,
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  return { activeUsers, currentUser };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

interface CollaborationIndicatorProps {
  compact?: boolean;
}

export default function CollaborationIndicator({ compact = false }: CollaborationIndicatorProps) {
  const { activeUsers } = usePresence();
  const [showDropdown, setShowDropdown] = useState(false);

  const editingUsers = activeUsers.filter(u => u.isEditing);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-gh-overlay transition-colors"
        >
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-7 h-7 rounded-full border-2 border-white dark:border-gh-surface flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {getInitials(user.name)}
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-gh-surface bg-surface-300 dark:bg-gh-border flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-surface-600 dark:text-surface-400 hidden md:inline">
            {activeUsers.length} online
          </span>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gh-surface rounded-lg shadow-lg border border-surface-200 dark:border-gh-border z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 dark:border-gh-border">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Activity
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="px-4 py-3 hover:bg-surface-50 dark:hover:bg-gh-overlay flex items-center gap-3"
                  >
                    <div className="relative">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: user.color }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <Circle
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                          new Date().getTime() - user.lastActivity.getTime() < 60000
                            ? 'text-green-500 fill-green-500'
                            : 'text-yellow-500 fill-yellow-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        {user.isEditing ? (
                          <>
                            <Edit3 className="w-3 h-3" />
                            Editing {user.editingEntity}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            {getTimeSince(user.lastActivity)} in {user.currentView}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {editingUsers.length > 0 && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-t border-surface-200 dark:border-gh-border">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    {editingUsers.length} user{editingUsers.length !== 1 ? 's' : ''} currently editing
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Team Activity ({activeUsers.length} online)
      </h3>
      <div className="space-y-3">
        {activeUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: user.color }}
              >
                {getInitials(user.name)}
              </div>
              <Circle
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${
                  new Date().getTime() - user.lastActivity.getTime() < 60000
                    ? 'text-green-500 fill-green-500'
                    : 'text-yellow-500 fill-yellow-500'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-surface-500">
                {user.isEditing ? `Editing ${user.editingEntity}` : `Viewing ${user.currentView}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export a live editing indicator for use in forms
export function LiveEditingBanner({ entityId, entityType }: { entityId: string; entityType: string }) {
  const { activeUsers } = usePresence();
  const editingUser = activeUsers.find(u => u.isEditing && u.editingEntity === entityId);

  if (!editingUser) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 flex items-center gap-3">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
        style={{ backgroundColor: editingUser.color }}
      >
        {getInitials(editingUser.name)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <span className="font-medium">{editingUser.name}</span> is currently editing this {entityType}
        </p>
      </div>
      <Edit3 className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
    </div>
  );
}
