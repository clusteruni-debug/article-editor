'use client';

import { InsightCard } from '@/components/insight';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { InsightWithArticle } from '@/types/insight';

interface DateGroup {
  date: string;
  label: string;
  insights: InsightWithArticle[];
}

interface InsightDateGroupListProps {
  loading: boolean;
  insights: InsightWithArticle[];
  filteredInsights: InsightWithArticle[];
  dateGroups: DateGroup[];
  collapsedDates: Set<string>;
  onToggleDate: (date: string) => void;
  onEdit: (insight: InsightWithArticle) => void;
  onDelete: (id: string) => void;
  onStartArticle: (insight: InsightWithArticle) => void;
  onGenerateAI: (insight: InsightWithArticle) => void;
  generatingId: string | null;
  onShowForm: () => void;
  hasActiveFilters: boolean;
}

export function InsightDateGroupList({
  loading,
  insights,
  filteredInsights,
  dateGroups,
  collapsedDates,
  onToggleDate,
  onEdit,
  onDelete,
  onStartArticle,
  onGenerateAI,
  generatingId,
  onShowForm,
  hasActiveFilters,
}: InsightDateGroupListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <p className="text-lg mb-4">아직 인사이트가 없습니다</p>
        <Button onClick={onShowForm}>첫 인사이트 추가하기</Button>
      </div>
    );
  }

  if (filteredInsights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-lg mb-2">검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {hasActiveFilters && (
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
          {filteredInsights.length}개의 결과
        </div>
      )}
      {dateGroups.map((group) => {
        const isCollapsed = collapsedDates.has(group.date);
        return (
          <div key={group.date}>
            {/* 날짜 헤더 */}
            <button
              onClick={() => onToggleDate(group.date)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors sticky top-[165px] z-[5]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {isCollapsed ? '▶' : '▼'}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {group.label}
                </span>
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                  {group.insights.length}개
                </span>
              </div>
            </button>
            {/* 인사이트 목록 */}
            {!isCollapsed &&
              group.insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStartArticle={onStartArticle}
                  onGenerateAI={onGenerateAI}
                  isGenerating={generatingId === insight.id}
                />
              ))}
          </div>
        );
      })}
    </div>
  );
}
