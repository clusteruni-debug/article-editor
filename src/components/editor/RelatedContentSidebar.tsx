'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRelatedContent } from '@/hooks/useRelatedContent';
import { differenceInDays } from 'date-fns';

interface RelatedContentSidebarProps {
  tags: string[];
  articleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RelatedContentSidebar({
  tags,
  articleId,
  isOpen,
  onClose,
}: RelatedContentSidebarProps) {
  const { relatedArticles, relatedInsights, loading } = useRelatedContent(
    isOpen ? tags : [],
    articleId
  );

  // Ctrl+Shift+R toggle (handled by parent), Escape to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const now = new Date();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:bg-transparent"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 h-full w-full md:w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto"
        style={{ animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Related Content</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {tags.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-sm">태그를 추가하면 관련 콘텐츠가 표시됩니다</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Current tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Related Articles */}
              <section className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Related Articles ({relatedArticles.length})
                </h4>
                {relatedArticles.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">관련 글이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {relatedArticles.map((article) => {
                      const age = differenceInDays(now, new Date(article.updated_at));
                      return (
                        <Link
                          key={article.id}
                          href={`/editor/${article.id}`}
                          target="_blank"
                          className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {article.title}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {article.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      tags.includes(tag)
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                article.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {article.status === 'published' ? '발행' : '임시'}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {age === 0 ? '오늘' : `${age}일 전`}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Related Insights */}
              <section>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Related Insights ({relatedInsights.length})
                </h4>
                {relatedInsights.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">관련 인사이트가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {relatedInsights.map((insight) => {
                      const age = differenceInDays(now, new Date(insight.created_at));
                      return (
                        <div
                          key={insight.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {insight.keyword}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {insight.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      tags.includes(tag)
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 flex-shrink-0">
                              {age === 0 ? '오늘' : `${age}일 전`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Global keyframes for sidebar animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
