'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArticleVersion, ArticleVersionInsert } from '@/types/version';
import { JSONContent } from '@tiptap/react';

export function useVersion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 버전 목록 가져오기
  const getVersions = useCallback(async (articleId: string): Promise<ArticleVersion[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', articleId)
        .order('version_number', { ascending: false });

      if (fetchError) {
        // 테이블이 없는 경우 빈 배열 반환
        if (fetchError.code === '42P01') {
          return [];
        }
        throw fetchError;
      }

      return (data || []) as ArticleVersion[];
    } catch (err) {
      const message = err instanceof Error ? err.message : '버전 목록을 불러오는데 실패했습니다';
      setError(message);
      console.error('버전 목록 조회 오류:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 새 버전 저장
  const saveVersion = useCallback(async (
    articleId: string,
    title: string,
    content: JSONContent,
    contentText?: string
  ): Promise<ArticleVersion | null> => {
    setLoading(true);
    setError(null);

    try {
      // 현재 최신 버전 번호 조회
      const { data: latestVersion } = await supabase
        .from('article_versions')
        .select('version_number')
        .eq('article_id', articleId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = (latestVersion?.version_number || 0) + 1;

      const versionData: ArticleVersionInsert = {
        article_id: articleId,
        title,
        content,
        content_text: contentText,
        version_number: newVersionNumber,
      };

      const { data, error: insertError } = await supabase
        .from('article_versions')
        .insert(versionData)
        .select()
        .single();

      if (insertError) {
        // 테이블이 없는 경우
        if (insertError.code === '42P01') {
          return null;
        }
        throw insertError;
      }

      return data as ArticleVersion;
    } catch (err) {
      const message = err instanceof Error ? err.message : '버전 저장에 실패했습니다';
      setError(message);
      console.error('버전 저장 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 특정 버전 가져오기
  const getVersion = useCallback(async (versionId: string): Promise<ArticleVersion | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('article_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (fetchError) throw fetchError;

      return data as ArticleVersion;
    } catch (err) {
      const message = err instanceof Error ? err.message : '버전을 불러오는데 실패했습니다';
      setError(message);
      console.error('버전 조회 오류:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 오래된 버전 정리 (최근 20개만 유지)
  const cleanupOldVersions = useCallback(async (articleId: string, keepCount: number = 20) => {
    try {
      const { data: versions } = await supabase
        .from('article_versions')
        .select('id, version_number')
        .eq('article_id', articleId)
        .order('version_number', { ascending: false });

      if (versions && versions.length > keepCount) {
        const toDelete = versions.slice(keepCount).map((v) => v.id);

        await supabase
          .from('article_versions')
          .delete()
          .in('id', toDelete);
      }
    } catch (err) {
      console.error('버전 정리 오류:', err);
    }
  }, [supabase]);

  return {
    getVersions,
    saveVersion,
    getVersion,
    cleanupOldVersions,
    loading,
    error,
  };
}
