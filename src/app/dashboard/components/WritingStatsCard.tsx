'use client';

interface WritingStats {
  totalArticles: number;
  totalChars: number;
  thisWeekCount: number;
  thisMonthCount: number;
  last7DaysChars: number;
  avgLength: number;
  publishedCount: number;
  publishRate: number;
}

interface WritingStatsCardProps {
  writingStats: WritingStats;
}

export function WritingStatsCard({ writingStats }: WritingStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        글쓰기 활동
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">총 글 수</p>
          <p className="text-2xl font-bold">{writingStats.totalArticles}</p>
          <p className="text-xs text-gray-400 mt-1">
            발행 {writingStats.publishedCount}개 ({writingStats.publishRate}%)
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">총 글자 수</p>
          <p className="text-2xl font-bold">{writingStats.totalChars.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            평균 {writingStats.avgLength.toLocaleString()}자/글
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">이번 주</p>
          <p className="text-2xl font-bold">{writingStats.thisWeekCount}개</p>
          <p className="text-xs text-gray-400 mt-1">
            이번 달 {writingStats.thisMonthCount}개
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">최근 7일</p>
          <p className="text-2xl font-bold">{writingStats.last7DaysChars.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">글자 작성</p>
        </div>
      </div>
    </div>
  );
}
