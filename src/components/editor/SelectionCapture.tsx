'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { ActionType, ACTION_TYPE_LABELS, InsightInsert } from '@/types/insight';

interface SelectionCaptureProps {
  editor: Editor;
  tags?: string[];
  onSaveInsight: (data: InsightInsert) => Promise<boolean>;
}

export function SelectionCapture({ editor, tags = [], onSaveInsight }: SelectionCaptureProps) {
  const [visible, setVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('idea');
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const { from, to } = editor.state.selection;
    if (from === to) {
      setVisible(false);
      setShowForm(false);
      return;
    }

    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText.trim()) {
      setVisible(false);
      setShowForm(false);
      return;
    }

    // Get coordinates from the editor view
    const coords = editor.view.coordsAtPos(from);
    const editorElement = editor.view.dom.closest('.article-editor');
    if (!editorElement) return;

    const editorRect = editorElement.getBoundingClientRect();
    setPosition({
      top: coords.top - editorRect.top - 40,
      left: coords.left - editorRect.left,
    });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    editor.on('selectionUpdate', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor, updatePosition]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowForm(false);
      }
    };
    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForm]);

  const handleSave = async () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText.trim()) return;

    setSaving(true);
    const keyword = selectedText.slice(0, 50).trim();
    const summary = selectedText.length > 50 ? selectedText : undefined;

    const success = await onSaveInsight({
      keyword,
      summary,
      action_type: actionType,
      status: 'idea',
      tags,
    });

    setSaving(false);
    if (success) {
      setShowForm(false);
      setVisible(false);
      setActionType('idea');
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-30"
      style={{ top: position.top, left: position.left }}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Save as Insight
          </button>
        ) : (
          <div className="p-3 min-w-[200px]">
            <p className="text-xs text-gray-500 mb-2">유형 선택:</p>
            <div className="flex gap-1 mb-3">
              {(Object.entries(ACTION_TYPE_LABELS) as [ActionType, { emoji: string; label: string }][]).map(
                ([type, { emoji, label }]) => (
                  <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`px-2 py-1 text-[10px] rounded transition-colors ${
                      actionType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                )
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '...' : '저장'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setActionType('idea');
                }}
                className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
