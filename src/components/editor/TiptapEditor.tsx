'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { editorExtensions } from '@/lib/tiptap/extensions';
import { ImageUploadExtension, ImageUploadFn } from '@/lib/tiptap/imageUploadPlugin';
import { EditorToolbar } from './EditorToolbar';
import { EditorStats } from './EditorStats';
import { uploadImage } from '@/lib/supabase/storage';

interface TiptapEditorProps {
  content?: JSONContent;
  onUpdate: (content: JSONContent) => void;
  articleId: string;
  title?: string;
}

export interface TiptapEditorRef {
  getHTML: () => string;
  getText: () => string;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ content, onUpdate, articleId, title = '' }, ref) => {
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload: ImageUploadFn = useCallback(
      async (file: File) => {
        console.log('[INFO] TiptapEditor: 이미지 업로드 요청', file.name);
        setUploadError(null);
        setIsUploading(true);

        try {
          const url = await uploadImage(file, articleId);
          console.log('[SUCCESS] TiptapEditor: 이미지 업로드 성공', url);
          return url;
        } catch (error) {
          const message = error instanceof Error ? error.message : '이미지 업로드 실패';
          console.error('[ERROR] TiptapEditor: 이미지 업로드 실패', message);
          setUploadError(message);
          throw error;
        } finally {
          setIsUploading(false);
        }
      },
      [articleId]
    );

    const editor = useEditor({
      extensions: [...editorExtensions, ImageUploadExtension(handleImageUpload)],
      content,
      onUpdate: ({ editor }) => {
        onUpdate(editor.getJSON());
      },
      editorProps: {
        attributes: {
          class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
        },
      },
      immediatelyRender: false,
    });

    // ref로 메서드 노출
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || '',
      getText: () => editor?.getText() || '',
    }), [editor]);

    // 기존 글 로드 시 콘텐츠 설정 (한 번만)
    const [contentLoaded, setContentLoaded] = useState(false);
    const prevContentRef = useRef<string>('');

    useEffect(() => {
      if (editor && content) {
        const contentStr = JSON.stringify(content);

        // 외부에서 새 콘텐츠가 로드된 경우 (기존 글 편집)
        if (!contentLoaded && content.content && content.content.length > 0) {
          const hasRealContent = content.content.some(
            (node: { type?: string; content?: unknown[] }) =>
              node.type !== 'paragraph' || (node.content && node.content.length > 0)
          );

          if (hasRealContent && contentStr !== prevContentRef.current) {
            editor.commands.setContent(content);
            prevContentRef.current = contentStr;
            setContentLoaded(true);
          }
        }
      }
    }, [editor, content, contentLoaded]);

    return (
      <div className="article-editor">
        <EditorToolbar editor={editor} />

        {isUploading && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            이미지 업로드 중...
          </div>
        )}

        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {uploadError}
          </div>
        )}

        <EditorContent editor={editor} />

        <EditorStats editor={editor} title={title} />
      </div>
    );
  }
);

TiptapEditor.displayName = 'TiptapEditor';
