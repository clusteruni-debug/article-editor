'use client';

import { SourceStats, SOURCE_CATEGORY_LABELS } from '@/types/source';

interface SourceCardProps {
  source: SourceStats;
  deleteConfirmId: string | null;
  onEdit: (source: SourceStats) => void;
  onDelete: (id: string) => void;
  onDeleteConfirm: (id: string | null) => void;
}

export function SourceCard({
  source,
  deleteConfirmId,
  onEdit,
  onDelete,
  onDeleteConfirm,
}: SourceCardProps) {
  const { emoji, label } = SOURCE_CATEGORY_LABELS[source.category];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
      {/* 카테고리 이모지 */}
      <span className="text-lg flex-shrink-0">{emoji}</span>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{source.name}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
        </div>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline truncate block"
          >
            {source.url}
          </a>
        )}
        {source.description && (
          <p className="text-xs text-gray-400 truncate">{source.description}</p>
        )}
      </div>

      {/* 인사이트 수 */}
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
        {source.insight_count}개
      </span>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onEdit(source)}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
          title="편집"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {deleteConfirmId === source.id ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDelete(source.id)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={() => onDeleteConfirm(null)}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              취소
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onDeleteConfirm(source.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded"
            title="삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
