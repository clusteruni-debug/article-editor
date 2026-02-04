'use client';

import Link from 'next/link';
import { Article } from '@/types/article';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ArticleListViewProps {
  article: Article;
  onDelete?: (id: string) => void;
}

// 컴팩트한 한 줄 리스트뷰 (카드뷰 대비 정보 밀도 높음)
export function ArticleListView({ article, onDelete }: ArticleListViewProps) {
  const formattedDate = format(new Date(article.created_at), 'M/d', { locale: ko });
  const updatedDate = format(new Date(article.updated_at), 'M/d', { locale: ko });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`"${article.title || '제목 없음'}" 글을 삭제하시겠습니까?`)) {
      onDelete?.(article.id);
    }
  };

  return (
    <Link href={article.status === 'draft' ? `/editor/${article.id}` : `/article/${article.id}`}>
      <div className="group flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
        {/* 상태 표시 */}
        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
          article.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
        }`} title={article.status === 'published' ? '발행됨' : '임시저장'} />

        {/* 제목 */}
        <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
          {article.title || '제목 없음'}
        </span>

        {/* 태그 (최대 2개) */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {article.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
              #{tag}
            </span>
          ))}
          {(article.tags?.length || 0) > 2 && (
            <span className="text-xs text-gray-400">+{article.tags!.length - 2}</span>
          )}
        </div>

        {/* 날짜 */}
        <span className="flex-shrink-0 text-xs text-gray-400 w-16 text-right" title={`작성: ${formattedDate} / 수정: ${updatedDate}`}>
          {updatedDate !== formattedDate ? `${updatedDate} 수정` : formattedDate}
        </span>

        {/* 삭제 버튼 */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded"
          title="삭제"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </Link>
  );
}
