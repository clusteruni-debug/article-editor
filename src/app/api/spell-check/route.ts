import { NextRequest, NextResponse } from 'next/server';

interface SpellError {
  token: string;
  suggestions: string[];
  context: string;
  info: string;
}

// 자주 틀리는 맞춤법 규칙
const SPELL_RULES: { pattern: RegExp; suggestion: string; info: string }[] = [
  { pattern: /되요/g, suggestion: '돼요', info: '"되어요"의 줄임말은 "돼요"입니다' },
  { pattern: /됬/g, suggestion: '됐', info: '"되었"의 줄임말은 "됐"입니다' },
  { pattern: /안됀다/g, suggestion: '안 된다', info: '"안"과 "된다"는 띄어 씁니다' },
  { pattern: /몇일/g, suggestion: '며칠', info: '"며칠"이 올바른 표현입니다' },
  { pattern: /웬지/g, suggestion: '왠지', info: '"왜인지"의 줄임말은 "왠지"입니다' },
  { pattern: /어의없/g, suggestion: '어이없', info: '"어이"가 올바른 표현입니다' },
  { pattern: /금새/g, suggestion: '금세', info: '"금시에"의 줄임말은 "금세"입니다' },
  { pattern: /희안/g, suggestion: '희한', info: '"희한하다"가 올바른 표현입니다' },
  { pattern: /설레임/g, suggestion: '설렘', info: '"설레다"의 명사형은 "설렘"입니다' },
  { pattern: /어떻게 된게/g, suggestion: '어떻게 된 게', info: '"된 것이"의 줄임말 "된 게"는 띄어 씁니다' },
  { pattern: /않된다/g, suggestion: '안 된다', info: '"않"이 아닌 "안"이 맞습니다' },
  { pattern: /할께/g, suggestion: '할게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /할꼐/g, suggestion: '할게', info: '"할게"가 올바른 표현입니다' },
  { pattern: /갈께/g, suggestion: '갈게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /볼께/g, suggestion: '볼게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /줄께/g, suggestion: '줄게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /올께/g, suggestion: '올게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /알께/g, suggestion: '알게', info: '"ㄹ게"가 올바른 표현입니다' },
  { pattern: /왜냐면/g, suggestion: '왜냐하면', info: '"왜냐하면"이 올바른 표현입니다' },
  { pattern: /어쨋든/g, suggestion: '어쨌든', info: '"어쨌든"이 올바른 표현입니다' },
  { pattern: /어쨌뜬/g, suggestion: '어쨌든', info: '"어쨌든"이 올바른 표현입니다' },
  { pattern: /어떻게든/g, suggestion: '어떻게든', info: '올바른 표현입니다' },
  { pattern: /일부로/g, suggestion: '일부러', info: '"일부러"가 올바른 표현입니다' },
  { pattern: /곰곰히/g, suggestion: '곰곰이', info: '"-이"가 올바른 표현입니다' },
  { pattern: /깨끗히/g, suggestion: '깨끗이', info: '"-이"가 올바른 표현입니다' },
  { pattern: /반듯히/g, suggestion: '반듯이', info: '"-이"가 올바른 표현입니다' },
  { pattern: /어처구니/g, suggestion: '어이', info: '"어처구니"와 "어이" 모두 표준어입니다' },
  { pattern: /우겨넣/g, suggestion: '욱여넣', info: '"욱여넣다"가 올바른 표현입니다' },
  { pattern: /요새/g, suggestion: '요즘', info: '"요즘"이 더 표준적입니다 (요새도 표준어)' },
  { pattern: /벌써부터/g, suggestion: '벌써부터', info: '올바른 표현입니다' },
  { pattern: /오랫만/g, suggestion: '오랜만', info: '"오랜만"이 올바른 표현입니다' },
  { pattern: /오랫동안/g, suggestion: '오랫동안', info: '올바른 표현입니다' },
  { pattern: /문안하다/g, suggestion: '무난하다', info: '"무난하다"가 올바른 표현입니다' },
  { pattern: /역활/g, suggestion: '역할', info: '"역할"이 올바른 표현입니다' },
  { pattern: /애매모호/g, suggestion: '애매모호', info: '중복 표현이지만 표준어입니다' },
];

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '텍스트가 필요합니다' },
        { status: 400 }
      );
    }

    const errors: SpellError[] = [];

    // 규칙 기반 맞춤법 검사
    for (const rule of SPELL_RULES) {
      const matches = text.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          const start = Math.max(0, match.index - 15);
          const end = Math.min(text.length, match.index + match[0].length + 15);

          // 중복 제거
          const exists = errors.some(
            (e) => e.token === match[0] && e.context.includes(text.slice(start, end).trim())
          );

          if (!exists) {
            errors.push({
              token: match[0],
              suggestions: [rule.suggestion],
              context: '...' + text.slice(start, end).trim() + '...',
              info: rule.info,
            });
          }
        }
      }
    }

    return NextResponse.json({ errors });
  } catch (error) {
    console.error('맞춤법 검사 오류:', error);
    return NextResponse.json(
      { error: '맞춤법 검사 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
