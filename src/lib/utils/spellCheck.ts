// 맞춤법 검사 유틸리티
// 부산대학교 맞춤법 검사기 API 사용

export interface SpellCheckResult {
  original: string;
  corrected: string;
  errors: SpellError[];
}

export interface SpellError {
  token: string;
  suggestions: string[];
  context: string;
  info: string;
}

export async function checkSpelling(text: string): Promise<SpellCheckResult> {
  // 텍스트가 너무 길면 분할
  const maxLength = 1000;
  const chunks = splitText(text, maxLength);

  const allErrors: SpellError[] = [];
  let correctedText = text;

  for (const chunk of chunks) {
    try {
      const result = await checkChunk(chunk);
      allErrors.push(...result.errors);

      // 수정된 텍스트 반영
      for (const error of result.errors) {
        if (error.suggestions.length > 0) {
          correctedText = correctedText.replace(
            new RegExp(escapeRegex(error.token), 'g'),
            error.suggestions[0]
          );
        }
      }
    } catch (error) {
      console.error('맞춤법 검사 실패:', error);
    }
  }

  return {
    original: text,
    corrected: correctedText,
    errors: allErrors,
  };
}

async function checkChunk(text: string): Promise<{ errors: SpellError[] }> {
  // 네이버 맞춤법 검사 API (프록시 필요)
  const response = await fetch('/api/spell-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('맞춤법 검사 API 오류');
  }

  return response.json();
}

function splitText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;

    // 문장 단위로 분할
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 간단한 클라이언트 사이드 맞춤법 검사 (기본 규칙)
export function quickSpellCheck(text: string): SpellError[] {
  const errors: SpellError[] = [];

  // 자주 틀리는 맞춤법 규칙
  const rules: { pattern: RegExp; suggestion: string; info: string }[] = [
    { pattern: /되요/g, suggestion: '돼요', info: '되 + 어요 = 돼요' },
    { pattern: /됬/g, suggestion: '됐', info: '되 + 었 = 됐' },
    { pattern: /안됀다/g, suggestion: '안 된다', info: '띄어쓰기' },
    { pattern: /몇일/g, suggestion: '며칠', info: '며칠이 맞는 표현' },
    { pattern: /왠지/g, suggestion: '웬지', info: '웬지 (왜인지)' },
    { pattern: /어의없/g, suggestion: '어이없', info: '어이가 없다' },
    { pattern: /금새/g, suggestion: '금세', info: '금세 (금시에)' },
    { pattern: /희안/g, suggestion: '희한', info: '희한하다' },
    { pattern: /설레임/g, suggestion: '설렘', info: '설레다의 명사형' },
    { pattern: /어떻게 된게/g, suggestion: '어떻게 된 게', info: '띄어쓰기' },
    { pattern: /뭔 말/g, suggestion: '무슨 말', info: '무슨이 표준어' },
    { pattern: /않된다/g, suggestion: '안 된다', info: '안과 않 구분' },
    { pattern: /틀리게/g, suggestion: '다르게', info: '틀리다 vs 다르다 확인' },
  ];

  for (const rule of rules) {
    const matches = text.matchAll(rule.pattern);
    for (const match of matches) {
      if (match.index !== undefined) {
        const start = Math.max(0, match.index - 10);
        const end = Math.min(text.length, match.index + match[0].length + 10);

        errors.push({
          token: match[0],
          suggestions: [rule.suggestion],
          context: text.slice(start, end),
          info: rule.info,
        });
      }
    }
  }

  return errors;
}
