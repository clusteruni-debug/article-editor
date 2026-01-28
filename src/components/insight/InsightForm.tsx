'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Insight,
  InsightInsert,
  ActionType,
  InsightStatus,
  ACTION_TYPE_LABELS,
  STATUS_LABELS,
} from '@/types/insight';

interface InsightFormProps {
  insight?: Insight;
  onSubmit: (data: InsightInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];
const STATUSES: InsightStatus[] = ['unread', 'idea', 'drafted', 'published'];

export function InsightForm({ insight, onSubmit, onCancel, isLoading }: InsightFormProps) {
  const [keyword, setKeyword] = useState(insight?.keyword || '');
  const [summary, setSummary] = useState(insight?.summary || '');
  const [source, setSource] = useState(insight?.source || '');
  const [insightDate, setInsightDate] = useState(
    insight?.insight_date || new Date().toISOString().split('T')[0]
  );
  const [actionType, setActionType] = useState<ActionType>(insight?.action_type || 'observe');
  const [status, setStatus] = useState<InsightStatus>(insight?.status || 'unread');
  const [notes, setNotes] = useState(insight?.notes || '');

  useEffect(() => {
    if (insight) {
      setKeyword(insight.keyword);
      setSummary(insight.summary || '');
      setSource(insight.source || '');
      setInsightDate(insight.insight_date);
      setActionType(insight.action_type);
      setStatus(insight.status);
      setNotes(insight.notes || '');
    }
  }, [insight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    await onSubmit({
      keyword: keyword.trim(),
      summary: summary.trim() || undefined,
      source: source.trim() || undefined,
      insight_date: insightDate,
      action_type: actionType,
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {insight ? '인사이트 편집' : '새 인사이트'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 본문 */}
          <div className="px-6 py-4 space-y-4">
            {/* 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                키워드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="핵심 키워드나 주제"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                required
                autoFocus
              />
            </div>

            {/* 요약 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="인사이트 내용을 간단히 정리..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>

            {/* 출처, 날짜 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">출처</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="뉴스레터, URL 등"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  value={insightDate}
                  onChange={(e) => setInsightDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 액션 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                액션 타입
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTION_TYPES.map((type) => {
                  const { emoji, label } = ACTION_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActionType(type)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        actionType === type
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {emoji} {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const { label, color } = STATUS_LABELS[s];
                  const colorClass =
                    status === s
                      ? {
                          gray: 'bg-gray-900 text-white border-gray-900',
                          blue: 'bg-blue-600 text-white border-blue-600',
                          yellow: 'bg-yellow-500 text-white border-yellow-500',
                          green: 'bg-green-600 text-white border-green-600',
                        }[color]
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${colorClass}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="추가 메모..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={!keyword.trim() || isLoading}>
              {isLoading ? '저장 중...' : insight ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
