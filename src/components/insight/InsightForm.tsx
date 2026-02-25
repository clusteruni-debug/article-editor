'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Insight,
  InsightInsert,
  ActionType,
  InsightStatus,
} from '@/types/insight';
import { Source, SourceInsert } from '@/types/source';
import { SourceSelect } from '@/components/source';
import { TagSelector } from './TagSelector';
import { ActionTypeSelector } from './ActionTypeSelector';
import { StatusSelector } from './StatusSelector';

interface InsightFormProps {
  insight?: Insight;
  onSubmit: (data: InsightInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingTags?: string[]; // 기존 사용된 태그 목록 (자동완성용)
  existingSources?: Source[]; // 기존 등록된 소스 목록
  onCreateSource?: (data: SourceInsert) => Promise<Source | null>; // 인라인 소스 생성
}

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
  };

  // 태그 삭제
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

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
            <ActionTypeSelector value={actionType} onChange={setActionType} />

            {/* 상태 */}
            <StatusSelector value={status} onChange={setStatus} />

            {/* 태그 */}
            <TagSelector
              tags={tags}
              tagInput={tagInput}
              existingTags={existingTags}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onTagInputChange={setTagInput}
            />

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
