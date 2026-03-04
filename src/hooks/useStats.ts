'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ArticleStats,
  ArticleStatsInsert,
  ArticleStatsUpdate,
  StatsWithArticle,
  StatsPlatform,
  AggregatedStats,
} from '@/types/stats';

interface StatsRow {
  id: string;
  article_id: string;
  platform: string;
  platform_post_url: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  impressions: number;
  reach: number;
  engagement_rate: number | null;
  recorded_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StatsWithArticleRow extends StatsRow {
  articles: {
    id: string;
    title: string;
    tags: string[] | null;
  } | null;
}

function toStats(row: StatsRow): ArticleStats {
  return {
    id: row.id,
    article_id: row.article_id,
    platform: row.platform as StatsPlatform,
    platform_post_url: row.platform_post_url ?? undefined,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    clicks: row.clicks,
    impressions: row.impressions,
    reach: row.reach,
    engagement_rate: row.engagement_rate ?? undefined,
    recorded_at: row.recorded_at,
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toStatsWithArticle(row: StatsWithArticleRow): StatsWithArticle {
  const stats = toStats(row);
  return {
    ...stats,
    article: row.articles
      ? {
          id: row.articles.id,
          title: row.articles.title,
          tags: row.articles.tags ?? [],
        }
      : undefined,
  };
}

export function useStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 성과 기록 추가
  const addStats = useCallback(
    async (data: ArticleStatsInsert): Promise<ArticleStats | null> => {
      setLoading(true);
      setError(null);

      try {
        // engagement_rate 자동 계산
        let engagementRate = data.engagement_rate;
        if (!engagementRate && data.views && data.views > 0) {
          const interactions = (data.likes || 0) + (data.comments || 0) + (data.shares || 0);
          engagementRate = Math.round((interactions / data.views) * 10000) / 100;
        }

        const insertData = {
          article_id: data.article_id,
          platform: data.platform,
          platform_post_url: data.platform_post_url || null,
          views: data.views || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          saves: data.saves || 0,
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          reach: data.reach || 0,
          engagement_rate: engagementRate || null,
          recorded_at: data.recorded_at || new Date().toISOString().split('T')[0],
          notes: data.notes || null,
        };

        const { data: stats, error: err } = await supabase
          .from('article_stats')
          .upsert(insertData, {
            onConflict: 'article_id,platform,recorded_at',
          })
          .select()
          .single();

        if (err) throw err;

        return toStats(stats as StatsRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '성과 기록 추가 실패';
        console.error('[ERROR]', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 성과 기록 수정
  const updateStats = useCallback(
    async (id: string, data: ArticleStatsUpdate): Promise<ArticleStats | null> => {
      setLoading(true);
      setError(null);

      try {
        const { data: stats, error: err } = await supabase
          .from('article_stats')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (err) throw err;

        return toStats(stats as StatsRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '성과 기록 수정 실패';
        console.error('[ERROR]', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 아티클별 성과 조회
  const getStatsByArticle = useCallback(
    async (articleId: string): Promise<ArticleStats[]> => {
      setLoading(true);
      setError(null);

      try {
        const { data: stats, error: err } = await supabase
          .from('article_stats')
          .select('*')
          .eq('article_id', articleId)
          .order('recorded_at', { ascending: false });

        if (err) throw err;

        return ((stats as StatsRow[]) || []).map(toStats);
      } catch (err) {
        const message = err instanceof Error ? err.message : '성과 조회 실패';
        console.error('[ERROR]', message);
        setError(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 전체 성과 조회 (대시보드용)
  const getAllStats = useCallback(async (): Promise<StatsWithArticle[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data: stats, error: err } = await supabase
        .from('article_stats')
        .select(`
          *,
          articles:article_id (
            id,
            title,
            tags
          )
        `)
        .order('recorded_at', { ascending: false });

      if (err) throw err;

      return ((stats as StatsWithArticleRow[]) || []).map(toStatsWithArticle);
    } catch (err) {
      const message = err instanceof Error ? err.message : '전체 성과 조회 실패';
      console.error('[ERROR]', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 집계 통계 계산
  const getAggregatedStats = useCallback(
    async (): Promise<AggregatedStats> => {
      const allStats = await getAllStats();

      const result: AggregatedStats = {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
        byPlatform: {} as AggregatedStats['byPlatform'],
        byTag: {},
      };

      const platforms: StatsPlatform[] = ['twitter', 'blog', 'instagram', 'thread', 'newsletter'];
      platforms.forEach((p) => {
        result.byPlatform[p] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagementRate: 0,
        };
      });

      let totalEngagement = 0;
      let engagementCount = 0;

      for (const stat of allStats) {
        result.totalViews += stat.views;
        result.totalLikes += stat.likes;
        result.totalComments += stat.comments;
        result.totalShares += stat.shares;

        if (stat.engagement_rate) {
          totalEngagement += stat.engagement_rate;
          engagementCount++;
        }

        // 플랫폼별 집계
        const platform = stat.platform as StatsPlatform;
        if (result.byPlatform[platform]) {
          result.byPlatform[platform].views += stat.views;
          result.byPlatform[platform].likes += stat.likes;
          result.byPlatform[platform].comments += stat.comments;
          result.byPlatform[platform].shares += stat.shares;
        }

        // 태그별 집계
        if (stat.article?.tags) {
          for (const tag of stat.article.tags) {
            if (!result.byTag[tag]) {
              result.byTag[tag] = {
                articleCount: 0,
                totalViews: 0,
                avgEngagement: 0,
              };
            }
            result.byTag[tag].totalViews += stat.views;
            if (stat.engagement_rate) {
              result.byTag[tag].avgEngagement += stat.engagement_rate;
            }
          }
        }
      }

      // 평균 계산
      result.avgEngagementRate =
        engagementCount > 0 ? Math.round((totalEngagement / engagementCount) * 100) / 100 : 0;

      // 플랫폼별 engagement rate 계산
      platforms.forEach((p) => {
        const platformData = result.byPlatform[p];
        if (platformData.views > 0) {
          const interactions = platformData.likes + platformData.comments + platformData.shares;
          platformData.engagementRate =
            Math.round((interactions / platformData.views) * 10000) / 100;
        }
      });

      return result;
    },
    [getAllStats]
  );

  // 성과 삭제
  const deleteStats = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { error: err } = await supabase.from('article_stats').delete().eq('id', id);

        if (err) throw err;

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '성과 삭제 실패';
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
    addStats,
    updateStats,
    getStatsByArticle,
    getAllStats,
    getAggregatedStats,
    deleteStats,
  };
}
