'use client';

import Link from 'next/link';
import { Article } from '@/types/article';
import { ArticleCard } from '@/components/article/ArticleCard';
import { ArticleListView } from '@/components/article/ArticleListView';
import { RecycleSuggestions } from '@/components/article/RecycleSuggestions';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaginatedResult } from '@/hooks/useArticle';

type StatusFilter = 'all' | 'draft' | 'published';
type ViewMode = 'card' | 'list';

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  draft: '임시저장',
  published: '발행됨',
};

interface HomeArticleListProps {
  loading: boolean;
  result: PaginatedResult;
  debouncedSearch: string;
  selectedTag: string | null;
  statusFilter: StatusFilter;
  viewMode: ViewMode;
  allArticlesForRecycle: Article[];
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export function HomeArticleList({
  loading,
  result,
  debouncedSearch,
  selectedTag,
  statusFilter,
  viewMode,
  allArticlesForRecycle,
  onDelete,
  onPageChange,
  onClearFilters,
}: HomeArticleListProps) {
  return (
    <main className="max-w-6xl mx-auto px-4">
      {/* 재활용 제안 (필터 없을 때만) */}
      {!loading && allArticlesForRecycle.length > 0 && !debouncedSearch && !selectedTag && statusFilter === 'all' && (
        <div className="py-4">
          <RecycleSuggestions articles={allArticlesForRecycle} daysThreshold={30} maxItems={3} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : result.totalCount === 0 && !debouncedSearch && !selectedTag && statusFilter === 'all' ? (
        // 아티클이 아예 없는 경우
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-lg mb-4">아직 작성된 글이 없습니다</p>
          <Link
            href="/editor"
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            첫 번째 글 작성하기
          </Link>
        </div>
      ) : result.articles.length === 0 ? (
        // 필터/검색 결과 없음
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg mb-2">검색 결과가 없습니다</p>
          <p className="text-sm">
            {selectedTag && `#${selectedTag} 태그`}
            {selectedTag && debouncedSearch && ', '}
            {debouncedSearch && `"${debouncedSearch}"`}
            {statusFilter !== 'all' && ` (${STATUS_LABELS[statusFilter]})`}
            에 해당하는 글을 찾을 수 없습니다
          </p>
        </div>
      ) : (
        <div>
          {/* 결과 요약 (필터 활성 시) */}
          {(debouncedSearch || selectedTag || statusFilter !== 'all') && (
            <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 rounded-lg mt-4 mb-2 flex items-center justify-between">
              <span>
                {result.totalCount}개의 결과
                {selectedTag && <span className="ml-2 text-blue-600">#{selectedTag}</span>}
                {statusFilter !== 'all' && <span className="ml-2 text-gray-400">({STATUS_LABELS[statusFilter]})</span>}
              </span>
              <button
                onClick={onClearFilters}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* 아티클 리스트 */}
          {viewMode === 'card' ? (
            result.articles.map((article) => (
              <ArticleCard key={article.id} article={article} onDelete={onDelete} />
            ))
          ) : (
            <div className="border-t border-gray-100 mt-2">
              {result.articles.map((article) => (
                <ArticleListView key={article.id} article={article} onDelete={onDelete} />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          <Pagination
            currentPage={result.currentPage}
            totalPages={result.totalPages}
            totalCount={result.totalCount}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </main>
  );
}
