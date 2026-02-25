'use client';

import Link from 'next/link';

interface EditorInsightBannerProps {
  linkedInsightId: string;
  insightSummary: string | null;
}

export function EditorInsightBanner({ linkedInsightId, insightSummary }: EditorInsightBannerProps) {
  if (!linkedInsightId) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>인사이트에서 시작됨</span>
        <Link href="/insights" className="ml-auto text-blue-600 hover:underline">
          인사이트 보기
        </Link>
      </div>
      {insightSummary && (
        <p className="mt-2 text-sm text-blue-600 line-clamp-2">{insightSummary}</p>
      )}
    </div>
  );
}
