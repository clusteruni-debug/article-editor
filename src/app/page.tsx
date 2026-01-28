'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Article } from '@/types/article';
import { ArticleCard } from '@/components/article/ArticleCard';
import { RecycleSuggestions } from '@/components/article/RecycleSuggestions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { useArticle } from '@/hooks/useArticle';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function HomePage() {
  const router = useRouter();
  const { getArticles, deleteArticle, loading } = useArticle();
  const { success: showSuccess, error: showError } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 키보드 단축키
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: () => router.push('/editor'),
      description: '새 글',
    },
    {
      key: 'k',
      ctrl: true,
      handler: () => searchInputRef.current?.focus(),
      description: '검색',
    },
  ]);

  useEffect(() => {
    async function loadArticles() {
      const data = await getArticles();
      setArticles(data);
    }
    loadArticles();
  }, [getArticles]);

  const handleDelete = async (id: string) => {
    const success = await deleteArticle(id);
    if (success) {
      setArticles((prev) => prev.filter((article) => article.id !== id));
      showSuccess('글이 삭제되었습니다');
    } else {
      showError('삭제에 실패했습니다');
    }
  };

  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    articles.forEach((article) => {
      article.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [articles]);

  // 검색 및 태그 필터링
  const filteredArticles = useMemo(() => {
    let result = articles;

    // 태그 필터
    if (selectedTag) {
      result = result.filter((article) => article.tags?.includes(selectedTag));
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((article) => {
        const titleMatch = article.title.toLowerCase().includes(query);
        const contentMatch = article.content_text?.toLowerCase().includes(query);
        const tagMatch = article.tags?.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagMatch;
      });
    }

    return result;
  }, [articles, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-white">
      {/* 검색 및 필터 바 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* 검색 입력 */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="제목, 내용, 태그 검색... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 태그 필터 */}
        {allTags.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedTag === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 아티클 목록 */}
      <main className="max-w-4xl mx-auto px-4">
        {/* 재활용 제안 */}
        {!loading && articles.length > 0 && !searchQuery && !selectedTag && (
          <div className="py-4">
            <RecycleSuggestions articles={articles} daysThreshold={30} maxItems={3} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-lg mb-4">아직 작성된 글이 없습니다</p>
            <Link
              href="/editor"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              첫 번째 글 작성하기
            </Link>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">
              {selectedTag && `#${selectedTag} 태그`}
              {selectedTag && searchQuery && ', '}
              {searchQuery && `"${searchQuery}"`}
              에 해당하는 글을 찾을 수 없습니다
            </p>
          </div>
        ) : (
          <div>
            {(searchQuery || selectedTag) && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                {filteredArticles.length}개의 결과
                {selectedTag && <span className="ml-2 text-gray-400">#{selectedTag}</span>}
              </div>
            )}
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
