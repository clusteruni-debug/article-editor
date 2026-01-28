'use client';

import { Editor } from '@tiptap/react';
import { useMemo } from 'react';

interface EditorStatsProps {
  editor: Editor | null;
  title: string;
}

export function EditorStats({ editor, title }: EditorStatsProps) {
  const stats = useMemo(() => {
    if (!editor) {
      return { charCount: 0, wordCount: 0, readingTime: 0 };
    }

    const text = editor.getText();
    const titleText = title || '';
    const fullText = titleText + ' ' + text;

    // 글자 수 (공백 제외)
    const charCount = fullText.replace(/\s/g, '').length;

    // 단어 수 (한글 + 영어)
    const koreanWords = (fullText.match(/[가-힣]+/g) || []).length;
    const englishWords = (fullText.match(/[a-zA-Z]+/g) || []).length;
    const wordCount = koreanWords + englishWords;

    // 읽기 시간 (분) - 한국어 기준 분당 500자, 영어 기준 분당 200단어
    // 혼합 텍스트이므로 글자 수 기준으로 계산 (분당 400자)
    const readingTime = Math.max(1, Math.ceil(charCount / 400));

    return { charCount, wordCount, readingTime };
  }, [editor, title, editor?.getText()]);

  return (
    <div className="flex items-center gap-4 text-sm text-gray-400 py-4 border-t border-gray-100">
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{stats.charCount.toLocaleString()}자</span>
      </div>

      <div className="w-px h-4 bg-gray-200" />

      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>약 {stats.readingTime}분</span>
      </div>
    </div>
  );
}
