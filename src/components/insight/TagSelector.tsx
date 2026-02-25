'use client';

interface TagSelectorProps {
  tags: string[];
  tagInput: string;
  existingTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onTagInputChange: (value: string) => void;
}

export function TagSelector({
  tags,
  tagInput,
  existingTags,
  onAddTag,
  onRemoveTag,
  onTagInputChange,
}: TagSelectorProps) {
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        onAddTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  // 자동완성 추천 태그 (입력 중이면 필터링, 비어있으면 미사용 태그 전부 표시)
  const suggestedTags = existingTags.filter(
    (t) =>
      !tags.includes(t) &&
      (tagInput.trim().length === 0 || t.toLowerCase().includes(tagInput.toLowerCase()))
  );

  return (
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
                onClick={() => onRemoveTag(tag)}
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
        onChange={(e) => onTagInputChange(e.target.value)}
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
              onClick={() => onAddTag(tag)}
              className="px-2 py-1 text-xs rounded-full border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
