# X Article Editor

## 스택
Next.js + TypeScript + Supabase + TipTap Editor

## 실행
```bash
npm install
npm run dev     # http://localhost:3000
```

## 배포
Vercel (git push = 자동 배포)

## 환경변수 (.env.local)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY

## 구조
```
src/
├── app/            # api/upload, article/[id], editor/[id], dashboard, insights
├── components/     # editor/, article/, insight/, ui/
├── hooks/
├── lib/            # supabase/, tiptap/, utils/
├── types/
supabase/migrations/   # DB 마이그레이션
```

## 고유 제약
- Supabase RLS 활성화 필수
- 파일 업로드: MIME 타입 기반 확장자 결정
- articleId 경로 탐색 공격 방지 (sanitize)
- 프로덕션 에러 숨기기 (NODE_ENV 체크)

## 주요 기능
TipTap 에디터, 이미지 업로드, 자동 저장(30초), 태그/시리즈, 버전 히스토리, AI 초안(Gemini), 인사이트 트래킹

## 검증 체크리스트
- [ ] .env.local이 .gitignore에 포함됨
- [ ] Supabase RLS 활성화
- [ ] 빌드: npm run build 에러 없음

## 참조
- CC/CX 파일 담당: agent_docs/domain-map.md
