'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Article } from '@/types/article';
import { differenceInDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RecycleSuggestionsProps {
  articles: Article[];
  daysThreshold?: number;  // 몇 일 이상 지난 글을 표시할지
  maxItems?: number;
}

interface SuggestionReason {
  type: 'old' | 'popular_old' | 'seasonal' | 'trending_topic';
  message: string;
}

interface ArticleSuggestion {
  article: Article;
  reason: SuggestionReason;
  daysSinceUpdate: number;
}

export function RecycleSuggestions({
  articles,
  daysThreshold = 30,
  maxItems = 5,
}: RecycleSuggestionsProps) {
  const suggestions = useMemo(() => {
    const now = new Date();
    const result: ArticleSuggestion[] = [];

    // 발행된 글만 대상
    const publishedArticles = articles.filter((a) => a.status === 'published');

    for (const article of publishedArticles) {
      const lastUpdate = new Date(article.updated_at);
      const daysSinceUpdate = differenceInDays(now, lastUpdate);

      // 기준일 이상 지난 글
      if (daysSinceUpdate >= daysThreshold) {
        let reason: SuggestionReason;

        if (daysSinceUpdate >= 90) {
          reason = {
            type: 'old',
            message: `${daysSinceUpdate}일 전에 작성됨 - 내용 업데이트 필요할 수 있어요`,
          };
        } else if (daysSinceUpdate >= 60) {
          reason = {
            type: 'old',
            message: `${daysSinceUpdate}일 동안 수정되지 않음 - 최신 정보 확인해보세요`,
          };
        } else {
          reason = {
            type: 'old',
            message: `${daysSinceUpdate}일 전 글 - 다른 플랫폼에 재발행해보세요`,
          };
        }

        result.push({
          article,
          reason,
          daysSinceUpdate,
        });
      }
    }

    // 오래된 순으로 정렬
    result.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

    return result.slice(0, maxItems);
  }, [articles, daysThreshold, maxItems]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">♻️</span>
        <h3 className="font-semibold text-amber-900">재활용 제안</h3>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
          {suggestions.length}개
        </span>
      </div>

      <p className="text-sm text-amber-700 mb-4">
        오래된 글을 업데이트하거나 다른 플랫폼에 재발행해보세요!
      </p>

      <div className="space-y-2">
        {suggestions.map(({ article, reason, daysSinceUpdate }) => (
          <Link
            key={article.id}
            href={`/editor/${article.id}`}
            className="block bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{article.title}</p>
                <p className="text-xs text-amber-600 mt-1">{reason.message}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  {format(new Date(article.updated_at), 'M월 d일', { locale: ko })}
                </p>
                <p className="text-xs font-medium text-amber-600">{daysSinceUpdate}일 전</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-amber-100">
        <p className="text-xs text-amber-600">
          💡 팁: 인기 있던 글을 새로운 관점으로 업데이트하면 더 많은 관심을 받을 수 있어요!
        </p>
      </div>
    </div>
  );
}
