'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Article } from '@/types/article';
import { ArticleCard } from '@/components/article/ArticleCard';
import { ArticleListView } from '@/components/article/ArticleListView';
import { RecycleSuggestions } from '@/components/article/RecycleSuggestions';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useArticle } from '@/hooks/useArticle';
import { PaginatedResult } from '@/hooks/useArticle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const PAGE_SIZE = 10;

type SortOption = 'newest' | 'oldest' | 'updated' | 'title';
type StatusFilter = 'all' | 'draft' | 'published';
type ViewMode = 'card' | 'list';

const SORT_LABELS: Record<SortOption, string> = {
  newest: '최신순',
  oldest: '오래된순',
  updated: '최근 수정순',
  title: '제목순',
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  draft: '임시저장',
  published: '발행됨',
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getArticlesPaginated, getStatusCounts, getAllTags, deleteArticle, loading } = useArticle();
  const { success: showSuccess, error: showError } = useToast();

  // URL 파라미터에서 초기값 복원
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get('page');
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1;
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState<string | null>(() => searchParams.get('tag') || null);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const s = searchParams.get('sort');
    return (s && s in SORT_LABELS) ? s as SortOption : 'newest';
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const st = searchParams.get('status');
    return (st && st in STATUS_LABELS) ? st as StatusFilter : 'all';
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = searchParams.get('view');
    return v === 'list' ? 'list' : 'card';
  });

  const [result, setResult] = useState<PaginatedResult>({
    articles: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [allTags, setAllTags] = useState<string[]>([]);
  const [statusCounts, setStatusCounts] = useState({ total: 0, draft: 0, published: 0 });
  const [allArticlesForRecycle, setAllArticlesForRecycle] = useState<Article[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 실제 검색에 사용할 디바운스된 검색어
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // 키보드 단축키
  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: () => router.push('/editor'), description: '새 글' },
    { key: 'k', ctrl: true, handler: () => searchInputRef.current?.focus(), description: '검색' },
  ]);

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // 검색어 변경 시 1페이지로
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // URL 파라미터 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', String(currentPage));
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedTag) params.set('tag', selectedTag);
    if (sortOption !== 'newest') params.set('sort', sortOption);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (viewMode !== 'card') params.set('view', viewMode);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    // replace로 히스토리 안 쌓이게
    router.replace(newUrl, { scroll: false });
  }, [currentPage, debouncedSearch, selectedTag, sortOption, statusFilter, viewMode, router]);

  // 데이터 로드
  const loadArticles = useCallback(async () => {
    const data = await getArticlesPaginated({
      page: currentPage,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      tag: selectedTag || undefined,
      status: statusFilter === 'all' ? null : statusFilter,
      sort: sortOption,
    });
    setResult(data);
  }, [getArticlesPaginated, currentPage, debouncedSearch, selectedTag, statusFilter, sortOption]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // 태그 목록 + 상태별 카운트 (한 번만)
  useEffect(() => {
    getAllTags().then(setAllTags);
    getStatusCounts().then(setStatusCounts);
  }, [getAllTags, getStatusCounts]);

  // RecycleSuggestions용: 필터 없을 때만 전체 아티클 불러오기 (별도 경량 쿼리)
  useEffect(() => {
    if (!debouncedSearch && !selectedTag && statusFilter === 'all') {
      // 첫 페이지 데이터로 간략히 대체 (RecycleSuggestions는 날짜만 봄)
      setAllArticlesForRecycle(result.articles);
    }
  }, [result.articles, debouncedSearch, selectedTag, statusFilter]);

  // 삭제 처리
  const handleDelete = async (id: string) => {
    const success = await deleteArticle(id);
    if (success) {
      showSuccess('글이 삭제되었습니다');
      // 현재 페이지에서 마지막 아이템이었으면 이전 페이지로
      if (result.articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadArticles();
      }
      // 태그 목록 + 카운트 갱신
      getAllTags().then(setAllTags);
      getStatusCounts().then(setStatusCounts);
    } else {
      showError('삭제에 실패했습니다');
    }
  };

  // 필터 변경 시 1페이지로 리셋
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 검색 및 필터 바 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* 검색 + 정렬 + 뷰 모드 */}
          <div className="flex items-center gap-3">
            {/* 검색 입력 */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="제목, 내용 검색... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* 정렬 드롭다운 */}
            <select
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* 뷰 모드 토글 */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                title="카드뷰"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                title="리스트뷰"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => handleStatusChange('all')}
            className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            전체 {statusCounts.total}
          </button>
          <button
            onClick={() => handleStatusChange('draft')}
            className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
              statusFilter === 'draft'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            임시저장 {statusCounts.draft}
          </button>
          <button
            onClick={() => handleStatusChange('published')}
            className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
              statusFilter === 'published'
                ? 'bg-green-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            발행됨 {statusCounts.published}
          </button>
        </div>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-gray-400 flex-shrink-0">태그:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 아티클 목록 */}
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
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setStatusFilter('all');
                    setSortOption('newest');
                    setCurrentPage(1);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            )}

            {/* 아티클 리스트 */}
            {viewMode === 'card' ? (
              result.articles.map((article) => (
                <ArticleCard key={article.id} article={article} onDelete={handleDelete} />
              ))
            ) : (
              <div className="border-t border-gray-100 mt-2">
                {result.articles.map((article) => (
                  <ArticleListView key={article.id} article={article} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            <Pagination
              currentPage={result.currentPage}
              totalPages={result.totalPages}
              totalCount={result.totalCount}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
