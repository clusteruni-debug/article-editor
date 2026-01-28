'use client';

import { useRef, useEffect, ChangeEvent } from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TitleInput({ value, onChange, placeholder = 'Title' }: TitleInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 자동 높이 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none overflow-hidden bg-transparent text-[42px] font-bold leading-tight tracking-tight text-gray-900 placeholder-gray-300 outline-none"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    />
  );
}
