'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Article, ArticleInsert, ArticleUpdate } from '@/types/article';
import { JSONContent } from '@tiptap/react';

interface ArticleRow {
  id: string;
  title: string;
  content: unknown;
  content_text: string | null;
  cover_image_url: string | null;
  status: string;
  tags: string[] | null;
  author_id: string | null;
  linked_insight_id: string | null;
  series_id: string | null;
  series_order: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted_at: string | null;
}

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content as JSONContent,
    content_text: row.content_text ?? undefined,
    cover_image_url: row.cover_image_url ?? undefined,
    status: row.status as 'draft' | 'published',
    tags: row.tags ?? [],
    author_id: row.author_id ?? undefined,
    linked_insight_id: row.linked_insight_id ?? undefined,
    series_id: row.series_id ?? undefined,
    series_order: row.series_order ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at ?? undefined,
    deleted_at: row.deleted_at ?? undefined,
  };
}

export function useArticle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const createArticle = useCallback(async (data: ArticleInsert): Promise<Article | null> => {
    console.log('[INFO] 아티클 생성 시작:', { title: data.title, status: data.status });
    setLoading(true);
    setError(null);

    try {
      const insertData = {
        title: data.title,
        content: data.content,
        content_text: data.content_text || null,
        cover_image_url: data.cover_image_url || null,
        status: data.status || 'draft',
        tags: data.tags || [],
        linked_insight_id: data.linked_insight_id || null,
        series_id: data.series_id || null,
        series_order: data.series_order || null,
      };

      console.log('[INFO] Supabase insert 요청:', insertData);

      const { data: article, error: err } = await supabase
        .from('articles')
        .insert(insertData)
        .select()
        .single();

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 생성 완료:', article);
      return toArticle(article as ArticleRow);
    } catch (err) {
      const message = err instanceof Error ? err.message : '아티클 생성 실패';
      console.error('[ERROR] 아티클 생성 실패:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateArticle = useCallback(async (id: string, data: ArticleUpdate): Promise<Article | null> => {
    console.log('[INFO] 아티클 수정 시작:', { id, ...data });
    setLoading(true);
    setError(null);

    try {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.content_text !== undefined) updateData.content_text = data.content_text;
      if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.published_at !== undefined) updateData.published_at = data.published_at;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.linked_insight_id !== undefined) updateData.linked_insight_id = data.linked_insight_id;
      if (data.series_id !== undefined) updateData.series_id = data.series_id;
      if (data.series_order !== undefined) updateData.series_order = data.series_order;

      const { data: article, error: err } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 수정 완료:', article);
      return toArticle(article as ArticleRow);
    } catch (err) {
      const message = err instanceof Error ? err.message : '아티클 수정 실패';
      console.error('[ERROR] 아티클 수정 실패:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getArticle = useCallback(async (id: string): Promise<Article | null> => {
    console.log('[INFO] 아티클 조회:', id);
    setLoading(true);
    setError(null);

    try {
      const { data: article, error: err } = await supabase
        .from('articles')
        .select()
        .eq('id', id)
        .single();

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 조회 완료');
      return toArticle(article as ArticleRow);
    } catch (err) {
      const message = err instanceof Error ? err.message : '아티클 조회 실패';
      console.error('[ERROR] 아티클 조회 실패:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getArticles = useCallback(async (): Promise<Article[]> => {
    console.log('[INFO] 아티클 목록 조회');
    setLoading(true);
    setError(null);

    try {
      const { data: articles, error: err } = await supabase
        .from('articles')
        .select()
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 목록 조회 완료:', articles?.length || 0, '개');
      return (articles as ArticleRow[] || []).map(toArticle);
    } catch (err) {
      const message = err instanceof Error ? err.message : '아티클 목록 조회 실패';
      console.error('[ERROR] 아티클 목록 조회 실패:', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 휴지통 목록 조회
  const getDeletedArticles = useCallback(async (): Promise<Article[]> => {
    console.log('[INFO] 휴지통 목록 조회');
    setLoading(true);
    setError(null);

    try {
      const { data: articles, error: err } = await supabase
        .from('articles')
        .select()
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 휴지통 목록 조회 완료:', articles?.length || 0, '개');
      return (articles as ArticleRow[] || []).map(toArticle);
    } catch (err) {
      const message = err instanceof Error ? err.message : '휴지통 조회 실패';
      console.error('[ERROR] 휴지통 조회 실패:', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 휴지통으로 이동 (soft delete)
  const deleteArticle = useCallback(async (id: string): Promise<boolean> => {
    console.log('[INFO] 아티클 휴지통 이동:', id);
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('articles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 휴지통 이동 완료');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제 실패';
      console.error('[ERROR] 아티클 삭제 실패:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 휴지통에서 복원
  const restoreArticle = useCallback(async (id: string): Promise<boolean> => {
    console.log('[INFO] 아티클 복원:', id);
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('articles')
        .update({ deleted_at: null })
        .eq('id', id);

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 복원 완료');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '복원 실패';
      console.error('[ERROR] 아티클 복원 실패:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 영구 삭제
  const permanentlyDeleteArticle = useCallback(async (id: string): Promise<boolean> => {
    console.log('[INFO] 아티클 영구 삭제:', id);
    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      console.log('[SUCCESS] 아티클 영구 삭제 완료');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '영구 삭제 실패';
      console.error('[ERROR] 아티클 영구 삭제 실패:', message);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    loading,
    error,
    createArticle,
    updateArticle,
    getArticle,
    getArticles,
    getDeletedArticles,
    deleteArticle,
    restoreArticle,
    permanentlyDeleteArticle,
  };
}
