'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useStats } from '@/hooks/useStats';
import { useArticle } from '@/hooks/useArticle';
import { StatsForm } from '@/components/stats/StatsForm';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import {
  StatsWithArticle,
  AggregatedStats,
  StatsPlatform,
  ArticleStatsInsert,
} from '@/types/stats';
import { Article } from '@/types/article';
import { subDays, startOfWeek, startOfMonth, isAfter } from 'date-fns';
import {
  WritingStatsCard,
  PerformanceSummaryCards,
  PlatformStats,
  TagStats,
  StatsDetailList,
  ArticleSelectModal,
} from './components';

export default function DashboardPage() {
  const { getAllStats, getAggregatedStats, addStats, deleteStats, loading } = useStats();
  const { getArticles } = useArticle();
  const { success: showSuccess, error: showError } = useToast();

  const [stats, setStats] = useState<StatsWithArticle[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [selectedPlatform, setSelectedPlatform] = useState<StatsPlatform | 'all'>('all');
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  const loadData = useCallback(async () => {
    const [statsData, aggData, articlesData] = await Promise.all([
      getAllStats(),
      getAggregatedStats(),
      getArticles(),
    ]);
    setStats(statsData);
    setAggregated(aggData);
    setAllArticles(articlesData);
    setArticles(articlesData.filter((a) => a.status === 'published'));
  }, [getAllStats, getAggregatedStats, getArticles]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // 글쓰기 활동 통계 계산
  const writingStats = useMemo(() => {
    if (allArticles.length === 0) return null;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const last7Days = subDays(now, 7);

    const totalChars = allArticles.reduce((sum, a) => {
      const textLength = a.content_text?.replace(/\s/g, '').length || 0;
      return sum + textLength;
    }, 0);

    const thisWeekArticles = allArticles.filter((a) =>
      isAfter(new Date(a.created_at), weekStart)
    );

    const thisMonthArticles = allArticles.filter((a) =>
      isAfter(new Date(a.created_at), monthStart)
    );

    const last7DaysChars = allArticles
      .filter((a) => isAfter(new Date(a.created_at), last7Days))
      .reduce((sum, a) => {
        const textLength = a.content_text?.replace(/\s/g, '').length || 0;
        return sum + textLength;
      }, 0);

    const avgLength = allArticles.length > 0
      ? Math.round(totalChars / allArticles.length)
      : 0;

    const publishedCount = allArticles.filter((a) => a.status === 'published').length;
    const publishRate = allArticles.length > 0
      ? Math.round((publishedCount / allArticles.length) * 100)
      : 0;

    return {
      totalArticles: allArticles.length,
      totalChars,
      thisWeekCount: thisWeekArticles.length,
      thisMonthCount: thisMonthArticles.length,
      last7DaysChars,
      avgLength,
      publishedCount,
      publishRate,
    };
  }, [allArticles]);

  const filteredStats = useMemo(() => {
    if (selectedPlatform === 'all') return stats;
    return stats.filter((s) => s.platform === selectedPlatform);
  }, [stats, selectedPlatform]);

  const handleAddStats = async (data: ArticleStatsInsert) => {
    setFormLoading(true);
    const result = await addStats(data);
    setFormLoading(false);
    if (result) {
      showSuccess('성과가 기록되었습니다');
    } else {
      showError('성과 기록에 실패했습니다');
    }
    setShowForm(false);
    setSelectedArticle(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 성과 기록을 삭제하시겠습니까?')) return;
    const success = await deleteStats(id);
    if (success) {
      showSuccess('성과 기록이 삭제되었습니다');
    } else {
      showError('삭제에 실패했습니다');
    }
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">성과 대시보드</h1>
            <Button onClick={() => setShowForm(true)}>성과 기록</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {writingStats && (
              <WritingStatsCard writingStats={writingStats} />
            )}

            {aggregated && (
              <PerformanceSummaryCards aggregated={aggregated} />
            )}

            {aggregated && (
              <PlatformStats aggregated={aggregated} />
            )}

            {aggregated && (
              <TagStats aggregated={aggregated} />
            )}

            <StatsDetailList
              filteredStats={filteredStats}
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
              onDelete={handleDelete}
              onShowForm={() => setShowForm(true)}
            />
          </>
        )}
      </main>

      {/* 성과 기록 폼 (아티클 선택) */}
      {showForm && !selectedArticle && (
        <ArticleSelectModal
          articles={articles}
          onSelect={setSelectedArticle}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* 성과 입력 폼 */}
      {selectedArticle && (
        <StatsForm
          articleId={selectedArticle.id}
          articleTitle={selectedArticle.title}
          onSubmit={handleAddStats}
          onCancel={() => {
            setSelectedArticle(null);
            setShowForm(false);
          }}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}
