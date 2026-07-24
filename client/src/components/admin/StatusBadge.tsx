import React from 'react';

type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'processing' | 'low' | 'placed' | 'delivered' | 'shipped' | 'confirmed';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

const statusConfig: Partial<Record<StatusType, { bg: string; text: string; border: string; label: string }>> = {
  active: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200/45', label: 'Active' },
  inactive: { bg: 'bg-slate-50/70', text: 'text-slate-600', border: 'border-slate-200/45', label: 'Hidden' },
  pending: { bg: 'bg-amber-50/70', text: 'text-amber-700', border: 'border-amber-200/45', label: 'Pending' },
  completed: { bg: 'bg-blue-50/70', text: 'text-blue-700', border: 'border-blue-200/45', label: 'Completed' },
  cancelled: { bg: 'bg-rose-50/70', text: 'text-rose-700', border: 'border-rose-200/45', label: 'Cancelled' },
  processing: { bg: 'bg-violet-50/70', text: 'text-violet-700', border: 'border-violet-200/45', label: 'Processing' },
  low: { bg: 'bg-orange-50/70', text: 'text-orange-700', border: 'border-orange-200/45', label: 'Low Stock' },
  placed: { bg: 'bg-blue-50/70', text: 'text-blue-700', border: 'border-blue-200/45', label: 'Placed' },
  delivered: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200/45', label: 'Delivered' },
  shipped: { bg: 'bg-indigo-50/70', text: 'text-indigo-700', border: 'border-indigo-200/45', label: 'Shipped' },
  confirmed: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', border: 'border-emerald-200/45', label: 'Confirmed' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const config = statusConfig[normalizedStatus] || { bg: 'bg-slate-50/70', text: 'text-slate-600', border: 'border-slate-200/45', label: status };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
