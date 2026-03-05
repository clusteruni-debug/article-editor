'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRelatedContent } from '@/hooks/useRelatedContent';
import { differenceInDays } from 'date-fns';

interface InsightRelatedArticlesProps {
  tags: string[];
  maxItems?: number;
}

export function InsightRelatedArticles({ tags, maxItems = 3 }: InsightRelatedArticlesProps) {
  const [expanded, setExpanded] = useState(false);
  const { relatedArticles, loading } = useRelatedContent(expanded ? tags : []);

  if (tags.length === 0) return null;

  const now = new Date();
  const articles = relatedArticles.slice(0, maxItems);

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
      >
        <span>{expanded ? '▾' : '▸'}</span>
        <span>관련 글 {expanded && !loading ? `(${articles.length})` : ''}</span>
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1">
          {loading ? (
            <p className="text-[10px] text-gray-400 pl-3">로딩 중...</p>
          ) : articles.length === 0 ? (
            <p className="text-[10px] text-gray-400 pl-3">관련 글 없음</p>
          ) : (
            articles.map((article) => {
              const age = differenceInDays(now, new Date(article.updated_at));
              return (
                <Link
                  key={article.id}
                  href={`/editor/${article.id}`}
                  className="block pl-3 py-1 text-xs text-gray-600 hover:text-blue-600 transition-colors truncate"
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    article.status === 'published' ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                  {article.title}
                  <span className="text-gray-400 ml-1">
                    ({age === 0 ? '오늘' : `${age}일 전`})
                  </span>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
