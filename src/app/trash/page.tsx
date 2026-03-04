'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useArticle } from '@/hooks/useArticle';
import { Article } from '@/types/article';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function TrashPage() {
  const { getDeletedArticles, restoreArticle, permanentlyDeleteArticle, loading } = useArticle();
  const { success: showSuccess, error: showError } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);

  const loadArticles = async () => {
    const data = await getDeletedArticles();
    setArticles(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadArticles();
  }, []);

  const handleRestore = async (id: string) => {
    const success = await restoreArticle(id);
    if (success) {
      showSuccess('글이 복원되었습니다');
      loadArticles();
    } else {
      showError('복원에 실패했습니다');
    }
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}"을(를) 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    const success = await permanentlyDeleteArticle(id);
    if (success) {
      showSuccess('영구 삭제되었습니다');
      loadArticles();
    } else {
      showError('삭제에 실패했습니다');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('휴지통을 비우시겠습니까?\n모든 글이 영구 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    for (const article of articles) {
      await permanentlyDeleteArticle(article.id);
    }
    showSuccess('휴지통을 비웠습니다');
    loadArticles();
  };

  const getDaysLeft = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate);
    expiryDate.setDate(expiryDate.getDate() + 7);
    const daysLeft = differenceInDays(expiryDate, new Date());
    return Math.max(0, daysLeft);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                휴지통
              </h1>
            </div>
            {articles.length > 0 && (
              <Button variant="secondary" onClick={handleEmptyTrash}>
                휴지통 비우기
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">휴지통이 비어 있습니다</p>
            <Link href="/" className="inline-block mt-4 text-blue-500 hover:underline">
              글 목록으로 돌아가기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              삭제된 글은 7일 후 자동으로 영구 삭제됩니다.
            </p>

            {articles.map((article) => {
              const daysLeft = getDaysLeft(article.deleted_at!);
              return (
                <div
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {article.title || '(제목 없음)'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(article.deleted_at!), 'M월 d일 HH:mm', { locale: ko })} 삭제됨
                        <span className={`ml-2 ${daysLeft <= 1 ? 'text-red-500' : 'text-orange-500'}`}>
                          · {daysLeft}일 후 영구 삭제
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(article.id)}
                      >
                        복원
                      </Button>
                      <button
                        onClick={() => handlePermanentDelete(article.id, article.title)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="영구 삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
