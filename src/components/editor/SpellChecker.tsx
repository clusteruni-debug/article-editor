'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SpellError {
  token: string;
  suggestions: string[];
  context: string;
  info: string;
}

interface SpellCheckerProps {
  getText: () => string;
  onReplace: (original: string, replacement: string) => void;
}

export function SpellChecker({ getText, onReplace }: SpellCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  const handleCheck = async () => {
    const text = getText();
    if (!text.trim()) {
      return;
    }

    setIsChecking(true);
    setIsOpen(true);

    try {
      const response = await fetch('/api/spell-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
      }
    } catch (error) {
      console.error('맞춤법 검사 오류:', error);
    } finally {
      setIsChecking(false);
      setHasChecked(true);
    }
  };

  const handleApplyFix = (error: SpellError) => {
    if (error.suggestions.length > 0) {
      onReplace(error.token, error.suggestions[0]);
      // 적용된 오류 제거
      setErrors((prev) => prev.filter((e) => e !== error));
    }
  };

  const handleApplyAll = () => {
    errors.forEach((error) => {
      if (error.suggestions.length > 0) {
        onReplace(error.token, error.suggestions[0]);
      }
    });
    setErrors([]);
  };

  return (
    <>
      <button
        onClick={handleCheck}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300"
        title="맞춤법 검사"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">맞춤법</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                맞춤법 검사
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isChecking ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-500">검사 중...</p>
                </div>
              ) : errors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {hasChecked ? (
                    <>
                      <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">맞춤법 오류가 없습니다!</p>
                      <p className="text-sm text-gray-500 mt-1">글이 깔끔하게 작성되었어요</p>
                    </>
                  ) : (
                    <p className="text-gray-500">검사 버튼을 눌러 맞춤법을 검사하세요</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">
                      {errors.length}개의 오류를 발견했습니다
                    </p>
                    <Button size="sm" onClick={handleApplyAll}>
                      모두 수정
                    </Button>
                  </div>

                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {error.context}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-red-500 line-through">{error.token}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span className="text-green-600 font-medium">{error.suggestions[0]}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{error.info}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApplyFix(error)}
                        >
                          수정
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
