'use client';

import { TiptapEditorRef } from '@/components/editor/TiptapEditor';
import { SpellChecker } from '@/components/editor/SpellChecker';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ExportMenu } from './ExportMenu';

interface EditorHeaderProps {
  onClose: () => void;
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saving: boolean;
  loading: boolean;
  editorRef: React.RefObject<TiptapEditorRef | null>;
  copied: boolean;
  onCopy: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onExport: (format: 'json' | 'md' | 'html') => void;
  showExportMenu: boolean;
  onToggleExportMenu: () => void;
}

export function EditorHeader({
  onClose,
  isAutoSaving,
  lastSaved,
  hasUnsavedChanges,
  saving,
  loading,
  editorRef,
  copied,
  onCopy,
  onSaveDraft,
  onPublish,
  onExport,
  showExportMenu,
  onToggleExportMenu,
}: EditorHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* 자동 저장 상태 표시 */}
          {isAutoSaving ? (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <LoadingSpinner size="sm" />
              저장 중...
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-gray-400">
              {hasUnsavedChanges ? '저장되지 않은 변경' : `저장됨 ${lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          ) : null}

          {(saving || loading) && <LoadingSpinner size="sm" />}

          {/* 맞춤법 검사 */}
          <SpellChecker
            getText={() => editorRef.current?.getText() || ''}
            onReplace={(original, replacement) => {
              if (editorRef.current) {
                const html = editorRef.current.getHTML();
                const newHtml = html.replace(new RegExp(original, 'g'), replacement);
                editorRef.current.setContent(newHtml);
              }
            }}
          />

          <Button
            variant="ghost"
            onClick={onCopy}
            title="복사"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">복사됨</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">복사</span>
              </span>
            )}
          </Button>

          {/* 내보내기 메뉴 */}
          <ExportMenu
            showMenu={showExportMenu}
            onToggleMenu={onToggleExportMenu}
            onExport={onExport}
          />

          <Button
            variant="secondary"
            onClick={onSaveDraft}
            disabled={saving || loading}
          >
            <span className="hidden sm:inline">임시저장</span>
            <span className="sm:hidden">저장</span>
          </Button>
          <Button
            onClick={onPublish}
            disabled={saving || loading}
          >
            <span className="hidden sm:inline">발행하기</span>
            <span className="sm:hidden">발행</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
