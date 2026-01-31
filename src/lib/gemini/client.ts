import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI?.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export async function generateArticleDraft(
  keyword: string,
  summary?: string,
  actionType?: string
): Promise<{ title: string; content: string; tags: string[] }> {
  if (!geminiModel) {
    throw new Error('Gemini API key not configured');
  }

  const actionContext = {
    execute: '실행 가능한 인사이트를 바탕으로 실용적인',
    idea: '아이디어를 발전시켜 창의적인',
    observe: '관찰한 트렌드를 분석하는',
    reference: '참고 자료를 정리한',
  }[actionType || 'idea'] || '인사이트를 바탕으로';

  const prompt = `당신은 전문 콘텐츠 작가입니다. 아래 정보를 바탕으로 블로그 아티클 초안을 작성해주세요.

키워드: ${keyword}
${summary ? `요약/메모: ${summary}` : ''}

작성 방향: ${actionContext} 글을 작성해주세요.

요구사항:
1. 제목은 눈길을 끄는 매력적인 제목으로
2. 본문은 3-4개의 섹션으로 구성
3. 각 섹션에 소제목(##) 포함
4. 실용적인 인사이트와 예시 포함
5. 마무리에 핵심 메시지 정리
6. 한국어로 작성
7. 전체 길이: 800-1200자

응답 형식 (JSON):
{
  "title": "제목",
  "content": "마크다운 형식의 본문",
  "tags": ["태그1", "태그2", "태그3"]
}

JSON만 응답해주세요.`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response.text();

  // JSON 파싱
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    title: parsed.title || keyword,
    content: parsed.content || '',
    tags: parsed.tags || [keyword],
  };
}
