'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Source,
  SourceInsert,
  SourceUpdate,
  SourceCategory,
  SourceStats,
} from '@/types/source';

interface SourceRow {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

function toSource(row: SourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    url: row.url ?? undefined,
    description: row.description ?? undefined,
    category: row.category as SourceCategory,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useSource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 전체 소스 목록 조회 (이름순 정렬)
  const getSources = useCallback(async (): Promise<Source[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('sources')
        .select('*')
        .order('name', { ascending: true });

      if (err) {
        console.error('[ERROR] Supabase 에러:', err);
        throw err;
      }

      return ((data as SourceRow[]) || []).map(toSource);
    } catch (err) {
      const message = err instanceof Error ? err.message : '소스 목록 조회 실패';
      console.error('[ERROR] 소스 목록 조회 실패:', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 소스 생성
  const createSource = useCallback(
    async (data: SourceInsert): Promise<Source | null> => {
      setLoading(true);
      setError(null);

      try {
        const insertData = {
          name: data.name,
          url: data.url || null,
          description: data.description || null,
          category: data.category || 'other',
        };

        const { data: source, error: err } = await supabase
          .from('sources')
          .insert(insertData)
          .select()
          .single();

        if (err) {
          // UNIQUE 제약 조건 위반 처리
          if (err.code === '23505') {
            throw new Error(`"${data.name}" 이름의 출처가 이미 존재합니다`);
          }
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        return toSource(source as SourceRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '소스 생성 실패';
        console.error('[ERROR] 소스 생성 실패:', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 소스 수정
  const updateSource = useCallback(
    async (id: string, data: SourceUpdate): Promise<Source | null> => {
      setLoading(true);
      setError(null);

      try {
        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.url !== undefined) updateData.url = data.url || null;
        if (data.description !== undefined) updateData.description = data.description || null;
        if (data.category !== undefined) updateData.category = data.category;

        const { data: source, error: err } = await supabase
          .from('sources')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (err) {
          if (err.code === '23505') {
            throw new Error(`"${data.name}" 이름의 출처가 이미 존재합니다`);
          }
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        return toSource(source as SourceRow);
      } catch (err) {
        const message = err instanceof Error ? err.message : '소스 수정 실패';
        console.error('[ERROR] 소스 수정 실패:', message);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 소스 삭제
  const deleteSource = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { error: err } = await supabase.from('sources').delete().eq('id', id);

        if (err) {
          console.error('[ERROR] Supabase 에러:', err);
          throw err;
        }

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : '소스 삭제 실패';
        console.error('[ERROR] 소스 삭제 실패:', message);
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 소스별 인사이트 수 통계
  const getSourceStats = useCallback(async (): Promise<SourceStats[]> => {
    setLoading(true);
    setError(null);

    try {
      // 모든 소스 조회
      const { data: sources, error: srcErr } = await supabase
        .from('sources')
        .select('*')
        .order('name', { ascending: true });

      if (srcErr) throw srcErr;

      // 인사이트에서 source_id별 카운트 조회
      const { data: counts, error: cntErr } = await supabase
        .from('insights')
        .select('source_id');

      if (cntErr) throw cntErr;

      // source_id별 카운트 집계
      const countMap = new Map<string, number>();
      for (const row of counts || []) {
        const sid = (row as { source_id: string | null }).source_id;
        if (sid) {
          countMap.set(sid, (countMap.get(sid) || 0) + 1);
        }
      }

      const stats: SourceStats[] = ((sources as SourceRow[]) || []).map((row) => ({
        ...toSource(row),
        insight_count: countMap.get(row.id) || 0,
      }));

      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : '소스 통계 조회 실패';
      console.error('[ERROR] 소스 통계 조회 실패:', message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    loading,
    error,
    getSources,
    createSource,
    updateSource,
    deleteSource,
    getSourceStats,
  };
}
