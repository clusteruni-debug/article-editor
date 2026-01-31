'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  InsightWithArticle,
  ACTION_TYPE_LABELS,
  STATUS_LABELS,
  PLATFORM_LABELS,
  Platform,
} from '@/types/insight';

interface InsightCardProps {
  insight: InsightWithArticle;
  onEdit?: (insight: InsightWithArticle) => void;
  onDelete?: (id: string) => void;
  onStartArticle?: (insight: InsightWithArticle) => void;
  onGenerateAI?: (insight: InsightWithArticle) => void;
  isGenerating?: boolean;
}

export function InsightCard({
  insight,
  onEdit,
  onDelete,
  onStartArticle,
  onGenerateAI,
  isGenerating,
}: InsightCardProps) {
  const formattedDate = format(new Date(insight.insight_date), 'M월 d일', {
    locale: ko,
  });
  const actionType = ACTION_TYPE_LABELS[insight.action_type];
  const status = STATUS_LABELS[insight.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      confirm(
        `"${insight.keyword}" 인사이트를 삭제하시겠습니까?\n삭제된 인사이트는 복구할 수 없습니다.`
      )
    ) {
      onDelete?.(insight.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(insight);
  };

  const handleStartArticle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStartArticle?.(insight);
  };

  const handleGenerateAI = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onGenerateAI?.(insight);
  };

  const statusColorClass = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
  }[status.color];

  return (
    <div className="group p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* 상단: 액션타입, 상태, 날짜 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-base" title={actionType.label}>
              {actionType.emoji}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColorClass}`}>
              {status.label}
            </span>
            <span className="text-sm text-gray-400">{formattedDate}</span>
            {insight.source && (
              <span className="text-xs text-gray-400 truncate max-w-[150px]">
                from {insight.source}
              </span>
            )}
          </div>

          {/* 키워드 */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{insight.keyword}</h3>

          {/* 요약 */}
          {insight.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{insight.summary}</p>
          )}

          {/* 연결된 아티클 */}
          {insight.article && (
            <Link
              href={
                insight.article.status === 'draft'
                  ? `/editor/${insight.article.id}`
                  : `/article/${insight.article.id}`
              }
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              {insight.article.title || '제목 없음'}
              {insight.article.status === 'draft' && (
                <span className="text-xs text-yellow-600">(작성중)</span>
              )}
            </Link>
          )}

          {/* 발행 플랫폼 */}
          {insight.platforms_published.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-400">발행:</span>
              {insight.platforms_published.map((platform) => (
                <span
                  key={platform}
                  className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded"
                >
                  {PLATFORM_LABELS[platform as Platform] || platform}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* AI 초안 생성 (아직 연결 안된 경우) */}
          {!insight.linked_article_id && (
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className={`p-2 rounded flex items-center gap-1 ${
                isGenerating
                  ? 'text-purple-400 cursor-wait'
                  : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'
              }`}
              title="AI 초안 생성"
            >
              {isGenerating ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>
          )}

          {/* 글 시작하기 (아직 연결 안된 경우) */}
          {!insight.linked_article_id && (
            <button
              onClick={handleStartArticle}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
              title="글 시작하기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}

          {/* 편집 */}
          <button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="편집"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          {/* 삭제 */}
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            title="삭제"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
