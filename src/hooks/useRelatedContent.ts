'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RelatedArticle {
  id: string;
  title: string;
  tags: string[];
  status: 'draft' | 'published';
  updated_at: string;
  overlapCount: number;
}

interface RelatedInsight {
  id: string;
  keyword: string;
  tags: string[];
  status: string;
  created_at: string;
  overlapCount: number;
}

interface UseRelatedContentResult {
  relatedArticles: RelatedArticle[];
  relatedInsights: RelatedInsight[];
  loading: boolean;
}

export function useRelatedContent(
  tags: string[],
  excludeArticleId?: string
): UseRelatedContentResult {
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [relatedInsights, setRelatedInsights] = useState<RelatedInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchRelated = useCallback(async (currentTags: string[]) => {
    if (currentTags.length === 0) {
      setRelatedArticles([]);
      setRelatedInsights([]);
      return;
    }

    setLoading(true);

    try {
      // Fetch related articles
      let articleQuery = supabase
        .from('articles')
        .select('id, title, tags, status, updated_at')
        .is('deleted_at', null)
        .overlaps('tags', currentTags)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (excludeArticleId) {
        articleQuery = articleQuery.neq('id', excludeArticleId);
      }

      // Fetch related insights
      const insightQuery = supabase
        .from('insights')
        .select('id, keyword, tags, status, created_at')
        .overlaps('tags', currentTags)
        .order('created_at', { ascending: false })
        .limit(10);

      const [articleResult, insightResult] = await Promise.all([
        articleQuery,
        insightQuery,
      ]);

      // Process articles with overlap count
      if (articleResult.data) {
        const articles: RelatedArticle[] = articleResult.data.map((a) => {
          const articleTags = (a.tags as string[]) || [];
          const overlapCount = articleTags.filter((t: string) => currentTags.includes(t)).length;
          return {
            id: a.id as string,
            title: a.title as string,
            tags: articleTags,
            status: a.status as 'draft' | 'published',
            updated_at: a.updated_at as string,
            overlapCount,
          };
        });
        articles.sort((a, b) => b.overlapCount - a.overlapCount);
        setRelatedArticles(articles);
      }

      // Process insights with overlap count
      if (insightResult.data) {
        const insights: RelatedInsight[] = insightResult.data.map((i) => {
          const insightTags = (i.tags as string[]) || [];
          const overlapCount = insightTags.filter((t: string) => currentTags.includes(t)).length;
          return {
            id: i.id as string,
            keyword: i.keyword as string,
            tags: insightTags,
            status: i.status as string,
            created_at: i.created_at as string,
            overlapCount,
          };
        });
        insights.sort((a, b) => b.overlapCount - a.overlapCount);
        setRelatedInsights(insights);
      }
    } catch (err) {
      console.error('[ERROR] useRelatedContent:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, excludeArticleId]);

  const tagsKey = tags.join(',');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchRelated(tags);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey, fetchRelated]);

  return { relatedArticles, relatedInsights, loading };
}
