'use client';

import { generateHTML } from '@tiptap/react';
import { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { useMemo } from 'react';

interface ArticleViewerProps {
  content: JSONContent;
}

export function ArticleViewer({ content }: ArticleViewerProps) {
  const html = useMemo(() => {
    return generateHTML(content, [
      StarterKit,
      Image,
      Underline,
    ]);
  }, [content]);

  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
