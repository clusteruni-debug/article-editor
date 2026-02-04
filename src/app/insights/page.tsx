'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInCalendarDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useInsight } from '@/hooks/useInsight';
import { useSource } from '@/hooks/useSource';
import { InsightCard, InsightForm } from '@/components/insight';
import { SourceManager } from '@/components/source';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import {
  InsightWithArticle,
  InsightInsert,
  ActionType,
  InsightStatus,
  ACTION_TYPE_LABELS,
  DEFAULT_TAGS,
} from '@/types/insight';
import { Source, SourceStats } from '@/types/source';

// 날짜별 그룹 타입
interface DateGroup {
  date: string; // YYYY-MM-DD
  label: string; // 표시용 (예: 2026.02.04)
  insights: InsightWithArticle[];
}

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];

export default function InsightsPage() {
  const router = useRouter();
  const { getInsights, createInsight, updateInsight, deleteInsight, getAllTags, loading } = useInsight();
  const {
    getSources,
    createSource,
    updateSource,
    deleteSource,
    getSourceStats,
  } = useSource();
  const { success: showSuccess, error: showError } = useToast();
  const [insights, setInsights] = useState<InsightWithArticle[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<ActionType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InsightStatus | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null); // source_id 필터
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 최신순/오래된순
  const [showSourceManager, setShowSourceManager] = useState(false);

  // 아코디언 상태: 접힌 날짜 Set (기본: 최근 3일 제외 나머지 접힘)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // 모달 상태
  const [showForm, setShowForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<InsightWithArticle | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const [data, dbTags, sourceList] = await Promise.all([
      getInsights(),
      getAllTags(),
      getSources(),
    ]);
    setInsights(data);
    setSources(sourceList);
    // 기본 태그 + DB에서 사용된 태그를 합쳐서 중복 제거
    const merged = Array.from(new Set([...DEFAULT_TAGS, ...dbTags])).sort();
    setAllTags(merged);
  };

  // 소스 관리 모달에서 사용할 통계 로드
  const loadSourceStats = async () => {
    const stats = await getSourceStats();
    setSourceStats(stats);
  };

  // 필터링
  const filteredInsights = useMemo(() => {
    let result = insights;

    if (selectedActionType) {
      result = result.filter((i) => i.action_type === selectedActionType);
    }
    if (selectedStatus) {
      result = result.filter((i) => i.status === selectedStatus);
    }
    if (selectedTag) {
      result = result.filter((i) => i.tags && i.tags.includes(selectedTag));
    }
    if (selectedSource) {
      result = result.filter((i) => i.source_id === selectedSource);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => {
        return (
          i.keyword.toLowerCase().includes(query) ||
          i.summary?.toLowerCase().includes(query) ||
          i.source?.toLowerCase().includes(query) ||
          i.tags?.some((t) => t.toLowerCase().includes(query))
        );
      });
    }

    return result;
  }, [insights, selectedActionType, selectedStatus, selectedTag, selectedSource, searchQuery]);

  // 날짜별 그룹핑
  const dateGroups = useMemo((): DateGroup[] => {
    const groupMap = new Map<string, InsightWithArticle[]>();

    for (const insight of filteredInsights) {
      const date = insight.insight_date; // YYYY-MM-DD
      if (!groupMap.has(date)) {
        groupMap.set(date, []);
      }
      groupMap.get(date)!.push(insight);
    }

    // 정렬 순서에 따라 날짜 정렬
    const sortedDates = Array.from(groupMap.keys()).sort((a, b) => {
      const diff = new Date(b).getTime() - new Date(a).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });

    return sortedDates.map((date) => ({
      date,
      label: format(new Date(date), 'yyyy.MM.dd (EEEE)', { locale: ko }),
      insights: groupMap.get(date)!,
    }));
  }, [filteredInsights, sortOrder]);

  // 인사이트 로드 후 최근 3일 이외의 날짜를 접힘 상태로 초기화
  useEffect(() => {
    if (dateGroups.length > 0) {
      const today = new Date();
      const collapsed = new Set<string>();
      for (const group of dateGroups) {
        const daysDiff = differenceInCalendarDays(today, new Date(group.date));
        if (daysDiff > 2) {
          collapsed.add(group.date);
        }
      }
      setCollapsedDates(collapsed);
    }
  }, [insights]); // insights 전체가 변할 때만 (필터 변경 시에는 리셋 안 함)

  // 아코디언 토글
  const toggleDate = useCallback((date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);

  // 통계
  const stats = useMemo(() => {
    return {
      total: insights.length,
      unread: insights.filter((i) => i.status === 'unread').length,
      idea: insights.filter((i) => i.status === 'idea').length,
      drafted: insights.filter((i) => i.status === 'drafted').length,
      published: insights.filter((i) => i.status === 'published').length,
    };
  }, [insights]);

  const handleCreate = async (data: InsightInsert) => {
    setFormLoading(true);
    const result = await createInsight(data);
    setFormLoading(false);
    if (result) {
      setShowForm(false);
      loadInsights();
      showSuccess('인사이트가 추가되었습니다');
    } else {
      showError('인사이트 추가에 실패했습니다');
    }
  };

  const handleUpdate = async (data: InsightInsert) => {
    if (!editingInsight) return;
    setFormLoading(true);
    const result = await updateInsight(editingInsight.id, data);
    setFormLoading(false);
    if (result) {
      setEditingInsight(null);
      loadInsights();
      showSuccess('인사이트가 수정되었습니다');
    } else {
      showError('인사이트 수정에 실패했습니다');
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteInsight(id);
    if (success) {
      setInsights((prev) => prev.filter((i) => i.id !== id));
      showSuccess('인사이트가 삭제되었습니다');
    } else {
      showError('삭제에 실패했습니다');
    }
  };

  const handleEdit = (insight: InsightWithArticle) => {
    setEditingInsight(insight);
  };

  const handleStartArticle = (insight: InsightWithArticle) => {
    // 에디터로 이동하면서 인사이트 정보 전달
    const params = new URLSearchParams({
      insightId: insight.id,
      keyword: insight.keyword,
    });
    if (insight.summary) {
      params.set('summary', insight.summary);
    }
    router.push(`/editor?${params.toString()}`);
  };

  const handleGenerateAI = async (insight: InsightWithArticle) => {
    setGeneratingId(insight.id);
    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: insight.keyword,
          summary: insight.summary,
          actionType: insight.action_type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate draft');
      }

      const draft = await response.json();

      // 에디터로 이동하면서 AI 생성 내용 전달
      const params = new URLSearchParams({
        insightId: insight.id,
        keyword: insight.keyword,
        aiTitle: draft.title,
        aiContent: draft.content,
        aiTags: draft.tags.join(','),
      });

      showSuccess('AI 초안이 생성되었습니다');
      router.push(`/editor?${params.toString()}`);
    } catch (error) {
      console.error('AI generation error:', error);
      showError('AI 초안 생성에 실패했습니다');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInsight(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* 상단 */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold">Insights</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  loadSourceStats();
                  setShowSourceManager(true);
                }}
              >
                출처 관리
              </Button>
              <Button onClick={() => setShowForm(true)}>새 인사이트</Button>
            </div>
          </div>

          {/* 통계 (클릭으로 상태 필터링) */}
          <div className="flex items-center gap-1 text-sm mb-4 overflow-x-auto">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === null
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              전체 {stats.total}
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'unread' ? null : 'unread')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === 'unread'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              미확인 {stats.unread}
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'idea' ? null : 'idea')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === 'idea'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              아이디어 {stats.idea}
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'drafted' ? null : 'drafted')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === 'drafted'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              작성중 {stats.drafted}
            </button>
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'published' ? null : 'published')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === 'published'
                  ? 'bg-green-600 text-white'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              발행완료 {stats.published}
            </button>
          </div>

          {/* 검색 + 정렬 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="키워드, 요약, 출처, 태그 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 flex-shrink-0"
            >
              <option value="desc">최신순</option>
              <option value="asc">오래된순</option>
            </select>
          </div>

          {/* 필터: 액션 타입 */}
          <div className="flex items-center gap-2 mb-2 overflow-x-auto">
            <span className="text-xs text-gray-400 flex-shrink-0">타입:</span>
            <button
              onClick={() => setSelectedActionType(null)}
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedActionType === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {ACTION_TYPES.map((type) => {
              const { emoji, label } = ACTION_TYPE_LABELS[type];
              return (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedActionType(selectedActionType === type ? null : type)
                  }
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedActionType === type
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {emoji} {label}
                </button>
              );
            })}
          </div>

          {/* 필터: 태그 */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto mb-2">
              <span className="text-xs text-gray-400 flex-shrink-0">태그:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                전체
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* 필터: 출처 */}
          {sources.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-400 flex-shrink-0">출처:</span>
              <button
                onClick={() => setSelectedSource(null)}
                className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  selectedSource === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                전체
              </button>
              {sources.map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(selectedSource === src.id ? null : src.id)}
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedSource === src.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  {src.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 인사이트 목록 */}
      <main className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : insights.length === 0 ? (
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
            <Button onClick={() => setShowForm(true)}>첫 인사이트 추가하기</Button>
          </div>
        ) : filteredInsights.length === 0 ? (
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
        ) : (
          <div>
            {(searchQuery || selectedActionType || selectedStatus || selectedTag || selectedSource) && (
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
                    onClick={() => toggleDate(group.date)}
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
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStartArticle={handleStartArticle}
                        onGenerateAI={handleGenerateAI}
                        isGenerating={generatingId === insight.id}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 폼 모달 */}
      {(showForm || editingInsight) && (
        <InsightForm
          insight={editingInsight || undefined}
          onSubmit={editingInsight ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
          isLoading={formLoading}
          existingTags={allTags}
          existingSources={sources}
          onCreateSource={async (data) => {
            const result = await createSource(data);
            if (result) {
              // 소스 목록 갱신
              const updated = await getSources();
              setSources(updated);
            }
            return result;
          }}
        />
      )}

      {/* 소스 관리 모달 */}
      {showSourceManager && (
        <SourceManager
          onClose={() => setShowSourceManager(false)}
          sources={sourceStats}
          onCreateSource={createSource}
          onUpdateSource={updateSource}
          onDeleteSource={deleteSource}
          onRefresh={async () => {
            await loadSourceStats();
            // 소스 목록도 갱신 (필터에 반영)
            const updated = await getSources();
            setSources(updated);
          }}
        />
      )}
    </div>
  );
}
