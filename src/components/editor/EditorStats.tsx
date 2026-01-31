'use client';

import { Editor } from '@tiptap/react';
import { useMemo, useState, useEffect } from 'react';

interface EditorStatsProps {
  editor: Editor | null;
  title: string;
}

const GOAL_OPTIONS = [0, 300, 500, 1000, 1500, 2000, 3000];

export function EditorStats({ editor, title }: EditorStatsProps) {
  const [dailyGoal, setDailyGoal] = useState(0);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  // 로컬 스토리지에서 목표 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('writingGoal');
    if (saved) {
      setDailyGoal(parseInt(saved, 10));
    }
  }, []);

  const stats = useMemo(() => {
    if (!editor) {
      return { charCount: 0, wordCount: 0, readingTime: 0 };
    }

    const text = editor.getText();
    const titleText = title || '';
    const fullText = titleText + ' ' + text;

    // 글자 수 (공백 제외)
    const charCount = fullText.replace(/\s/g, '').length;

    // 단어 수 (한글 + 영어)
    const koreanWords = (fullText.match(/[가-힣]+/g) || []).length;
    const englishWords = (fullText.match(/[a-zA-Z]+/g) || []).length;
    const wordCount = koreanWords + englishWords;

    // 읽기 시간 (분) - 한국어 기준 분당 500자, 영어 기준 분당 200단어
    // 혼합 텍스트이므로 글자 수 기준으로 계산 (분당 400자)
    const readingTime = Math.max(1, Math.ceil(charCount / 400));

    return { charCount, wordCount, readingTime };
  }, [editor, title, editor?.getText()]);

  // 목표 달성 체크
  useEffect(() => {
    if (dailyGoal > 0 && stats.charCount >= dailyGoal && !goalReached) {
      setGoalReached(true);
    }
  }, [stats.charCount, dailyGoal, goalReached]);

  const handleGoalChange = (goal: number) => {
    setDailyGoal(goal);
    setGoalReached(false);
    localStorage.setItem('writingGoal', goal.toString());
    setShowGoalPicker(false);
  };

  const progress = dailyGoal > 0 ? Math.min(100, (stats.charCount / dailyGoal) * 100) : 0;

  return (
    <div className="py-4 border-t border-gray-100 dark:border-gray-700">
      {/* 기본 통계 */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{stats.charCount.toLocaleString()}자</span>
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />

        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>약 {stats.readingTime}분</span>
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />

        {/* 목표 설정 */}
        <div className="relative">
          <button
            onClick={() => setShowGoalPicker(!showGoalPicker)}
            className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>
              {dailyGoal > 0 ? `목표 ${dailyGoal.toLocaleString()}자` : '목표 설정'}
            </span>
          </button>

          {showGoalPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalChange(goal)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap ${
                    goal === dailyGoal ? 'text-blue-500 font-medium' : ''
                  }`}
                >
                  {goal === 0 ? '목표 없음' : `${goal.toLocaleString()}자`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 목표 진행률 */}
      {dailyGoal > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{Math.round(progress)}% 달성</span>
            <span>{stats.charCount.toLocaleString()} / {dailyGoal.toLocaleString()}자</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                goalReached ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {goalReached && (
            <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              목표 달성! 수고하셨습니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
