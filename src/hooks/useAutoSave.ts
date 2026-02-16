'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { JSONContent } from '@tiptap/react';

interface UseAutoSaveOptions {
  articleId: string | null;
  title: string;
  content: JSONContent;
  contentText: string;
  onSave: (data: { title: string; content: JSONContent; content_text: string }) => Promise<boolean>;
  interval?: number; // 기본 30초
  enabled?: boolean;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function useAutoSave({
  articleId,
  title,
  content,
  contentText,
  onSave,
  interval = 30000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
  });

  const lastSavedContentRef = useRef<string>('');
  const lastSavedTitleRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 변경 사항 감지
  useEffect(() => {
    const currentContent = JSON.stringify(content);
    const hasChanges =
      currentContent !== lastSavedContentRef.current ||
      title !== lastSavedTitleRef.current;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, [content, title]);

  // 저장 실행
  const save = useCallback(async () => {
    if (!articleId || !title.trim()) return false;

    const currentContent = JSON.stringify(content);
    const hasChanges =
      currentContent !== lastSavedContentRef.current ||
      title !== lastSavedTitleRef.current;

    if (!hasChanges) return false;

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      const success = await onSave({
        title: title.trim(),
        content,
        content_text: contentText,
      });

      if (success) {
        lastSavedContentRef.current = currentContent;
        lastSavedTitleRef.current = title;
        setState({
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        });
        return true;
      }
    } catch (err) {
      console.error('[AUTO-SAVE] 자동 저장 실패:', err);
    }

    setState((prev) => ({ ...prev, isSaving: false }));
    return false;
  }, [articleId, title, content, contentText, onSave]);

  // 자동 저장 타이머
  useEffect(() => {
    if (!enabled || !articleId) return;

    timeoutRef.current = setInterval(() => {
      if (state.hasUnsavedChanges && !state.isSaving) {
        save();
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [enabled, articleId, interval, state.hasUnsavedChanges, state.isSaving, save]);

  // 초기 상태 설정 (기존 아티클 로드 시)
  const initializeSavedState = useCallback((savedTitle: string, savedContent: JSONContent) => {
    lastSavedContentRef.current = JSON.stringify(savedContent);
    lastSavedTitleRef.current = savedTitle;
    setState((prev) => ({ ...prev, hasUnsavedChanges: false }));
  }, []);

  return {
    ...state,
    save,
    initializeSavedState,
  };
}
