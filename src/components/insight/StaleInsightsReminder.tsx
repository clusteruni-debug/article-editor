'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { InsightWithArticle, ACTION_TYPE_LABELS } from '@/types/insight';
import { differenceInDays } from 'date-fns';

interface StaleInsightsReminderProps {
  insights: InsightWithArticle[];
  daysThreshold?: number;
  maxItems?: number;
  onStartArticle?: (insight: InsightWithArticle) => void;
  onMarkObserved?: (id: string) => void;
}

export function StaleInsightsReminder({
  insights,
  daysThreshold = 14,
  maxItems = 5,
  onStartArticle,
  onMarkObserved,
}: StaleInsightsReminderProps) {
  const staleInsights = useMemo(() => {
    const now = new Date();

    return insights
      .filter((insight) => {
        if (insight.status !== 'unread' && insight.status !== 'idea') return false;
        const age = differenceInDays(now, new Date(insight.created_at));
        return age >= daysThreshold;
      })
      .map((insight) => ({
        insight,
        daysOld: differenceInDays(now, new Date(insight.created_at)),
      }))
      .sort((a, b) => b.daysOld - a.daysOld)
      .slice(0, maxItems);
  }, [insights, daysThreshold, maxItems]);

  if (staleInsights.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💤</span>
        <h3 className="font-semibold text-amber-900">잊혀진 인사이트</h3>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          {staleInsights.length}개
        </span>
      </div>

      <p className="text-sm text-amber-700 mb-4">
        {daysThreshold}일 이상 방치된 인사이트가 있어요. 글로 발전시키거나 정리해보세요!
      </p>

      <div className="space-y-2">
        {staleInsights.map(({ insight, daysOld }) => (
          <div
            key={insight.id}
            className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">
                    {ACTION_TYPE_LABELS[insight.action_type].emoji}
                  </span>
                  <p className="font-medium text-gray-900 truncate">{insight.keyword}</p>
                </div>
                {insight.summary && (
                  <p className="text-xs text-gray-500 line-clamp-1">{insight.summary}</p>
                )}
                {insight.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {insight.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs font-medium text-amber-600">{daysOld}일 전</p>
                <div className="flex gap-1">
                  {onStartArticle && (
                    <button
                      onClick={() => onStartArticle(insight)}
                      className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      글 작성
                    </button>
                  )}
                  {onMarkObserved && (
                    <button
                      onClick={() => onMarkObserved(insight.id)}
                      className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    >
                      확인
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-amber-100">
        <Link
          href="/insights"
          className="text-xs text-amber-600 hover:text-amber-800 transition-colors"
        >
          전체 인사이트 보기 →
        </Link>
      </div>
    </div>
  );
}
