'use client';

import { useState, useEffect } from 'react';

interface EditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const FONTS = [
  { value: 'Georgia, "Times New Roman", serif', label: 'Georgia (기본)' },
  { value: '"Noto Serif KR", serif', label: 'Noto Serif (한글)' },
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', label: 'System (산세리프)' },
  { value: '"Nanum Gothic", sans-serif', label: '나눔고딕' },
  { value: '"Nanum Myeongjo", serif', label: '나눔명조' },
  { value: 'monospace', label: 'Monospace' },
];

const FONT_SIZES = [
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
];

const LETTER_SPACINGS = [
  { value: '-0.03em', label: '좁게' },
  { value: '0', label: '보통' },
  { value: '0.05em', label: '넓게' },
];

const LINE_HEIGHTS = [
  { value: '1.4', label: '좁게' },
  { value: '1.6', label: '보통' },
  { value: '2.0', label: '넓게' },
];

const PARAGRAPH_SPACINGS = [
  { value: '8px', label: '좁게' },
  { value: '12px', label: '보통' },
  { value: '16px', label: '넓게' },
  { value: '24px', label: '아주 넓게' },
];

export function EditorSettings({ isOpen, onClose }: EditorSettingsProps) {
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState('16px');
  const [letterSpacing, setLetterSpacing] = useState('0');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [paragraphSpacing, setParagraphSpacing] = useState('12px');

  function applySettings(font: string, size: string, ls: string, lh: string, spacing: string) {
    document.documentElement.style.setProperty('--editor-font-family', font);
    document.documentElement.style.setProperty('--editor-font-size', size);
    document.documentElement.style.setProperty('--editor-letter-spacing', ls);
    document.documentElement.style.setProperty('--editor-line-height', lh);
    document.documentElement.style.setProperty('--editor-paragraph-spacing', spacing);
  }

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedFont = localStorage.getItem('editor-font-family');
    const savedSize = localStorage.getItem('editor-font-size');
    const savedLetterSpacing = localStorage.getItem('editor-letter-spacing');
    const savedLineHeight = localStorage.getItem('editor-line-height');
    const savedSpacing = localStorage.getItem('editor-paragraph-spacing');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedFont) setFontFamily(savedFont);
    if (savedSize) setFontSize(savedSize);
    if (savedLetterSpacing) setLetterSpacing(savedLetterSpacing);
    if (savedLineHeight) setLineHeight(savedLineHeight);
    if (savedSpacing) setParagraphSpacing(savedSpacing);

    // CSS 변수 적용
    applySettings(
      savedFont || fontFamily,
      savedSize || fontSize,
      savedLetterSpacing || letterSpacing,
      savedLineHeight || lineHeight,
      savedSpacing || paragraphSpacing
    );
  }, []);

  const handleFontChange = (value: string) => {
    setFontFamily(value);
    localStorage.setItem('editor-font-family', value);
    applySettings(value, fontSize, letterSpacing, lineHeight, paragraphSpacing);
  };

  const handleSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem('editor-font-size', value);
    applySettings(fontFamily, value, letterSpacing, lineHeight, paragraphSpacing);
  };

  const handleLetterSpacingChange = (value: string) => {
    setLetterSpacing(value);
    localStorage.setItem('editor-letter-spacing', value);
    applySettings(fontFamily, fontSize, value, lineHeight, paragraphSpacing);
  };

  const handleLineHeightChange = (value: string) => {
    setLineHeight(value);
    localStorage.setItem('editor-line-height', value);
    applySettings(fontFamily, fontSize, letterSpacing, value, paragraphSpacing);
  };

  const handleSpacingChange = (value: string) => {
    setParagraphSpacing(value);
    localStorage.setItem('editor-paragraph-spacing', value);
    applySettings(fontFamily, fontSize, letterSpacing, lineHeight, value);
  };

  if (!isOpen) return null;

  // 프리셋 버튼 공통 스타일
  const presetBtn = (isActive: boolean) =>
    `px-3 py-1.5 text-xs rounded-md border transition-colors ${
      isActive
        ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50/50 dark:bg-gray-800/50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">글쓰기 설정</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* 글꼴 */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0">글꼴</label>
          <select
            value={fontFamily}
            onChange={(e) => handleFontChange(e.target.value)}
            className="flex-1 p-1.5 border border-gray-200 dark:border-gray-600 rounded-md text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400"
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* 글자 크기 */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0">크기</label>
          <div className="flex gap-1.5">
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => handleSizeChange(size.value)}
                className={presetBtn(fontSize === size.value)}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 자간 + 행간 (한 줄) */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0">자간</label>
          <div className="flex gap-1.5">
            {LETTER_SPACINGS.map((ls) => (
              <button
                key={ls.value}
                onClick={() => handleLetterSpacingChange(ls.value)}
                className={presetBtn(letterSpacing === ls.value)}
              >
                {ls.label}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />
          <label className="text-xs text-gray-500 dark:text-gray-400 w-10 shrink-0">행간</label>
          <div className="flex gap-1.5">
            {LINE_HEIGHTS.map((lh) => (
              <button
                key={lh.value}
                onClick={() => handleLineHeightChange(lh.value)}
                className={presetBtn(lineHeight === lh.value)}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* 문단 간격 */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0">문단</label>
          <div className="flex gap-1.5">
            {PARAGRAPH_SPACINGS.map((spacing) => (
              <button
                key={spacing.value}
                onClick={() => handleSpacingChange(spacing.value)}
                className={presetBtn(paragraphSpacing === spacing.value)}
              >
                {spacing.label}
              </button>
            ))}
          </div>
        </div>

        {/* 미리보기 */}
        <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 mb-1">미리보기</p>
          <p
            style={{
              fontFamily,
              fontSize,
              letterSpacing,
              lineHeight,
              marginBottom: paragraphSpacing,
            }}
          >
            가나다라마바사 ABCDEFG 1234567
          </p>
          <p
            style={{
              fontFamily,
              fontSize,
              letterSpacing,
              lineHeight,
            }}
          >
            두 번째 문단입니다. The quick brown fox.
          </p>
        </div>
      </div>
    </div>
  );
}
