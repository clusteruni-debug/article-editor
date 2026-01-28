'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { JSONContent } from '@tiptap/react';
import { TiptapEditor, TiptapEditorRef } from '@/components/editor/TiptapEditor';
import { TitleInput } from '@/components/editor/TitleInput';
import { TagInput } from '@/components/editor/TagInput';
import { EditorSettings } from '@/components/editor/EditorSettings';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useArticle } from '@/hooks/useArticle';
import { useAutoSave } from '@/hooks/useAutoSave';
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from '@/lib/utils/export';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const editorRef = useRef<TiptapEditorRef>(null);

  const { getArticle, updateArticle, loading, error } = useArticle();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>({ type: 'doc', content: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const extractTextContent = useCallback((json: JSONContent): string => {
    let text = '';
    if (json.content) {
      for (const node of json.content) {
        if (node.type === 'text' && node.text) {
          text += node.text;
        } else if (node.content) {
          text += extractTextContent(node);
        }
        text += ' ';
      }
    }
    return text.trim();
  }, []);

  // 자동 저장 훅
  const { isSaving: isAutoSaving, lastSaved, hasUnsavedChanges, initializeSavedState } = useAutoSave({
    articleId,
    title,
    content,
    contentText: extractTextContent(content),
    onSave: async (data) => {
      const result = await updateArticle(articleId, {
        ...data,
        status: 'draft',
        tags,
      });
      return !!result;
    },
    interval: 30000, // 30초
    enabled: !initialLoading,
  });

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 아티클 로드
  useEffect(() => {
    async function loadArticle() {
      const article = await getArticle(articleId);
      if (article) {
        setTitle(article.title);
        setContent(article.content);
        setTags(article.tags || []);
        initializeSavedState(article.title, article.content);
      }
      setInitialLoading(false);
    }
    loadArticle();
  }, [articleId, getArticle, initializeSavedState]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setSaving(true);

    const article = await updateArticle(articleId, {
      title: title.trim(),
      content,
      content_text: extractTextContent(content),
      status,
      tags,
      published_at: status === 'published' ? new Date().toISOString() : undefined,
    });

    setSaving(false);

    if (article) {
      if (status === 'published') {
        router.push(`/article/${article.id}`);
      } else {
        router.push('/');
      }
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHTML();
    const titleHtml = title ? `<h1>${title}</h1>` : '';
    const fullHtml = titleHtml + html;

    try {
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const plainBlob = new Blob([title + '\n\n' + editorRef.current.getText()], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': plainBlob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const text = title + '\n\n' + editorRef.current.getText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = (format: 'json' | 'md' | 'html') => {
    if (format === 'json') {
      exportAsJSON({ title, content, tags });
    } else if (format === 'md') {
      exportAsMarkdown({ title, content, tags });
    } else if (format === 'html' && editorRef.current) {
      exportAsHTML({ title, html: editorRef.current.getHTML(), tags });
    }
    setShowExportMenu(false);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
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

            {/* 설정 버튼 */}
            <Button
              variant="ghost"
              onClick={() => setShowSettings(true)}
              title="에디터 설정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>

            <Button
              variant="ghost"
              onClick={handleCopy}
            >
              {copied ? (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  복사됨
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  복사
                </span>
              )}
            </Button>

            {/* 내보내기 메뉴 */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  내보내기
                </span>
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => handleExport('md')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    HTML (.html)
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    JSON (.json)
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => handleSave('draft')}
              disabled={saving || loading}
            >
              임시저장
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={saving || loading}
            >
              발행하기
            </Button>
          </div>
        </div>
      </header>

      {/* 에디터 영역 */}
      <main className="max-w-[680px] mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <TitleInput
          value={title}
          onChange={setTitle}
          placeholder="제목"
        />

        <div className="mt-4">
          <TagInput
            tags={tags}
            onChange={setTags}
            placeholder="태그 추가 (Enter로 입력)"
          />
        </div>

        <div className="mt-6">
          <TiptapEditor
            ref={editorRef}
            content={content}
            onUpdate={setContent}
            articleId={articleId}
            title={title}
          />
        </div>

        <p className="mt-8 text-sm text-gray-400">
          이미지를 붙여넣기(Ctrl+V) 하거나 드래그하여 추가할 수 있습니다.
        </p>
      </main>

      {/* 설정 모달 */}
      <EditorSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
