import React from 'react';

type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'processing' | 'low' | 'placed' | 'delivered';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
}

const statusConfig: Partial<Record<StatusType, { bg: string; text: string; label: string }>> = {
  active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  processing: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Processing' },
  low: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Low Stock' },
  placed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Placed' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', label: 'Delivered' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const config = statusConfig[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
