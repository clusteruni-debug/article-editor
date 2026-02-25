'use client';

import { InsightStatus, STATUS_LABELS } from '@/types/insight';

const STATUSES: InsightStatus[] = ['unread', 'idea', 'drafted', 'published'];

interface StatusSelectorProps {
  value: InsightStatus;
  onChange: (value: InsightStatus) => void;
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const { label, color } = STATUS_LABELS[s];
          const colorClass =
            value === s
              ? {
                  gray: 'bg-gray-900 text-white border-gray-900',
                  blue: 'bg-blue-600 text-white border-blue-600',
                  yellow: 'bg-yellow-500 text-white border-yellow-500',
                  green: 'bg-green-600 text-white border-green-600',
                }[color]
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${colorClass}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
