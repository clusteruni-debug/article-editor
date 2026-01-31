'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <div className="w-16 h-16 mx-auto mb-6 text-red-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-500 mb-6">
          예기치 않은 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            홈으로
          </Button>
          <Button onClick={reset}>
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
