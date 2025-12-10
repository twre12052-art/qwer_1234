import React from 'react';

interface BadgeProps {
  status: string;
  children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  const statusColors: Record<string, string> = {
    'GUARDIAN_PENDING': 'bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20',
    'CAREGIVER_PENDING': 'bg-primary/10 text-primary border-primary/20',
    'IN_PROGRESS': 'bg-status-ongoing/10 text-status-ongoing border-status-ongoing/20',
    'COMPLETED': 'bg-status-completed/10 text-status-completed border-status-completed/20',
    'CANCELED': 'bg-status-canceled/10 text-status-canceled border-status-canceled/20',
  };

  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {children}
    </span>
  );
}

