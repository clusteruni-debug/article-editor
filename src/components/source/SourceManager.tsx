'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Source,
  SourceInsert,
  SourceUpdate,
  SourceCategory,
  SourceStats,
  SOURCE_CATEGORIES,
  SOURCE_CATEGORY_LABELS,
} from '@/types/source';

interface SourceManagerProps {
  onClose: () => void;
  sources: SourceStats[];
  onCreateSource: (data: SourceInsert) => Promise<Source | null>;
  onUpdateSource: (id: string, data: SourceUpdate) => Promise<Source | null>;
  onDeleteSource: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export function SourceManager({
  onClose,
  sources,
  onCreateSource,
  onUpdateSource,
  onDeleteSource,
  onRefresh,
}: SourceManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingSource, setEditingSource] = useState<SourceStats | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 폼 상태
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<SourceCategory>('newsletter');

  // 편집 모드 진입 시 폼 채우기
  useEffect(() => {
    if (editingSource) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormName(editingSource.name);
      setFormUrl(editingSource.url || '');
      setFormDescription(editingSource.description || '');
      setFormCategory(editingSource.category);
    }
  }, [editingSource]);

  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormDescription('');
    setFormCategory('newsletter');
    setEditingSource(null);
    setViewMode('list');
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setFormLoading(true);

    const result = await onCreateSource({
      name: formName.trim(),
      url: formUrl.trim() || undefined,
      description: formDescription.trim() || undefined,
      category: formCategory,
    });

    setFormLoading(false);
    if (result) {
      resetForm();
      onRefresh();
    }
  };

  const handleUpdate = async () => {
    if (!editingSource || !formName.trim()) return;
    setFormLoading(true);

    const result = await onUpdateSource(editingSource.id, {
      name: formName.trim(),
      url: formUrl.trim() || undefined,
      description: formDescription.trim() || undefined,
      category: formCategory,
    });

    setFormLoading(false);
    if (result) {
      resetForm();
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await onDeleteSource(id);
    if (success) {
      setDeleteConfirmId(null);
      onRefresh();
    }
  };

  const startEdit = (source: SourceStats) => {
    setEditingSource(source);
    setViewMode('edit');
  };

  const startCreate = () => {
    resetForm();
    setViewMode('create');
  };

  // 폼 렌더링 (생성/편집 공용)
  const renderForm = () => (
    <div className="px-6 py-4 space-y-4">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
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
                onClick={() => setFormCategory(cat)}
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
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="출처에 대한 간단한 설명..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {viewMode !== 'list' && (
              <button
                type="button"
                onClick={resetForm}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {viewMode === 'list' && '출처 관리'}
              {viewMode === 'create' && '새 출처 추가'}
              {viewMode === 'edit' && '출처 편집'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 목록 뷰 */}
        {viewMode === 'list' && (
          <>
            <div className="px-6 py-4">
              {sources.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="mb-2">등록된 출처가 없습니다</p>
                  <p className="text-sm">출처를 추가하여 인사이트를 체계적으로 관리하세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sources.map((source) => {
                    const { emoji, label } = SOURCE_CATEGORY_LABELS[source.category];
                    return (
                      <div
                        key={source.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
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
                            onClick={() => startEdit(source)}
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
                                onClick={() => handleDelete(source.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(source.id)}
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
                  })}
                </div>
              )}
            </div>

            {/* 푸터: 새 출처 추가 버튼 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between">
              <Button type="button" variant="secondary" onClick={onClose}>
                닫기
              </Button>
              <Button type="button" onClick={startCreate}>
                새 출처 추가
              </Button>
            </div>
          </>
        )}

        {/* 생성 뷰 */}
        {viewMode === 'create' && (
          <>
            {renderForm()}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={resetForm} disabled={formLoading}>
                취소
              </Button>
              <Button type="button" onClick={handleCreate} disabled={!formName.trim() || formLoading}>
                {formLoading ? '추가 중...' : '추가'}
              </Button>
            </div>
          </>
        )}

        {/* 편집 뷰 */}
        {viewMode === 'edit' && (
          <>
            {renderForm()}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={resetForm} disabled={formLoading}>
                취소
              </Button>
              <Button type="button" onClick={handleUpdate} disabled={!formName.trim() || formLoading}>
                {formLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
