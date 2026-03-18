import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('animate-spin text-teal-600', className)}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const themes: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    INITIATED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    RINGING: 'bg-orange-100 text-orange-700',
    IN_CALL: 'bg-teal-100 text-teal-700',
    NO_ANSWER: 'bg-gray-200 text-gray-800',
    BUSY: 'bg-gray-200 text-gray-800',
  };

  const css = themes[status] || 'bg-gray-100 text-gray-700';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        css
      )}
    >
      {status}
    </span>
  );
}
