'use client';

import { ActionType, ACTION_TYPE_LABELS } from '@/types/insight';
import { Source } from '@/types/source';

const ACTION_TYPES: ActionType[] = ['execute', 'idea', 'observe', 'reference'];

interface InsightFiltersProps {
  selectedActionType: ActionType | null;
  onActionTypeChange: (type: ActionType | null) => void;
  allTags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  sources: Source[];
  selectedSource: string | null;
  onSourceChange: (sourceId: string | null) => void;
}

export function InsightFilters({
  selectedActionType,
  onActionTypeChange,
  allTags,
  selectedTag,
  onTagChange,
  sources,
  selectedSource,
  onSourceChange,
}: InsightFiltersProps) {
  return (
    <>
      {/* 필터: 액션 타입 */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto">
        <span className="text-xs text-gray-400 flex-shrink-0">타입:</span>
        <button
          onClick={() => onActionTypeChange(null)}
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
                onActionTypeChange(selectedActionType === type ? null : type)
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
            onClick={() => onTagChange(null)}
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
              onClick={() => onTagChange(selectedTag === tag ? null : tag)}
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
            onClick={() => onSourceChange(null)}
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
              onClick={() => onSourceChange(selectedSource === src.id ? null : src.id)}
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
    </>
  );
}
