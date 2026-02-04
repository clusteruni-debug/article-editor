'use client';

import { useState, useRef, useEffect } from 'react';
import { Source, SourceInsert, SOURCE_CATEGORY_LABELS, SourceCategory } from '@/types/source';

interface SourceSelectProps {
  sources: Source[];
  selectedSourceId?: string;
  selectedSourceName?: string;
  onSelect: (sourceId: string | undefined, sourceName: string) => void;
  onCreateSource?: (data: SourceInsert) => Promise<Source | null>;
}

export function SourceSelect({
  sources,
  selectedSourceId,
  selectedSourceName = '',
  onSelect,
  onCreateSource,
}: SourceSelectProps) {
  const [inputValue, setInputValue] = useState(selectedSourceName);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState<SourceCategory>('newsletter');
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 선택된 소스 이름이 외부에서 변경되면 반영
  useEffect(() => {
    setInputValue(selectedSourceName);
  }, [selectedSourceName]);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowCreateForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 입력값으로 소스 필터링
  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // 입력값과 정확히 일치하는 소스가 없는 경우 "새 출처 추가" 옵션 표시
  const exactMatch = sources.find((s) => s.name.toLowerCase() === inputValue.toLowerCase());

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowDropdown(true);
    setShowCreateForm(false);

    // 입력 비우면 선택 해제
    if (!value.trim()) {
      onSelect(undefined, '');
    }
  };

  const handleSelectSource = (source: Source) => {
    setInputValue(source.name);
    onSelect(source.id, source.name);
    setShowDropdown(false);
    setShowCreateForm(false);
  };

  const handleClear = () => {
    setInputValue('');
    onSelect(undefined, '');
    setShowDropdown(false);
    setShowCreateForm(false);
  };

  const handleCreateNew = async () => {
    if (!inputValue.trim() || !onCreateSource) return;

    setCreating(true);
    const newSource = await onCreateSource({
      name: inputValue.trim(),
      category: newCategory,
      url: newUrl.trim() || undefined,
    });
    setCreating(false);

    if (newSource) {
      setInputValue(newSource.name);
      onSelect(newSource.id, newSource.name);
      setShowDropdown(false);
      setShowCreateForm(false);
      setNewUrl('');
      setNewCategory('newsletter');
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="출처 이름 입력 또는 선택..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 선택된 소스 카테고리 표시 */}
      {selectedSourceId && (
        <div className="mt-1">
          {(() => {
            const selected = sources.find((s) => s.id === selectedSourceId);
            if (!selected) return null;
            const { emoji, label } = SOURCE_CATEGORY_LABELS[selected.category];
            return (
              <span className="text-xs text-gray-500">
                {emoji} {label}
                {selected.url && (
                  <>
                    {' · '}
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      링크
                    </a>
                  </>
                )}
              </span>
            );
          })()}
        </div>
      )}

      {/* 드롭다운 */}
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* 필터된 소스 목록 */}
          {filteredSources.map((source) => {
            const { emoji } = SOURCE_CATEGORY_LABELS[source.category];
            const isSelected = source.id === selectedSourceId;
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => handleSelectSource(source)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  isSelected ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span>{emoji}</span>
                <span className="flex-1 truncate">{source.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* 새 출처 추가 옵션 */}
          {inputValue.trim() && !exactMatch && onCreateSource && (
            <>
              {filteredSources.length > 0 && <div className="border-t border-gray-100" />}
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  &quot;{inputValue.trim()}&quot; 새 출처로 추가
                </button>
              ) : (
                <div className="px-3 py-3 space-y-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs font-medium text-gray-600">
                    새 출처: {inputValue.trim()}
                  </p>
                  {/* 카테고리 선택 */}
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SourceCategory)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white focus:outline-none focus:border-gray-400"
                  >
                    {Object.entries(SOURCE_CATEGORY_LABELS).map(([key, { emoji, label }]) => (
                      <option key={key} value={key}>
                        {emoji} {label}
                      </option>
                    ))}
                  </select>
                  {/* URL 입력 (선택) */}
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL (선택사항)"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={creating}
                    className="w-full px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? '추가 중...' : '출처 추가'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* 결과 없음 */}
          {filteredSources.length === 0 && !inputValue.trim() && (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              등록된 출처가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
}
