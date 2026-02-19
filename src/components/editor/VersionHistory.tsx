'use client';

import { useState, useEffect } from 'react';
import { useVersion } from '@/hooks/useVersion';
import { ArticleVersion } from '@/types/version';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { JSONContent } from '@tiptap/react';

interface VersionHistoryProps {
  articleId: string;
  currentTitle: string;
  currentContent: JSONContent;
  onRestore: (title: string, content: JSONContent) => void;
}

export function VersionHistory({
  articleId,
  currentTitle,
  currentContent,
  onRestore,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null);
  const { getVersions, saveVersion, loading } = useVersion();

  const loadVersions = async () => {
    const data = await getVersions(articleId);
    setVersions(data);
  };

  useEffect(() => {
    if (isOpen && articleId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadVersions();
    }
  }, [isOpen, articleId]);

  const handleSaveVersion = async () => {
    const result = await saveVersion(
      articleId,
      currentTitle,
      currentContent,
      extractText(currentContent)
    );

    if (result) {
      loadVersions();
    }
  };

  const handleRestore = (version: ArticleVersion) => {
    if (confirm(`${format(new Date(version.created_at), 'M월 d일 HH:mm', { locale: ko })} 버전으로 복원하시겠습니까?`)) {
      onRestore(version.title, version.content);
      setIsOpen(false);
    }
  };

  const extractText = (content: JSONContent): string => {
    let text = '';
    if (content.content) {
      for (const node of content.content) {
        if (node.type === 'text' && node.text) {
          text += node.text;
        } else if (node.content) {
          text += extractText(node);
        }
        text += ' ';
      }
    }
    return text.trim();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300"
        title="버전 히스토리"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">히스토리</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                버전 히스토리
              </h2>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveVersion} disabled={loading}>
                  현재 버전 저장
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* 버전 목록 */}
              <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : versions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    <p>저장된 버전이 없습니다</p>
                    <p className="mt-2">현재 버전 저장 버튼을 눌러 저장하세요</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => setSelectedVersion(version)}
                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedVersion?.id === version.id
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <p className="text-sm font-medium truncate">{version.title || '(제목 없음)'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          v{version.version_number} · {format(new Date(version.created_at), 'M/d HH:mm', { locale: ko })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 버전 미리보기 */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedVersion ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{selectedVersion.title || '(제목 없음)'}</h3>
                        <p className="text-sm text-gray-500">
                          버전 {selectedVersion.version_number} · {format(new Date(selectedVersion.created_at), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleRestore(selectedVersion)}>
                        이 버전으로 복원
                      </Button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm">
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-[20]">
                        {selectedVersion.content_text || extractText(selectedVersion.content) || '(내용 없음)'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    왼쪽에서 버전을 선택하세요
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
              최근 20개 버전이 저장됩니다. 버전 저장 버튼을 눌러 현재 상태를 저장하세요.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
