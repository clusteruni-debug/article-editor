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

## 멀티플랫폼 실행 컨텍스트 (공통)
- 이 프로젝트는 Windows 원본 파일 + WSL /mnt/c/... 동일 파일 접근 구조를 전제로 운영한다.
- 외부(노트북/모바일) 작업은 SSH -> WSL 경유가 기본이다.
- 실행 환경: **Windows 기본** (원격 접속 시 SSH -> WSL에서 편집 가능, 실행 제약은 프로젝트 규칙 우선)
- 경로 혼동 시 CLAUDE.md의 "개발 환경 (멀티플랫폼)" 섹션을 우선 확인한다.
