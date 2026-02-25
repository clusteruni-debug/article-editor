'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { StatsWithArticle, StatsPlatform, STATS_PLATFORM_LABELS } from '@/types/stats';

interface StatsDetailListProps {
  filteredStats: StatsWithArticle[];
  selectedPlatform: StatsPlatform | 'all';
  onPlatformChange: (platform: StatsPlatform | 'all') => void;
  onDelete: (id: string) => void;
  onShowForm: () => void;
}

const PLATFORMS: (StatsPlatform | 'all')[] = ['all', 'twitter', 'blog', 'instagram', 'thread', 'newsletter'];

export function StatsDetailList({
  filteredStats,
  selectedPlatform,
  onPlatformChange,
  onDelete,
  onShowForm,
}: StatsDetailListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold">상세 기록</h2>
        <div className="flex gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => onPlatformChange(p)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedPlatform === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'all' ? '전체' : STATS_PLATFORM_LABELS[p].icon}
            </button>
          ))}
        </div>
      </div>

      {filteredStats.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>아직 기록된 성과가 없습니다.</p>
          <Button className="mt-4" onClick={onShowForm}>
            첫 성과 기록하기
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredStats.map((stat) => {
            const info = STATS_PLATFORM_LABELS[stat.platform];
            return (
              <div
                key={stat.id}
                className="p-4 hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <p className="font-medium">{stat.article?.title || '(삭제된 글)'}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(stat.recorded_at), 'M월 d일', { locale: ko })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-gray-500">조회</span>{' '}
                      <span className="font-medium">{stat.views.toLocaleString()}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">참여율</span>{' '}
                      <span className="font-medium text-blue-600">
                        {stat.engagement_rate || 0}%
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(stat.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
