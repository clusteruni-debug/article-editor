'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Article } from '@/types/article';
import { ArticleViewer } from '@/components/article/ArticleViewer';
import { PlatformConverter } from '@/components/article/PlatformConverter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useArticle } from '@/hooks/useArticle';

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const { getArticle, loading } = useArticle();
  const [article, setArticle] = useState<Article | null>(null);
  const [showConverter, setShowConverter] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      const data = await getArticle(articleId);
      setArticle(data);
    }
    loadArticle();
  }, [articleId, getArticle]);

  if (loading || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'yyyy년 M월 d일', { locale: ko })
    : format(new Date(article.created_at), 'yyyy년 M월 d일', { locale: ko });

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowConverter(true)}
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                변환
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(`/editor/${article.id}`)}
            >
              수정
            </Button>
          </div>
        </div>
      </header>

      {/* 아티클 */}
      <main className="max-w-[680px] mx-auto px-4 py-12">
        <header className="mb-10">
          <h1
            className="text-[42px] font-bold leading-tight tracking-tight text-gray-900 mb-4"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {article.title}
          </h1>
          <p className="text-gray-500">{publishedDate}</p>
        </header>

        <ArticleViewer content={article.content} />
      </main>

      {/* 플랫폼 변환 모달 */}
      <PlatformConverter
        isOpen={showConverter}
        onClose={() => setShowConverter(false)}
        title={article.title}
        content={article.content}
        tags={article.tags || []}
      />
    </div>
  );
}
