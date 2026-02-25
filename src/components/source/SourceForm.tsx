'use client';

import {
  SourceCategory,
  SOURCE_CATEGORIES,
  SOURCE_CATEGORY_LABELS,
} from '@/types/source';

interface SourceFormProps {
  formName: string;
  formUrl: string;
  formDescription: string;
  formCategory: SourceCategory;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: SourceCategory) => void;
}

export function SourceForm({
  formName,
  formUrl,
  formDescription,
  formCategory,
  onNameChange,
  onUrlChange,
  onDescriptionChange,
  onCategoryChange,
}: SourceFormProps) {
  return (
    <div className="px-6 py-4 space-y-4">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="출처 이름 (예: Lenny's Newsletter)"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
          autoFocus
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_CATEGORIES.map((cat) => {
            const { emoji, label } = SOURCE_CATEGORY_LABELS[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  formCategory === cat
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

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <input
          type="url"
          value={formUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          value={formDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="출처에 대한 간단한 설명..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
        />
      </div>
    </div>
  );
}
