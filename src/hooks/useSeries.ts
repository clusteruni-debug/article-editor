'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Series,
  SeriesInsert,
  SeriesUpdate,
  SeriesWithArticles,
  SeriesStatus,
} from '@/types/series';

interface SeriesRow {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ArticleInSeriesRow {
  id: string;
  title: string;
  status: string;
  series_order: number | null;
  published_at: string | null;
}

function toSeries(row: SeriesRow): Series {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    cover_image_url: row.cover_image_url ?? undefined,
    status: row.status as SeriesStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useSeries() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 시리즈 생성
  const createSeries = useCallback(
    async (data: SeriesInsert): Promise<Series | null> => {
      setLoading(true);
      setError(null);

      try {
        const insertData = {
          title: data.title,
          description: data.description || null,
          cover_image_url: data.cover_image_url || null,
          status: data.status || 'active',
        };

        const { data: series, error: err } = await supabase
          .from('series')
          .insert(insertData)
          .select()
          .single();

        if (err) throw err;

        return toSeries(series as SeriesRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 생성 실패';
        console.error('[ERROR]', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈 수정
  const updateSeries = useCallback(
    async (id: string, data: SeriesUpdate): Promise<Series | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data: series, error: err } = await supabase
          .from('series')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (err) throw err;

        return toSeries(series as SeriesRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 수정 실패';
        console.error('[ERROR]', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈 목록 조회 (글 포함)
  const getSeriesList = useCallback(async (): Promise<SeriesWithArticles[]> => {
    setLoading(true);
    setError(null);

    try {
      // 시리즈 조회
      const { data: seriesList, error: err } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      // 각 시리즈의 글 조회
      const result: SeriesWithArticles[] = [];

      for (const series of (seriesList as SeriesRow[]) || []) {
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, status, series_order, published_at')
          .eq('series_id', series.id)
          .order('series_order', { ascending: true });

        result.push({
          ...toSeries(series),
          articles: ((articles as ArticleInSeriesRow[]) || []).map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status as 'draft' | 'published',
            series_order: a.series_order || 0,
            published_at: a.published_at ?? undefined,
          })),
          articleCount: articles?.length || 0,
        });
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '시리즈 목록 조회 실패';
      console.error('[ERROR]', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 단일 시리즈 조회
  const getSeries = useCallback(
    async (id: string): Promise<SeriesWithArticles | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data: series, error: err } = await supabase
          .from('series')
          .select('*')
          .eq('id', id)
          .single();

        if (err) throw err;

        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, status, series_order, published_at')
          .eq('series_id', id)
          .order('series_order', { ascending: true });

        return {
          ...toSeries(series as SeriesRow),
          articles: ((articles as ArticleInSeriesRow[]) || []).map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status as 'draft' | 'published',
            series_order: a.series_order || 0,
            published_at: a.published_at ?? undefined,
          })),
          articleCount: articles?.length || 0,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 조회 실패';
        console.error('[ERROR]', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈에 글 추가
  const addArticleToSeries = useCallback(
    async (seriesId: string, articleId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // 현재 시리즈의 최대 순서 조회
        const { data: maxOrder } = await supabase
          .from('articles')
          .select('series_order')
          .eq('series_id', seriesId)
          .order('series_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (maxOrder?.series_order || 0) + 1;

        const { error: err } = await supabase
          .from('articles')
          .update({ series_id: seriesId, series_order: nextOrder })
          .eq('id', articleId);

        if (err) throw err;

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 글 추가 실패';
        console.error('[ERROR]', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈에서 글 제거
  const removeArticleFromSeries = useCallback(
    async (articleId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { error: err } = await supabase
          .from('articles')
          .update({ series_id: null, series_order: null })
          .eq('id', articleId);

        if (err) throw err;

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 글 제거 실패';
        console.error('[ERROR]', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈 글 순서 변경
  const reorderArticles = useCallback(
    async (seriesId: string, articleIds: string[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        for (let i = 0; i < articleIds.length; i++) {
          const { error: err } = await supabase
            .from('articles')
            .update({ series_order: i + 1 })
            .eq('id', articleIds[i]);

          if (err) throw err;
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '순서 변경 실패';
        console.error('[ERROR]', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 시리즈 삭제
  const deleteSeries = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // 먼저 해당 시리즈의 글들에서 시리즈 연결 해제
        await supabase
          .from('articles')
          .update({ series_id: null, series_order: null })
          .eq('series_id', id);

        // 시리즈 삭제
        const { error: err } = await supabase.from('series').delete().eq('id', id);

        if (err) throw err;

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '시리즈 삭제 실패';
        console.error('[ERROR]', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  return {
    loading,
    error,
    createSeries,
    updateSeries,
    getSeriesList,
    getSeries,
    addArticleToSeries,
    removeArticleFromSeries,
    reorderArticles,
    deleteSeries,
  };
}
