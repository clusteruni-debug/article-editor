'use client';

import Link from 'next/link';
import { Article } from '@/types/article';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ArticleCardProps {
  article: Article;
  onDelete?: (id: string) => void;
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const formattedDate = format(new Date(article.created_at), 'yyyy년 M월 d일', { locale: ko });
  const preview = article.content_text?.slice(0, 150) || '';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`"${article.title || '제목 없음'}" 글을 삭제하시겠습니까?\n삭제된 글은 복구할 수 없습니다.`)) {
      onDelete?.(article.id);
    }
  };

  return (
    <Link href={article.status === 'draft' ? `/editor/${article.id}` : `/article/${article.id}`}>
      <article className="group p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {article.status === 'draft' && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  임시저장
                </span>
              )}
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 group-hover:text-black mb-2 line-clamp-2">
              {article.title || '제목 없음'}
            </h2>

            {preview && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {preview}...
              </p>
            )}

            {/* 태그 */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 flex-shrink-0">
            {article.cover_image_url && (
              <img
                src={article.cover_image_url}
                alt=""
                className="w-24 h-24 object-cover rounded"
              />
            )}

            {/* 삭제 버튼 */}
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
