# X Article Editor — AGENTS.md

> 글로벌 규칙: `~/.codex/instructions.md` 참조

## 개요
- **스택**: Next.js 16 + TypeScript + Supabase + TipTap Editor
- **배포**: Vercel (git push = 자동배포)
- **DB**: Supabase (RLS 필수)

## 디렉토리 구조
- `src/app/` — 페이지 라우트
- `src/components/` — UI 컴포넌트
- `src/lib/supabase/` — Supabase 클라이언트/쿼리

## 주의사항
- Supabase RLS 필수 — 모든 쿼리에 user_id 필터
- 파일 업로드 시 MIME 타입 검증
- articleId 경로 탐색 공격 방지
- localStorage 단독 저장소 사용 금지
