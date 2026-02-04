'use client';

import { useEffect, useState, useMemo } from 'react';
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
  STATS_PLATFORM_LABELS,
  ArticleStatsInsert,
} from '@/types/stats';
import { Article } from '@/types/article';
import { format, subDays, startOfWeek, startOfMonth, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [statsData, aggData, articlesData] = await Promise.all([
      getAllStats(),
      getAggregatedStats(),
      getArticles(),
    ]);
    setStats(statsData);
    setAggregated(aggData);
    setAllArticles(articlesData);
    setArticles(articlesData.filter((a) => a.status === 'published'));
  };

  // 글쓰기 활동 통계 계산
  const writingStats = useMemo(() => {
    if (allArticles.length === 0) return null;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const last7Days = subDays(now, 7);

    // 총 글자 수 계산
    const totalChars = allArticles.reduce((sum, a) => {
      const textLength = a.content_text?.replace(/\s/g, '').length || 0;
      return sum + textLength;
    }, 0);

    // 이번 주 작성 글
    const thisWeekArticles = allArticles.filter((a) =>
      isAfter(new Date(a.created_at), weekStart)
    );

    // 이번 달 작성 글
    const thisMonthArticles = allArticles.filter((a) =>
      isAfter(new Date(a.created_at), monthStart)
    );

    // 최근 7일 글자 수
    const last7DaysChars = allArticles
      .filter((a) => isAfter(new Date(a.created_at), last7Days))
      .reduce((sum, a) => {
        const textLength = a.content_text?.replace(/\s/g, '').length || 0;
        return sum + textLength;
      }, 0);

    // 평균 글 길이
    const avgLength = allArticles.length > 0
      ? Math.round(totalChars / allArticles.length)
      : 0;

    // 발행률
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

  const platforms: (StatsPlatform | 'all')[] = ['all', 'twitter', 'blog', 'instagram', 'thread', 'newsletter'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">성과 대시보드</h1>
            <Button onClick={() => setShowForm(true)}>성과 기록</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* 글쓰기 활동 통계 */}
            {writingStats && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  글쓰기 활동
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 글 수</p>
                    <p className="text-2xl font-bold">{writingStats.totalArticles}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      발행 {writingStats.publishedCount}개 ({writingStats.publishRate}%)
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 글자 수</p>
                    <p className="text-2xl font-bold">{writingStats.totalChars.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      평균 {writingStats.avgLength.toLocaleString()}자/글
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">이번 주</p>
                    <p className="text-2xl font-bold">{writingStats.thisWeekCount}개</p>
                    <p className="text-xs text-gray-400 mt-1">
                      이번 달 {writingStats.thisMonthCount}개
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">최근 7일</p>
                    <p className="text-2xl font-bold">{writingStats.last7DaysChars.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">글자 작성</p>
                  </div>
                </div>
              </div>
            )}

            {/* 성과 요약 카드 */}
            {aggregated && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">총 조회수</p>
                  <p className="text-2xl font-bold">{aggregated.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">총 좋아요</p>
                  <p className="text-2xl font-bold">{aggregated.totalLikes.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">총 댓글</p>
                  <p className="text-2xl font-bold">{aggregated.totalComments.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-500">평균 참여율</p>
                  <p className="text-2xl font-bold">{aggregated.avgEngagementRate}%</p>
                </div>
              </div>
            )}

            {/* 플랫폼별 성과 */}
            {aggregated && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-lg font-semibold mb-4">플랫폼별 성과</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {(Object.keys(aggregated.byPlatform) as StatsPlatform[]).map((platform) => {
                    const data = aggregated.byPlatform[platform];
                    const info = STATS_PLATFORM_LABELS[platform];
                    if (data.views === 0) return null;
                    return (
                      <div key={platform} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{info.icon}</span>
                          <span className="font-medium">{info.name}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">조회</span>
                            <span>{data.views.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">좋아요</span>
                            <span>{data.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">참여율</span>
                            <span className="font-semibold text-blue-600">{data.engagementRate}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 태그별 성과 */}
            {aggregated && Object.keys(aggregated.byTag).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
                <h2 className="text-lg font-semibold mb-4">주제(태그)별 성과</h2>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(aggregated.byTag)
                    .sort((a, b) => b[1].totalViews - a[1].totalViews)
                    .slice(0, 10)
                    .map(([tag, data]) => (
                      <div
                        key={tag}
                        className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-3"
                      >
                        <span className="text-sm font-medium">#{tag}</span>
                        <span className="text-xs text-gray-500">
                          {data.totalViews.toLocaleString()} views
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 상세 기록 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold">상세 기록</h2>
                <div className="flex gap-1">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedPlatform === p
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'all' ? '전체' : STATS_PLATFORM_LABELS[p].icon}
                    </button>
                  ))}
                </div>
              </div>

              {filteredStats.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>아직 기록된 성과가 없습니다.</p>
                  <Button className="mt-4" onClick={() => setShowForm(true)}>
                    첫 성과 기록하기
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStats.map((stat) => {
                    const info = STATS_PLATFORM_LABELS[stat.platform];
                    return (
                      <div
                        key={stat.id}
                        className="p-4 hover:bg-gray-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xl">{info.icon}</span>
                          <div>
                            <p className="font-medium">{stat.article?.title || '(삭제된 글)'}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(stat.recorded_at), 'M월 d일', { locale: ko })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="text-gray-500">조회</span>{' '}
                              <span className="font-medium">{stat.views.toLocaleString()}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">참여율</span>{' '}
                              <span className="font-medium text-blue-600">
                                {stat.engagement_rate || 0}%
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(stat.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 성과 기록 폼 (아티클 선택) */}
      {showForm && !selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">글 선택</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {articles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  발행된 글이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full p-4 text-left hover:bg-gray-50"
                    >
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(article.published_at || article.created_at), 'M월 d일', { locale: ko })}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
