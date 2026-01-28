'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSeries } from '@/hooks/useSeries';
import { useArticle } from '@/hooks/useArticle';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { SeriesWithArticles, SeriesInsert, SERIES_STATUS_LABELS, SeriesStatus } from '@/types/series';
import { Article } from '@/types/article';

export default function SeriesPage() {
  const {
    getSeriesList,
    createSeries,
    updateSeries,
    deleteSeries,
    addArticleToSeries,
    removeArticleFromSeries,
    loading,
  } = useSeries();
  const { getArticles } = useArticle();
  const { success: showSuccess, error: showError } = useToast();

  const [seriesList, setSeriesList] = useState<SeriesWithArticles[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesWithArticles | null>(null);
  const [showAddArticle, setShowAddArticle] = useState<string | null>(null);

  // 폼 상태
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<SeriesStatus>('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [seriesData, articlesData] = await Promise.all([
      getSeriesList(),
      getArticles(),
    ]);
    setSeriesList(seriesData);
    setArticles(articlesData);
  };

  const handleCreateSeries = async () => {
    if (!formTitle.trim()) return;

    const data: SeriesInsert = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      status: formStatus,
    };

    if (editingSeries) {
      const result = await updateSeries(editingSeries.id, data);
      if (result) {
        showSuccess('시리즈가 수정되었습니다');
      } else {
        showError('시리즈 수정에 실패했습니다');
      }
    } else {
      const result = await createSeries(data);
      if (result) {
        showSuccess('시리즈가 생성되었습니다');
      } else {
        showError('시리즈 생성에 실패했습니다');
      }
    }

    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 시리즈를 삭제하시겠습니까?\n(글은 삭제되지 않고 시리즈 연결만 해제됩니다)')) return;
    const success = await deleteSeries(id);
    if (success) {
      showSuccess('시리즈가 삭제되었습니다');
    } else {
      showError('삭제에 실패했습니다');
    }
    loadData();
  };

  const handleEdit = (series: SeriesWithArticles) => {
    setEditingSeries(series);
    setFormTitle(series.title);
    setFormDescription(series.description || '');
    setFormStatus(series.status);
    setShowForm(true);
  };

  const handleAddArticle = async (seriesId: string, articleId: string) => {
    const success = await addArticleToSeries(seriesId, articleId);
    setShowAddArticle(null);
    if (success) {
      showSuccess('글이 시리즈에 추가되었습니다');
    }
    loadData();
  };

  const handleRemoveArticle = async (articleId: string) => {
    const success = await removeArticleFromSeries(articleId);
    if (success) {
      showSuccess('글이 시리즈에서 제거되었습니다');
    }
    loadData();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSeries(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus('active');
  };

  // 시리즈에 포함되지 않은 발행된 글 필터
  const availableArticles = articles.filter(
    (a) => a.status === 'published' && !a.series_id
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">시리즈 관리</h1>
          <Button onClick={() => setShowForm(true)}>새 시리즈</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg mb-4">아직 시리즈가 없습니다</p>
            <Button onClick={() => setShowForm(true)}>첫 시리즈 만들기</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {seriesList.map((series) => {
              const statusInfo = SERIES_STATUS_LABELS[series.status];
              const statusColorClass = {
                blue: 'bg-blue-100 text-blue-700',
                green: 'bg-green-100 text-green-700',
                gray: 'bg-gray-100 text-gray-700',
              }[statusInfo.color];

              return (
                <div key={series.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* 시리즈 헤더 */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold">{series.title}</h2>
                        <span className={`px-2 py-0.5 text-xs rounded ${statusColorClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {series.description && (
                        <p className="text-sm text-gray-500">{series.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{series.articleCount}개의 글</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowAddArticle(series.id)}>
                        글 추가
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(series)}>
                        수정
                      </Button>
                      <button
                        onClick={() => handleDelete(series.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 시리즈 글 목록 */}
                  {series.articles.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {series.articles.map((article, index) => (
                        <div
                          key={article.id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {index + 1}
                            </span>
                            <Link
                              href={article.status === 'published' ? `/article/${article.id}` : `/editor/${article.id}`}
                              className="font-medium hover:text-blue-600"
                            >
                              {article.title}
                            </Link>
                            {article.status === 'draft' && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                임시저장
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveArticle(article.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                            title="시리즈에서 제거"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      아직 글이 없습니다. &quot;글 추가&quot; 버튼을 눌러 추가하세요.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 시리즈 생성/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">{editingSeries ? '시리즈 수정' : '새 시리즈'}</h2>
              <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="시리즈 제목"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="시리즈 설명 (선택)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <div className="flex gap-2">
                  {(['active', 'completed', 'archived'] as SeriesStatus[]).map((status) => {
                    const info = SERIES_STATUS_LABELS[status];
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormStatus(status)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          formStatus === status
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>취소</Button>
              <Button onClick={handleCreateSeries} disabled={!formTitle.trim()}>
                {editingSeries ? '수정' : '생성'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 글 추가 모달 */}
      {showAddArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold">글 추가</h2>
              <button onClick={() => setShowAddArticle(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {availableArticles.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  추가할 수 있는 글이 없습니다.
                  <br />
                  <span className="text-sm">(발행된 글 중 시리즈에 포함되지 않은 글)</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {availableArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleAddArticle(showAddArticle, article.id)}
                      className="w-full p-4 text-left hover:bg-gray-50"
                    >
                      <p className="font-medium">{article.title}</p>
                      {article.tags && article.tags.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {article.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
