'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Source,
  SourceInsert,
  SourceUpdate,
  SourceCategory,
  SourceStats,
} from '@/types/source';
import { SourceCard } from './SourceCard';
import { SourceForm } from './SourceForm';

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
                  {sources.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      deleteConfirmId={deleteConfirmId}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onDeleteConfirm={setDeleteConfirmId}
                    />
                  ))}
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
            <SourceForm
              formName={formName}
              formUrl={formUrl}
              formDescription={formDescription}
              formCategory={formCategory}
              onNameChange={setFormName}
              onUrlChange={setFormUrl}
              onDescriptionChange={setFormDescription}
              onCategoryChange={setFormCategory}
            />
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
            <SourceForm
              formName={formName}
              formUrl={formUrl}
              formDescription={formDescription}
              formCategory={formCategory}
              onNameChange={setFormName}
              onUrlChange={setFormUrl}
              onDescriptionChange={setFormDescription}
              onCategoryChange={setFormCategory}
            />
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
