import { JSONContent } from '@tiptap/react';

export interface ArticleVersion {
  id: string;
  article_id: string;
  title: string;
  content: JSONContent;
  content_text?: string;
  version_number: number;
  created_at: string;
}

export interface ArticleVersionInsert {
  article_id: string;
  title: string;
  content: JSONContent;
  content_text?: string;
  version_number: number;
}
