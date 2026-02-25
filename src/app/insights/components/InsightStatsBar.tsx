'use client';

import { InsightStatus } from '@/types/insight';

interface InsightStatsBarProps {
  stats: {
    total: number;
    unread: number;
    idea: number;
    drafted: number;
    published: number;
  };
  selectedStatus: InsightStatus | null;
  onStatusChange: (status: InsightStatus | null) => void;
}

export function InsightStatsBar({ stats, selectedStatus, onStatusChange }: InsightStatsBarProps) {
  return (
    <div className="flex items-center gap-1 text-sm mb-4 overflow-x-auto">
      <button
        onClick={() => onStatusChange(null)}
        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          selectedStatus === null
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        전체 {stats.total}
      </button>
      <button
        onClick={() => onStatusChange(selectedStatus === 'unread' ? null : 'unread')}
        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          selectedStatus === 'unread'
            ? 'bg-gray-900 text-white'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        미확인 {stats.unread}
      </button>
      <button
        onClick={() => onStatusChange(selectedStatus === 'idea' ? null : 'idea')}
        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          selectedStatus === 'idea'
            ? 'bg-blue-600 text-white'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        아이디어 {stats.idea}
      </button>
      <button
        onClick={() => onStatusChange(selectedStatus === 'drafted' ? null : 'drafted')}
        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          selectedStatus === 'drafted'
            ? 'bg-yellow-500 text-white'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        작성중 {stats.drafted}
      </button>
      <button
        onClick={() => onStatusChange(selectedStatus === 'published' ? null : 'published')}
        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
          selectedStatus === 'published'
            ? 'bg-green-600 text-white'
            : 'text-green-600 hover:bg-green-50'
        }`}
      >
        발행완료 {stats.published}
      </button>
    </div>
  );
}
