import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 입력 필드에서는 무시 (단, Ctrl/Cmd 조합은 허용)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlKey = event.ctrlKey || event.metaKey;
        const matchesCtrl = shortcut.ctrl ? ctrlKey : !ctrlKey;
        const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          // 입력 필드에서는 Ctrl 조합만 허용
          if (isInput && !shortcut.ctrl) {
            continue;
          }

          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// 전역 단축키 상수
export const GLOBAL_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: '저장 (Ctrl+S)' },
  PUBLISH: { key: 'p', ctrl: true, shift: true, description: '발행 (Ctrl+Shift+P)' },
  NEW: { key: 'n', ctrl: true, description: '새 글 (Ctrl+N)' },
  SEARCH: { key: 'k', ctrl: true, description: '검색 (Ctrl+K)' },
  ESCAPE: { key: 'Escape', description: '닫기 (Esc)' },
} as const;
