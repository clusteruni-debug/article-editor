'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, differenceInCalendarDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useInsight } from '@/hooks/useInsight';
import { useSource } from '@/hooks/useSource';
import { InsightForm } from '@/components/insight';
import { SourceManager } from '@/components/source';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  InsightWithArticle,
  InsightInsert,
  ActionType,
  InsightStatus,
  DEFAULT_TAGS,
} from '@/types/insight';
import { Source, SourceStats } from '@/types/source';
import {
  InsightStatsBar,
  InsightSearchBar,
  InsightFilters,
  InsightDateGroupList,
} from './components';

// 날짜별 그룹 타입
interface DateGroup {
  date: string; // YYYY-MM-DD
  label: string; // 표시용 (예: 2026.02.04)
  insights: InsightWithArticle[];
}

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
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
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
    const merged = Array.from(new Set([...DEFAULT_TAGS, ...dbTags])).sort();
    setAllTags(merged);
  };

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
      const date = insight.insight_date;
      if (!groupMap.has(date)) {
        groupMap.set(date, []);
      }
      groupMap.get(date)!.push(insight);
    }

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

  const hasActiveFilters = !!(searchQuery || selectedActionType || selectedStatus || selectedTag || selectedSource);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
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

          <InsightStatsBar
            stats={stats}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <InsightSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />

          <InsightFilters
            selectedActionType={selectedActionType}
            onActionTypeChange={setSelectedActionType}
            allTags={allTags}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            sources={sources}
            selectedSource={selectedSource}
            onSourceChange={setSelectedSource}
          />
        </div>
      </header>

      {/* 인사이트 목록 */}
      <main className="max-w-6xl mx-auto">
        <InsightDateGroupList
          loading={loading}
          insights={insights}
          filteredInsights={filteredInsights}
          dateGroups={dateGroups}
          collapsedDates={collapsedDates}
          onToggleDate={toggleDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStartArticle={handleStartArticle}
          onGenerateAI={handleGenerateAI}
          generatingId={generatingId}
          onShowForm={() => setShowForm(true)}
          hasActiveFilters={hasActiveFilters}
        />
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
            const updated = await getSources();
            setSources(updated);
          }}
        />
      )}
    </div>
  );
}
