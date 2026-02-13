'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Article, ArticleInsert, ArticleUpdate } from '@/types/article';
import { JSONContent } from '@tiptap/react';

// 페이지네이션 파라미터
export interface PaginationParams {
  page: number;           // 1부터 시작
  pageSize: number;       // 페이지당 개수 (기본 10)
  search?: string;        // 검색어 (제목, 내용, 태그)
  tag?: string;           // 태그 필터
  status?: 'draft' | 'published' | null; // 상태 필터 (null = 전체)
  sort?: 'newest' | 'oldest' | 'updated' | 'title'; // 정렬
}

// 페이지네이션 결과
export interface PaginatedResult {
  articles: Article[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

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

      const { data: article, error: err } = await supabase
        .from('articles')
        .insert(insertData)
        .select()
        .single();

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

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

  // 페이지네이션 + 서버사이드 필터링 조회
  const getArticlesPaginated = useCallback(async (params: PaginationParams): Promise<PaginatedResult> => {
    const { page, pageSize, search, tag, status, sort = 'newest' } = params;
    setLoading(true);
    setError(null);

    try {
      // 기본 쿼리: 삭제되지 않은 아티클
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

      // 상태 필터
      if (status) {
        query = query.eq('status', status);
      }

      // 태그 필터 (Supabase의 contains 사용)
      if (tag) {
        query = query.contains('tags', [tag]);
      }

      // 검색어 필터 (제목 or 내용 텍스트)
      if (search?.trim()) {
        const q = search.trim();
        query = query.or(`title.ilike.%${q}%,content_text.ilike.%${q}%`);
      }

      // 정렬
      switch (sort) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'updated':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // 페이지네이션 (range는 0-based)
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: articles, error: err, count } = await query;

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      const totalCount = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return {
        articles: (articles as ArticleRow[] || []).map(toArticle),
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '아티클 목록 조회 실패';
      console.error('[ERROR] 페이지네이션 조회 실패:', message);
      setError(message);
      return { articles: [], totalCount: 0, totalPages: 1, currentPage: 1 };
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 상태별 카운트 조회 (필터 UI용)
  const getStatusCounts = useCallback(async (): Promise<{ total: number; draft: number; published: number }> => {
    try {
      const { count: total } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      const { count: draft } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'draft');

      const { count: published } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'published');

      return {
        total: total ?? 0,
        draft: draft ?? 0,
        published: published ?? 0,
      };
    } catch {
      return { total: 0, draft: 0, published: 0 };
    }
  }, [supabase]);

  // 전체 태그 목록 조회 (필터 UI용, 페이지네이션과 별도)
  const getAllTags = useCallback(async (): Promise<string[]> => {
    try {
      const { data, error: err } = await supabase
        .from('articles')
        .select('tags')
        .is('deleted_at', null)
        .not('tags', 'is', null);

      if (err) throw err;

      const tagSet = new Set<string>();
      (data || []).forEach((row: { tags: string[] | null }) => {
        row.tags?.forEach((t: string) => tagSet.add(t));
      });
      return Array.from(tagSet).sort();
    } catch {
      return [];
    }
  }, [supabase]);

  // 휴지통 목록 조회
  const getDeletedArticles = useCallback(async (): Promise<Article[]> => {
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
    getArticlesPaginated,
    getStatusCounts,
    getAllTags,
    getDeletedArticles,
    deleteArticle,
    restoreArticle,
    permanentlyDeleteArticle,
  };
}
