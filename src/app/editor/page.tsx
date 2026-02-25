'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { JSONContent } from '@tiptap/react';
import { TiptapEditor, TiptapEditorRef } from '@/components/editor/TiptapEditor';
import { TitleInput } from '@/components/editor/TitleInput';
import { TagInput } from '@/components/editor/TagInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useArticle } from '@/hooks/useArticle';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useInsight } from '@/hooks/useInsight';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { exportAsJSON, exportAsMarkdown, exportAsHTML } from '@/lib/utils/export';
import { EditorHeader, EditorInsightBanner } from './components';

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
    if (aiTitle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(aiTitle);
    } else if (insightKeyword && !title) {
      setTitle(insightKeyword);
    }

    if (aiContent && editorRef.current) {
      const htmlContent = markdownToHtml(aiContent);
      editorRef.current.setContent(htmlContent);
    }

    if (aiTags) {
      setTags(aiTags.split(',').filter(Boolean));
    }
  }, [aiTitle, aiContent, aiTags, insightKeyword, title]);

  // 변경사항 있는지 확인
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
        const result = await updateArticle(savedArticleId, {
          ...data,
          status: 'draft',
        });
        return !!result;
      } else {
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
    interval: 30000,
    enabled: title.trim().length > 0,
  });

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasContent && !savedArticleId) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
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
      <EditorHeader
        onClose={() => router.push('/')}
        isAutoSaving={isAutoSaving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        loading={loading}
        editorRef={editorRef}
        copied={copied}
        onCopy={handleCopy}
        onSaveDraft={() => handleSave('draft')}
        onPublish={() => handleSave('published')}
        onExport={handleExport}
        showExportMenu={showExportMenu}
        onToggleExportMenu={() => setShowExportMenu(!showExportMenu)}
      />

      {/* 에디터 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {linkedInsightId && (
          <EditorInsightBanner
            linkedInsightId={linkedInsightId}
            insightSummary={insightSummary}
          />
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
