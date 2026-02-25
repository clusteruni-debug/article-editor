'use client';

import { Button } from '@/components/ui/Button';

interface ExportMenuProps {
  showMenu: boolean;
  onToggleMenu: () => void;
  onExport: (format: 'json' | 'md' | 'html') => void;
}

export function ExportMenu({ showMenu, onToggleMenu, onExport }: ExportMenuProps) {
  return (
    <div className="relative hidden sm:block">
      <Button
        variant="ghost"
        onClick={onToggleMenu}
        title="내보내기"
      >
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden md:inline">내보내기</span>
        </span>
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={() => onExport('md')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            Markdown (.md)
          </button>
          <button
            onClick={() => onExport('html')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            HTML (.html)
          </button>
          <button
            onClick={() => onExport('json')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
          >
            JSON (.json)
          </button>
        </div>
      )}
    </div>
  );
}
