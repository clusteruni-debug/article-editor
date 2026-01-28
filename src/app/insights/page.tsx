'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useInsight } from '@/hooks/useInsight';
import { InsightCard, InsightForm } from '@/components/insight';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import {
  InsightWithArticle,
  InsightInsert,
  ActionType,
  InsightStatus,
  ACTION_TYPE_LABELS,
  STATUS_LABELS,
} from '@/types/insight';

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];
const STATUSES: InsightStatus[] = ['unread', 'idea', 'drafted', 'published'];

export default function InsightsPage() {
  const router = useRouter();
  const { getInsights, createInsight, updateInsight, deleteInsight, loading } = useInsight();
  const { success: showSuccess, error: showError } = useToast();
  const [insights, setInsights] = useState<InsightWithArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<ActionType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InsightStatus | null>(null);

  // 모달 상태
  const [showForm, setShowForm] = useState(false);
  const [editingInsight, setEditingInsight] = useState<InsightWithArticle | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const data = await getInsights();
    setInsights(data);
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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((i) => {
        return (
          i.keyword.toLowerCase().includes(query) ||
          i.summary?.toLowerCase().includes(query) ||
          i.source?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [insights, selectedActionType, selectedStatus, searchQuery]);

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
            <Button onClick={() => setShowForm(true)}>새 인사이트</Button>
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>전체 {stats.total}</span>
            <span className="text-gray-300">|</span>
            <span>미확인 {stats.unread}</span>
            <span>아이디어 {stats.idea}</span>
            <span>작성중 {stats.drafted}</span>
            <span className="text-green-600">발행완료 {stats.published}</span>
          </div>

          {/* 검색 */}
          <div className="relative mb-3">
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
              placeholder="키워드, 요약, 출처 검색..."
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

          {/* 필터: 상태 */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-gray-400 flex-shrink-0">상태:</span>
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedStatus === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {STATUSES.map((status) => {
              const { label } = STATUS_LABELS[status];
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedStatus === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
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
            {(searchQuery || selectedActionType || selectedStatus) && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                {filteredInsights.length}개의 결과
              </div>
            )}
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStartArticle={handleStartArticle}
              />
            ))}
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
        />
      )}
    </div>
  );
}
