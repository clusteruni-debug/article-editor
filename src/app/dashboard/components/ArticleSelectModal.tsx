'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Article } from '@/types/article';

interface ArticleSelectModalProps {
  articles: Article[];
  onSelect: (article: Article) => void;
  onClose: () => void;
}

export function ArticleSelectModal({ articles, onSelect, onClose }: ArticleSelectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold">글 선택</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
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
                  onClick={() => onSelect(article)}
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
  );
}
