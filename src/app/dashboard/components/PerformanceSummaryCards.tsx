'use client';

import { AggregatedStats } from '@/types/stats';

interface PerformanceSummaryCardsProps {
  aggregated: AggregatedStats;
}

export function PerformanceSummaryCards({ aggregated }: PerformanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">총 조회수</p>
        <p className="text-2xl font-bold">{aggregated.totalViews.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">총 좋아요</p>
        <p className="text-2xl font-bold">{aggregated.totalLikes.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">총 댓글</p>
        <p className="text-2xl font-bold">{aggregated.totalComments.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">평균 참여율</p>
        <p className="text-2xl font-bold">{aggregated.avgEngagementRate}%</p>
      </div>
    </div>
  );
}
