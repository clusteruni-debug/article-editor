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
import { Source, SourceInsert } from '@/types/source';
import { SourceSelect } from '@/components/source';

interface InsightFormProps {
  insight?: Insight;
  onSubmit: (data: InsightInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingTags?: string[]; // 기존 사용된 태그 목록 (자동완성용)
  existingSources?: Source[]; // 기존 등록된 소스 목록
  onCreateSource?: (data: SourceInsert) => Promise<Source | null>; // 인라인 소스 생성
}

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];
const STATUSES: InsightStatus[] = ['unread', 'idea', 'drafted', 'published'];

export function InsightForm({ insight, onSubmit, onCancel, isLoading, existingTags = [], existingSources = [], onCreateSource }: InsightFormProps) {
  const [keyword, setKeyword] = useState(insight?.keyword || '');
  const [summary, setSummary] = useState(insight?.summary || '');
  const [source, setSource] = useState(insight?.source || '');
  const [sourceId, setSourceId] = useState<string | undefined>(insight?.source_id);
  const [link, setLink] = useState(insight?.link || '');
  const [insightDate, setInsightDate] = useState(
    insight?.insight_date || new Date().toISOString().split('T')[0]
  );
  const [actionType, setActionType] = useState<ActionType>(insight?.action_type || 'observe');
  const [status, setStatus] = useState<InsightStatus>(insight?.status || 'unread');
  const [tags, setTags] = useState<string[]>(insight?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [notes, setNotes] = useState(insight?.notes || '');

  useEffect(() => {
    if (insight) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKeyword(insight.keyword);
      setSummary(insight.summary || '');
      setSource(insight.source || '');
      setSourceId(insight.source_id);
      setLink(insight.link || '');
      setInsightDate(insight.insight_date);
      setActionType(insight.action_type);
      setStatus(insight.status);
      setTags(insight.tags || []);
      setNotes(insight.notes || '');
    }
  }, [insight]);

  // 태그 추가
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // 태그 입력 키 처리
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // 자동완성 추천 태그 (입력 중이면 필터링, 비어있으면 미사용 태그 전부 표시)
  const suggestedTags = existingTags.filter(
    (t) =>
      !tags.includes(t) &&
      (tagInput.trim().length === 0 || t.toLowerCase().includes(tagInput.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    await onSubmit({
      keyword: keyword.trim(),
      summary: summary.trim() || undefined,
      source: source.trim() || undefined,
      source_id: sourceId,
      link: link.trim() || undefined,
      insight_date: insightDate,
      action_type: actionType,
      status,
      tags,
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

            {/* 출처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">출처</label>
              {existingSources.length > 0 || onCreateSource ? (
                <SourceSelect
                  sources={existingSources}
                  selectedSourceId={sourceId}
                  selectedSourceName={source}
                  onSelect={(id, name) => {
                    setSourceId(id);
                    setSource(name);
                  }}
                  onCreateSource={onCreateSource}
                />
              ) : (
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="뉴스레터, URL 등"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              )}
            </div>

            {/* 원문 링크 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">원문 링크</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input
                type="date"
                value={insightDate}
                onChange={(e) => setInsightDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              />
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

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
              {/* 선택된 태그 목록 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="group/tag inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-400 group-hover/tag:text-red-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* 태그 입력 */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="태그 입력 후 Enter (쉼표로 구분)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              {/* 추천 태그 (항상 표시) */}
              {suggestedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
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
