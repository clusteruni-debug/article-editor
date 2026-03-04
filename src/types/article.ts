import { JSONContent } from '@tiptap/react';

export interface Article {
  id: string;
  title: string;
  content: JSONContent;
  content_text?: string;
  cover_image_url?: string;
  status: 'draft' | 'published';
  tags: string[];
  author_id?: string;
  linked_insight_id?: string;
  series_id?: string;
  series_order?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  deleted_at?: string;
}

export interface ArticleInsert {
  title: string;
  content: JSONContent;
  content_text?: string;
  cover_image_url?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  linked_insight_id?: string;
  series_id?: string;
  series_order?: number;
}

export interface ArticleUpdate {
  title?: string;
  content?: JSONContent;
  content_text?: string;
  cover_image_url?: string;
  status?: 'draft' | 'published';
  published_at?: string;
  tags?: string[];
  linked_insight_id?: string;
  series_id?: string | null;
  series_order?: number;
}
