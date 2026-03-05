'use client';

import { useState } from 'react';
import { ActionType, ACTION_TYPE_LABELS, DEFAULT_TAGS } from '@/types/insight';

interface QuickCaptureBarProps {
  onCapture: (data: { keyword: string; action_type: ActionType; tags: string[] }) => Promise<boolean>;
  isLoading?: boolean;
}

const STORAGE_KEY = 'xae-quick-capture-expanded';

export function QuickCaptureBar({ onCapture, isLoading }: QuickCaptureBarProps) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const [keyword, setKeyword] = useState('');
  const [actionType, setActionType] = useState<ActionType>('idea');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const handleSubmit = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    const success = await onCapture({
      keyword: trimmed,
      action_type: actionType,
      tags: selectedTags,
    });

    if (success) {
      setKeyword('');
      setSelectedTags([]);
      setActionType('idea');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="text-lg">{expanded ? '▾' : '▸'}</span>
        <span className="text-sm font-semibold text-blue-900">Quick Capture</span>
        <span className="text-xs text-blue-500">빠른 인사이트 메모</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Keyword input + submit */}
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="인사이트 키워드를 입력하세요..."
              className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={!keyword.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : '저장'}
            </button>
          </div>

          {/* Action type buttons */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-blue-600 mr-1">유형:</span>
            {(Object.entries(ACTION_TYPE_LABELS) as [ActionType, { emoji: string; label: string }][]).map(
              ([type, { emoji, label }]) => (
                <button
                  key={type}
                  onClick={() => setActionType(type)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    actionType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-blue-100'
                  }`}
                >
                  {emoji} {label}
                </button>
              )
            )}
          </div>

          {/* Quick tag chips */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-blue-600 mr-1">태그:</span>
            {DEFAULT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-blue-100'
                }`}
              >
                {selectedTags.includes(tag) ? '✓ ' : ''}
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
