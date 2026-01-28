'use client';

import { useState } from 'react';
import { JSONContent } from '@tiptap/react';
import { Button } from '@/components/ui/Button';
import { PublishTimeRecommendation } from './PublishTimeRecommendation';
import {
  convertToAllPlatforms,
  PlatformType,
  PLATFORM_INFO,
} from '@/lib/utils/platformConverter';
import { StatsPlatform } from '@/types/stats';

interface PlatformConverterProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: JSONContent;
  tags: string[];
}

const PLATFORMS: PlatformType[] = ['twitter', 'blog', 'instagram', 'thread'];

export function PlatformConverter({
  isOpen,
  onClose,
  title,
  content,
  tags,
}: PlatformConverterProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('twitter');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const converted = convertToAllPlatforms(title, content, tags);
  const current = converted[selectedPlatform];
  const info = PLATFORM_INFO[selectedPlatform];

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const allText = current.content.join('\n\n---\n\n');
    await navigator.clipboard.writeText(allText);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">플랫폼별 변환</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 플랫폼 탭 */}
        <div className="flex border-b border-gray-100 px-4">
          {PLATFORMS.map((platform) => {
            const platformInfo = PLATFORM_INFO[platform];
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  selectedPlatform === platform
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-1">{platformInfo.icon}</span>
                {platformInfo.name}
              </button>
            );
          })}
        </div>

        {/* 정보 바 */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 text-sm">
          <div className="text-gray-600">
            <span className="font-medium">{info.name}</span>
            <span className="mx-2">•</span>
            <span>글자 제한: {info.limit}</span>
          </div>
          <div className="text-gray-500">
            {current.content.length > 1
              ? `${current.content.length}개 포스트`
              : `${current.charCount.toLocaleString()}자`}
          </div>
        </div>

        {/* 변환된 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {current.content.map((text, index) => (
            <div
              key={index}
              className="relative group border border-gray-200 rounded-lg p-4 bg-white"
            >
              {/* 인덱스 표시 (여러 개일 때만) */}
              {current.content.length > 1 && (
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-black text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              )}

              {/* 텍스트 */}
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {text}
              </pre>

              {/* 글자수 & 복사 버튼 */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{text.length}자</span>
                <button
                  onClick={() => handleCopy(text, index)}
                  className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
                >
                  {copiedIndex === index ? (
                    <>
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      복사됨
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      복사
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* 발행 시간 추천 */}
          <PublishTimeRecommendation platform={selectedPlatform as StatsPlatform} />
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            해시태그: {current.hashtags.join(' ')}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
            {current.content.length > 1 && (
              <Button onClick={handleCopyAll}>
                {copiedIndex === -1 ? '전체 복사됨!' : '전체 복사'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
