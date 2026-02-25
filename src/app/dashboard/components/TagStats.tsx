'use client';

import { AggregatedStats } from '@/types/stats';

interface TagStatsProps {
  aggregated: AggregatedStats;
}

export function TagStats({ aggregated }: TagStatsProps) {
  const tagEntries = Object.entries(aggregated.byTag);
  if (tagEntries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-semibold mb-4">주제(태그)별 성과</h2>
      <div className="flex flex-wrap gap-3">
        {tagEntries
          .sort((a, b) => b[1].totalViews - a[1].totalViews)
          .slice(0, 10)
          .map(([tag, data]) => (
            <div
              key={tag}
              className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-3"
            >
              <span className="text-sm font-medium">#{tag}</span>
              <span className="text-xs text-gray-500">
                {data.totalViews.toLocaleString()} views
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
