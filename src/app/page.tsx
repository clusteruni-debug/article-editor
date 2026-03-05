'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Article } from '@/types/article';
import { useToast } from '@/components/ui/Toast';
import { useArticle } from '@/hooks/useArticle';
import { PaginatedResult } from '@/hooks/useArticle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useInsight } from '@/hooks/useInsight';
import { HomeHeader, HomeArticleList } from './components';
import { QuickCaptureBar } from '@/components/insight/QuickCaptureBar';
import { StaleInsightsReminder } from '@/components/insight/StaleInsightsReminder';
import { InsightWithArticle } from '@/types/insight';

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
  const { createInsight, getInsights, updateStatus, loading: insightLoading } = useInsight();
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
  const [allInsights, setAllInsights] = useState<InsightWithArticle[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      setCurrentPage(1);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadArticles();
  }, [loadArticles]);

  // 태그 목록 + 상태별 카운트 + 인사이트 (한 번만)
  useEffect(() => {
    getAllTags().then(setAllTags);
    getStatusCounts().then(setStatusCounts);
    getInsights().then(setAllInsights);
  }, [getAllTags, getStatusCounts, getInsights]);

  // RecycleSuggestions용
  useEffect(() => {
    if (!debouncedSearch && !selectedTag && statusFilter === 'all') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllArticlesForRecycle(result.articles);
    }
  }, [result.articles, debouncedSearch, selectedTag, statusFilter]);

  // 삭제 처리
  const handleDelete = async (id: string) => {
    const success = await deleteArticle(id);
    if (success) {
      showSuccess('글이 삭제되었습니다');
      if (result.articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadArticles();
      }
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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setStatusFilter('all');
    setSortOption('newest');
    setCurrentPage(1);
  };

  const handleStartArticleFromInsight = (insight: InsightWithArticle) => {
    const params = new URLSearchParams();
    params.set('insightId', insight.id);
    params.set('keyword', insight.keyword);
    if (insight.summary) params.set('summary', insight.summary);
    router.push(`/editor?${params.toString()}`);
  };

  const handleMarkObserved = async (id: string) => {
    const success = await updateStatus(id, 'idea');
    if (success) {
      showSuccess('상태가 업데이트되었습니다');
      getInsights().then(setAllInsights);
    }
  };

  const handleQuickCapture = async (data: { keyword: string; action_type: import('@/types/insight').ActionType; tags: string[] }) => {
    const created = await createInsight({
      keyword: data.keyword,
      action_type: data.action_type,
      tags: data.tags,
      status: 'idea',
    });
    if (created) {
      showSuccess('인사이트가 저장되었습니다');
      return true;
    }
    showError('인사이트 저장에 실패했습니다');
    return false;
  };

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        statusCounts={statusCounts}
        allTags={allTags}
        selectedTag={selectedTag}
        onTagChange={handleTagChange}
      />

      <div className="max-w-6xl mx-auto px-4 pt-4 space-y-0">
        <QuickCaptureBar onCapture={handleQuickCapture} isLoading={insightLoading} />
        <StaleInsightsReminder
          insights={allInsights}
          onStartArticle={handleStartArticleFromInsight}
          onMarkObserved={handleMarkObserved}
        />
      </div>

      <HomeArticleList
        loading={loading}
        result={result}
        debouncedSearch={debouncedSearch}
        selectedTag={selectedTag}
        statusFilter={statusFilter}
        viewMode={viewMode}
        allArticlesForRecycle={allArticlesForRecycle}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
