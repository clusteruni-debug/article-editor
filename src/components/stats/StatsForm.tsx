'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  ArticleStatsInsert,
  StatsPlatform,
  STATS_PLATFORM_LABELS,
} from '@/types/stats';

interface StatsFormProps {
  articleId: string;
  articleTitle: string;
  onSubmit: (data: ArticleStatsInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PLATFORMS: StatsPlatform[] = ['twitter', 'blog', 'instagram', 'thread', 'newsletter'];

export function StatsForm({
  articleId,
  articleTitle,
  onSubmit,
  onCancel,
  isLoading,
}: StatsFormProps) {
  const [platform, setPlatform] = useState<StatsPlatform>('twitter');
  const [platformPostUrl, setPlatformPostUrl] = useState('');
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().split('T')[0]);
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [saves, setSaves] = useState('');
  const [clicks, setClicks] = useState('');
  const [impressions, setImpressions] = useState('');
  const [reach, setReach] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      article_id: articleId,
      platform,
      platform_post_url: platformPostUrl || undefined,
      recorded_at: recordedAt,
      views: views ? parseInt(views) : 0,
      likes: likes ? parseInt(likes) : 0,
      comments: comments ? parseInt(comments) : 0,
      shares: shares ? parseInt(shares) : 0,
      saves: saves ? parseInt(saves) : 0,
      clicks: clicks ? parseInt(clicks) : 0,
      impressions: impressions ? parseInt(impressions) : 0,
      reach: reach ? parseInt(reach) : 0,
      notes: notes || undefined,
    });
  };

  // 참여율 미리보기
  const previewEngagement = () => {
    const v = parseInt(views) || 0;
    const l = parseInt(likes) || 0;
    const c = parseInt(comments) || 0;
    const s = parseInt(shares) || 0;
    if (v === 0) return '-';
    return ((l + c + s) / v * 100).toFixed(2) + '%';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">성과 기록</h2>
              <button
                type="button"
                onClick={onCancel}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate">{articleTitle}</p>
          </div>

          {/* 본문 */}
          <div className="px-6 py-4 space-y-4">
            {/* 플랫폼 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const info = STATS_PLATFORM_LABELS[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        platform === p
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {info.icon} {info.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 날짜, URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기록 날짜</label>
                <input
                  type="date"
                  value={recordedAt}
                  onChange={(e) => setRecordedAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">게시물 URL</label>
                <input
                  type="url"
                  value={platformPostUrl}
                  onChange={(e) => setPlatformPostUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {/* 주요 지표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주요 지표</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">조회수</label>
                  <input
                    type="number"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">좋아요</label>
                  <input
                    type="number"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">댓글</label>
                  <input
                    type="number"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">공유/RT</label>
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">저장</label>
                  <input
                    type="number"
                    value={saves}
                    onChange={(e) => setSaves(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">클릭</label>
                  <input
                    type="number"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 추가 지표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">추가 지표 (선택)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">노출수</label>
                  <input
                    type="number"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">도달수</label>
                  <input
                    type="number"
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* 참여율 미리보기 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">예상 참여율</span>
                <span className="font-semibold">{previewEngagement()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                (좋아요 + 댓글 + 공유) / 조회수 × 100
              </p>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="성과에 대한 메모..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
