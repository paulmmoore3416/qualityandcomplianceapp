import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format percentage with symbol
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use numeric month/day to avoid locale differences in tests
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

/**
 * Calculate days until date
 */
export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / 86400000);
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  return daysUntil(date) < 0;
}

/**
 * Get status color class
 */
export function getStatusColor(status: 'green' | 'yellow' | 'red'): string {
  const colors = {
    green: 'text-compliance-green',
    yellow: 'text-compliance-yellow',
    red: 'text-compliance-red',
  };
  return colors[status];
}

/**
 * Get status background color class
 */
export function getStatusBgColor(status: 'green' | 'yellow' | 'red'): string {
  const colors = {
    green: 'bg-compliance-green',
    yellow: 'bg-compliance-yellow',
    red: 'bg-compliance-red',
  };
  return colors[status];
}

/**
 * Get risk level color class
 */
export function getRiskColor(level: 'Low' | 'Medium' | 'High' | 'Critical'): string {
  const colors = {
    Low: 'text-risk-low',
    Medium: 'text-risk-medium',
    High: 'text-risk-high',
    Critical: 'text-risk-critical',
  };
  return colors[level];
}

/**
 * Get risk level background color class
 */
export function getRiskBgColor(level: 'Low' | 'Medium' | 'High' | 'Critical'): string {
  const colors = {
    Low: 'bg-risk-low',
    Medium: 'bg-risk-medium',
    High: 'bg-risk-high',
    Critical: 'bg-risk-critical',
  };
  return colors[level];
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is within threshold
 */
export function isWithinThreshold(
  value: number,
  threshold: { green: number; yellow: number; red: number; direction: 'higher-better' | 'lower-better' }
): 'green' | 'yellow' | 'red' {
  if (threshold.direction === 'higher-better') {
    if (value >= threshold.green) return 'green';
    if (value >= threshold.yellow) return 'yellow';
    return 'red';
  } else {
    if (value <= threshold.green) return 'green';
    if (value <= threshold.yellow) return 'yellow';
    return 'red';
  }
}
