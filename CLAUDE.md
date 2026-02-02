# X Article Editor - 프로젝트 컨텍스트

> 마지막 업데이트: 2026-02-02
> 상태: 계획중

---

## 보안 체크리스트 (작업 시작 전 확인)

### 필수 확인사항
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] Supabase RLS(Row Level Security)가 활성화되어 있는가?
- [ ] 파일 업로드 시 MIME 타입 기반 확장자 결정을 사용하는가?

### 코드 작성 시 보안 규칙
1. **API 키**: 절대 코드에 하드코딩 금지 -> `.env.local` 사용
2. **에러 로깅**: 프로덕션에서는 상세 에러 숨기기 (`NODE_ENV` 체크)
3. **파일 업로드**: MIME 타입 검증, 크기 제한, 경로 탐색 공격 방지
4. **사용자 입력**: articleId 등 경로에 사용되는 값은 sanitize 필수

### 환경 변수 설정 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### 최근 보안 수정 (2026-02-02)
- 보안 헤더 추가 (next.config.ts)
- 파일 업로드 MIME 타입 기반 확장자 결정
- articleId 경로 탐색 공격 방지
- 프로덕션 에러 로깅 숨기기

---

## 프로젝트 개요
- **목적**: X(트위터) 아티클 작성 에디터
- **스택**: Next.js + TypeScript + Supabase + TipTap Editor
- **배포**: 미정

## 파일 구조
```
x-article-editor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/upload/         # 이미지 업로드 API
│   │   ├── article/[id]/       # 아티클 뷰어
│   │   ├── editor/[id]/        # 에디터 페이지
│   │   ├── dashboard/          # 대시보드
│   │   └── ...
│   ├── components/
│   │   ├── editor/             # TipTap 에디터 컴포넌트
│   │   ├── article/            # 아티클 관련
│   │   └── ui/                 # 공통 UI
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── tiptap/             # TipTap 확장
│   │   └── utils/              # 유틸리티
│   └── types/                  # TypeScript 타입
├── next.config.ts              # Next.js 설정 (보안 헤더)
└── CLAUDE.md                   # 프로젝트 컨텍스트
```

## 실행 방법
```bash
cd x-article-editor
npm install
npm run dev     # http://localhost:3000
```

## 주요 기능
- TipTap 기반 리치 텍스트 에디터
- 이미지 업로드 (Supabase Storage)
- 자동 저장
- 버전 히스토리
- 시리즈 관리
- AI 초안 생성 (Gemini)
