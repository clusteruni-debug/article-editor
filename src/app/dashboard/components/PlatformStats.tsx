'use client';

import { AggregatedStats, StatsPlatform, STATS_PLATFORM_LABELS } from '@/types/stats';

interface PlatformStatsProps {
  aggregated: AggregatedStats;
}

export function PlatformStats({ aggregated }: PlatformStatsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-semibold mb-4">플랫폼별 성과</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(Object.keys(aggregated.byPlatform) as StatsPlatform[]).map((platform) => {
          const data = aggregated.byPlatform[platform];
          const info = STATS_PLATFORM_LABELS[platform];
          if (data.views === 0) return null;
          return (
            <div key={platform} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium">{info.name}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">조회</span>
                  <span>{data.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">좋아요</span>
                  <span>{data.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">참여율</span>
                  <span className="font-semibold text-blue-600">{data.engagementRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
