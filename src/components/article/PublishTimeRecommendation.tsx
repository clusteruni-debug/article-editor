'use client';

import { useMemo } from 'react';
import {
  DEFAULT_BEST_TIMES,
  getNextRecommendedTime,
} from '@/lib/utils/publishTimeAnalyzer';
import { StatsPlatform, STATS_PLATFORM_LABELS } from '@/types/stats';

interface PublishTimeRecommendationProps {
  platform: StatsPlatform;
  compact?: boolean;
}

export function PublishTimeRecommendation({
  platform,
  compact = false,
}: PublishTimeRecommendationProps) {
  const recommendation = useMemo(() => {
    return DEFAULT_BEST_TIMES[platform];
  }, [platform]);

  const nextTime = useMemo(() => {
    return getNextRecommendedTime(platform);
  }, [platform]);

  const platformInfo = STATS_PLATFORM_LABELS[platform];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">다음 추천:</span>
        <span className="font-medium text-blue-600">{nextTime.formatted}</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{platformInfo.icon}</span>
        <h4 className="font-semibold text-blue-900">
          {platformInfo.name} 발행 추천 시간
        </h4>
      </div>

      {/* 다음 추천 시간 */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1">다음 추천 발행 시간</p>
        <p className="text-xl font-bold text-blue-600">{nextTime.formatted}</p>
      </div>

      {/* 최적 시간대 */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">최적 시간대</p>
        <div className="flex flex-wrap gap-2">
          {recommendation.times.map((time) => (
            <span
              key={time}
              className="px-2 py-1 bg-white text-blue-700 text-sm rounded border border-blue-200"
            >
              {time}
            </span>
          ))}
        </div>
      </div>

      {/* 최적 요일 */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">최적 요일</p>
        <div className="flex gap-1">
          {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
            const isRecommended = recommendation.days.includes(day);
            return (
              <span
                key={day}
                className={`w-8 h-8 flex items-center justify-center text-xs rounded-full ${
                  isRecommended
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* 이유 */}
      <p className="text-xs text-blue-700 bg-blue-100 rounded p-2">
        💡 {recommendation.reason}
      </p>
    </div>
  );
}
