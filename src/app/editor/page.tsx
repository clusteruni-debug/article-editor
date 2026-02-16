'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { nanoid } from 'nanoid';
import { JSONContent } from '@tiptap/react';
import { TiptapEditor, TiptapEditorRef } from '@/components/editor/TiptapEditor';
import { TitleInput } from '@/components/editor/TitleInput';
import { TagInput } from '@/components/editor/TagInput';
import { SpellChecker } from '@/components/editor/SpellChecker';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useArticle } from '@/hooks/useArticle';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useInsight } from '@/hooks/useInsight';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from '@/lib/utils/export';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createArticle, updateArticle, loading, error } = useArticle();
  const { linkArticle } = useInsight();
  const { success: showSuccess, error: showError } = useToast();
  const editorRef = useRef<TiptapEditorRef>(null);

  // URL 파라미터에서 인사이트 정보 추출
  const linkedInsightId = searchParams.get('insightId');
  const insightKeyword = searchParams.get('keyword');
  const insightSummary = searchParams.get('summary');

  // AI 생성 콘텐츠
  const aiTitle = searchParams.get('aiTitle');
  const aiContent = searchParams.get('aiContent');
  const aiTags = searchParams.get('aiTags');

  const [articleId] = useState(() => nanoid());
  const [savedArticleId, setSavedArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<JSONContent>({ type: 'doc', content: [] });
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // 마크다운을 간단한 HTML로 변환
  function markdownToHtml(md: string): string {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gim, '<p>$1</p>')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h(\d)><\/p>/g, '</h$1>');
  }

  function extractTextContent(json: JSONContent): string {
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
  }

  // 인사이트/AI에서 시작한 경우 초기화
  useEffect(() => {
    // AI 생성 콘텐츠가 있으면 우선 사용
    if (aiTitle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(aiTitle);
    } else if (insightKeyword && !title) {
      setTitle(insightKeyword);
    }

    // AI 생성 본문
    if (aiContent && editorRef.current) {
      // 마크다운을 HTML로 변환 후 에디터에 삽입
      const htmlContent = markdownToHtml(aiContent);
      editorRef.current.setContent(htmlContent);
    }

    // AI 생성 태그
    if (aiTags) {
      setTags(aiTags.split(',').filter(Boolean));
    }
  }, [aiTitle, aiContent, aiTags, insightKeyword, title]);

  // 변경사항 있는지 확인 (제목이나 내용이 있으면 변경된 것으로 간주)
  const hasContent = useMemo(() => {
    return title.trim().length > 0 || (content.content && content.content.length > 0);
  }, [title, content]);

  // 자동 저장 훅
  const { isSaving: isAutoSaving, lastSaved, hasUnsavedChanges, initializeSavedState } = useAutoSave({
    articleId: savedArticleId,
    title,
    content,
    contentText: extractTextContent(content),
    onSave: async (data) => {
      if (savedArticleId) {
        // 이미 생성된 아티클 업데이트
        const result = await updateArticle(savedArticleId, {
          ...data,
          status: 'draft',
        });
        return !!result;
      } else {
        // 새 아티클 생성 (첫 자동 저장)
        const result = await createArticle({
          ...data,
          status: 'draft',
        });
        if (result) {
          setSavedArticleId(result.id);
          initializeSavedState(data.title, data.content);
          return true;
        }
        return false;
      }
    },
    interval: 30000, // 30초
    enabled: title.trim().length > 0, // 제목이 있을 때만 자동 저장
  });

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 저장되지 않은 변경사항이 있고, 내용이 있을 때만 경고
      if (hasContent && !savedArticleId) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
      // 자동 저장 후에도 추가 변경사항이 있으면 경고
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasContent, savedArticleId, hasUnsavedChanges]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      showError('제목을 입력해주세요');
      return;
    }

    setSaving(true);

    let article;
    if (savedArticleId) {
      // 이미 자동 저장으로 생성된 경우 업데이트
      article = await updateArticle(savedArticleId, {
        title: title.trim(),
        content,
        content_text: extractTextContent(content),
        status,
        tags,
        published_at: status === 'published' ? new Date().toISOString() : undefined,
        linked_insight_id: linkedInsightId || undefined,
      });
    } else {
      // 새로 생성
      article = await createArticle({
        title: title.trim(),
        content,
        content_text: extractTextContent(content),
        status,
        tags,
        linked_insight_id: linkedInsightId || undefined,
      });
    }

    setSaving(false);

    if (article) {
      // 인사이트와 연결
      if (linkedInsightId) {
        await linkArticle(linkedInsightId, article.id);
      }

      if (status === 'published') {
        showSuccess('글이 발행되었습니다');
        router.push(`/article/${article.id}`);
      } else {
        showSuccess('임시저장 되었습니다');
        router.push('/');
      }
    } else {
      showError('저장에 실패했습니다');
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHTML();
    const titleHtml = title ? `<h1>${title}</h1>` : '';
    const fullHtml = titleHtml + html;

    try {
      // 서식이 유지되는 HTML로 복사
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const plainBlob = new Blob([title + '\n\n' + editorRef.current.getText()], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': plainBlob,
        }),
      ]);

      showSuccess('클립보드에 복사되었습니다');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 폴백: 일반 텍스트로 복사
      const text = title + '\n\n' + editorRef.current.getText();
      await navigator.clipboard.writeText(text);
      showSuccess('클립보드에 복사되었습니다');
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

  // 키보드 단축키
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: () => handleSave('draft'),
      description: '임시저장',
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      handler: () => handleSave('published'),
      description: '발행',
    },
    {
      key: ',',
      ctrl: true,
      handler: () => editorRef.current?.toggleSettings(),
      description: '설정',
    },
    {
      key: 'Escape',
      handler: () => {
        if (showExportMenu) {
          setShowExportMenu(false);
        }
      },
      description: '메뉴 닫기',
    },
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
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
              onClick={handleCopy}
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
            <div className="relative hidden sm:block">
              <Button
                variant="ghost"
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="내보내기"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden md:inline">내보내기</span>
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
              <span className="hidden sm:inline">임시저장</span>
              <span className="sm:hidden">저장</span>
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={saving || loading}
            >
              <span className="hidden sm:inline">발행하기</span>
              <span className="sm:hidden">발행</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 에디터 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 인사이트 연결 표시 */}
        {linkedInsightId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>인사이트에서 시작됨</span>
              <Link href="/insights" className="ml-auto text-blue-600 hover:underline">
                인사이트 보기
              </Link>
            </div>
            {insightSummary && (
              <p className="mt-2 text-sm text-blue-600 line-clamp-2">{insightSummary}</p>
            )}
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

    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
