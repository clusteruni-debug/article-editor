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
  { value: '14px', label: '14px (작게)' },
  { value: '16px', label: '16px (기본)' },
  { value: '18px', label: '18px (크게)' },
  { value: '20px', label: '20px (아주 크게)' },
];

const PARAGRAPH_SPACINGS = [
  { value: '8px', label: '좁게' },
  { value: '12px', label: '보통 (기본)' },
  { value: '16px', label: '넓게' },
  { value: '24px', label: '아주 넓게' },
];

export function EditorSettings({ isOpen, onClose }: EditorSettingsProps) {
  const [fontFamily, setFontFamily] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState('16px');
  const [paragraphSpacing, setParagraphSpacing] = useState('12px');

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedFont = localStorage.getItem('editor-font-family');
    const savedSize = localStorage.getItem('editor-font-size');
    const savedSpacing = localStorage.getItem('editor-paragraph-spacing');

    if (savedFont) setFontFamily(savedFont);
    if (savedSize) setFontSize(savedSize);
    if (savedSpacing) setParagraphSpacing(savedSpacing);

    // CSS 변수 적용
    applySettings(
      savedFont || fontFamily,
      savedSize || fontSize,
      savedSpacing || paragraphSpacing
    );
  }, []);

  const applySettings = (font: string, size: string, spacing: string) => {
    document.documentElement.style.setProperty('--editor-font-family', font);
    document.documentElement.style.setProperty('--editor-font-size', size);
    document.documentElement.style.setProperty('--editor-paragraph-spacing', spacing);
  };

  const handleFontChange = (value: string) => {
    setFontFamily(value);
    localStorage.setItem('editor-font-family', value);
    applySettings(value, fontSize, paragraphSpacing);
  };

  const handleSizeChange = (value: string) => {
    setFontSize(value);
    localStorage.setItem('editor-font-size', value);
    applySettings(fontFamily, value, paragraphSpacing);
  };

  const handleSpacingChange = (value: string) => {
    setParagraphSpacing(value);
    localStorage.setItem('editor-paragraph-spacing', value);
    applySettings(fontFamily, fontSize, value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">에디터 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* 폰트 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              글꼴
            </label>
            <select
              value={fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* 글자 크기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              글자 크기
            </label>
            <div className="flex gap-2">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleSizeChange(size.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    fontSize === size.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {size.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 문단 간격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문단 간격
            </label>
            <div className="flex gap-2">
              {PARAGRAPH_SPACINGS.map((spacing) => (
                <button
                  key={spacing.value}
                  onClick={() => handleSpacingChange(spacing.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    paragraphSpacing === spacing.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {spacing.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 미리보기 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">미리보기</p>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: fontSize,
                marginBottom: paragraphSpacing,
              }}
            >
              가나다라마바사 ABCDEFG 1234567
            </p>
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: fontSize,
              }}
            >
              두 번째 문단입니다. The quick brown fox.
            </p>
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
