'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Insight,
  InsightInsert,
  InsightUpdate,
  InsightWithArticle,
  ActionType,
  InsightStatus,
  Platform,
} from '@/types/insight';

interface InsightRow {
  id: string;
  keyword: string;
  summary: string | null;
  source: string | null;
  insight_date: string;
  action_type: string;
  status: string;
  linked_article_id: string | null;
  platforms_published: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface InsightWithArticleRow extends InsightRow {
  articles: {
    id: string;
    title: string;
    status: string;
  } | null;
}

function toInsight(row: InsightRow): Insight {
  return {
    id: row.id,
    keyword: row.keyword,
    summary: row.summary ?? undefined,
    source: row.source ?? undefined,
    insight_date: row.insight_date,
    action_type: row.action_type as ActionType,
    status: row.status as InsightStatus,
    linked_article_id: row.linked_article_id ?? undefined,
    platforms_published: (row.platforms_published ?? []) as Platform[],
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toInsightWithArticle(row: InsightWithArticleRow): InsightWithArticle {
  const insight = toInsight(row);
  return {
    ...insight,
    article: row.articles
      ? {
          id: row.articles.id,
          title: row.articles.title,
          status: row.articles.status as 'draft' | 'published',
        }
      : undefined,
  };
}

export function useInsight() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const createInsight = useCallback(
    async (data: InsightInsert): Promise<Insight | null> => {
      console.log('[INFO] 인사이트 생성 시작:', data);
      setLoading(true);
      setError(null);

      try {
        const insertData = {
          keyword: data.keyword,
          summary: data.summary || null,
          source: data.source || null,
          insight_date: data.insight_date || new Date().toISOString().split('T')[0],
          action_type: data.action_type || 'observe',
          status: data.status || 'unread',
          linked_article_id: data.linked_article_id || null,
          platforms_published: data.platforms_published || [],
          notes: data.notes || null,
        };

        const { data: insight, error: err } = await supabase
          .from('insights')
          .insert(insertData)
          .select()
          .single();

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        console.log('[SUCCESS] 인사이트 생성 완료:', insight);
        return toInsight(insight as InsightRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '인사이트 생성 실패';
        console.error('[ERROR] 인사이트 생성 실패:', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const updateInsight = useCallback(
    async (id: string, data: InsightUpdate): Promise<Insight | null> => {
      console.log('[INFO] 인사이트 수정 시작:', { id, ...data });
      setLoading(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {};
        if (data.keyword !== undefined) updateData.keyword = data.keyword;
        if (data.summary !== undefined) updateData.summary = data.summary;
        if (data.source !== undefined) updateData.source = data.source;
        if (data.insight_date !== undefined) updateData.insight_date = data.insight_date;
        if (data.action_type !== undefined) updateData.action_type = data.action_type;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.linked_article_id !== undefined)
          updateData.linked_article_id = data.linked_article_id;
        if (data.platforms_published !== undefined)
          updateData.platforms_published = data.platforms_published;
        if (data.notes !== undefined) updateData.notes = data.notes;

        const { data: insight, error: err } = await supabase
          .from('insights')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        console.log('[SUCCESS] 인사이트 수정 완료:', insight);
        return toInsight(insight as InsightRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '인사이트 수정 실패';
        console.error('[ERROR] 인사이트 수정 실패:', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const getInsight = useCallback(
    async (id: string): Promise<InsightWithArticle | null> => {
      console.log('[INFO] 인사이트 조회:', id);
      setLoading(true);
      setError(null);

      try {
        const { data: insight, error: err } = await supabase
          .from('insights')
          .select(
            `
            *,
            articles:linked_article_id (
              id,
              title,
              status
            )
          `
          )
          .eq('id', id)
          .single();

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        console.log('[SUCCESS] 인사이트 조회 완료');
        return toInsightWithArticle(insight as InsightWithArticleRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '인사이트 조회 실패';
        console.error('[ERROR] 인사이트 조회 실패:', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const getInsights = useCallback(
    async (options?: {
      status?: InsightStatus;
      action_type?: ActionType;
      search?: string;
    }): Promise<InsightWithArticle[]> => {
      console.log('[INFO] 인사이트 목록 조회', options);
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('insights')
          .select(
            `
            *,
            articles:linked_article_id (
              id,
              title,
              status
            )
          `
          )
          .order('insight_date', { ascending: false });

        if (options?.status) {
          query = query.eq('status', options.status);
        }
        if (options?.action_type) {
          query = query.eq('action_type', options.action_type);
        }
        if (options?.search) {
          query = query.or(
            `keyword.ilike.%${options.search}%,summary.ilike.%${options.search}%`
          );
        }

        const { data: insights, error: err } = await query;

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        console.log('[SUCCESS] 인사이트 목록 조회 완료:', insights?.length || 0, '개');
        return ((insights as InsightWithArticleRow[]) || []).map(toInsightWithArticle);
      } catch (err) {
        const message = err instanceof Error ? err.message : '인사이트 목록 조회 실패';
        console.error('[ERROR] 인사이트 목록 조회 실패:', message);
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const deleteInsight = useCallback(
    async (id: string): Promise<boolean> => {
      console.log('[INFO] 인사이트 삭제:', id);
      setLoading(true);
      setError(null);

      try {
        const { error: err } = await supabase.from('insights').delete().eq('id', id);

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        console.log('[SUCCESS] 인사이트 삭제 완료');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '인사이트 삭제 실패';
        console.error('[ERROR] 인사이트 삭제 실패:', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const linkArticle = useCallback(
    async (insightId: string, articleId: string): Promise<boolean> => {
      console.log('[INFO] 아티클 연결:', { insightId, articleId });
      setLoading(true);
      setError(null);

      try {
        // 인사이트에 아티클 연결
        const { error: err1 } = await supabase
          .from('insights')
          .update({ linked_article_id: articleId, status: 'drafted' })
          .eq('id', insightId);

        if (err1) throw err1;

        // 아티클에도 인사이트 역참조 저장
        const { error: err2 } = await supabase
          .from('articles')
          .update({ linked_insight_id: insightId })
          .eq('id', articleId);

        if (err2) throw err2;

        console.log('[SUCCESS] 아티클 연결 완료');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '아티클 연결 실패';
        console.error('[ERROR] 아티클 연결 실패:', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const updateStatus = useCallback(
    async (id: string, status: InsightStatus): Promise<boolean> => {
      console.log('[INFO] 인사이트 상태 변경:', { id, status });
      const result = await updateInsight(id, { status });
      return result !== null;
    },
    [updateInsight]
  );

  const addPlatform = useCallback(
    async (id: string, platform: Platform): Promise<boolean> => {
      console.log('[INFO] 플랫폼 추가:', { id, platform });
      setLoading(true);
      setError(null);

      try {
        // 먼저 현재 platforms_published 조회
        const { data: insight, error: fetchErr } = await supabase
          .from('insights')
          .select('platforms_published')
          .eq('id', id)
          .single();

        if (fetchErr) throw fetchErr;

        const currentPlatforms = (insight?.platforms_published as Platform[]) || [];
        if (currentPlatforms.includes(platform)) {
          console.log('[INFO] 이미 추가된 플랫폼:', platform);
          return true;
        }

        const { error: updateErr } = await supabase
          .from('insights')
          .update({ platforms_published: [...currentPlatforms, platform] })
          .eq('id', id);

        if (updateErr) throw updateErr;

        console.log('[SUCCESS] 플랫폼 추가 완료');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '플랫폼 추가 실패';
        console.error('[ERROR] 플랫폼 추가 실패:', message);
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
    createInsight,
    updateInsight,
    getInsight,
    getInsights,
    deleteInsight,
    linkArticle,
    updateStatus,
    addPlatform,
  };
}
