> ⚠️ **글로벌 규칙 적용**: 절대 규칙, 보안, Git, 능동적 작업, 구현 완결성, 영향도 분석, 디버깅, 검증, 세션 프로토콜 등 공통 규칙은 `~/.claude/CLAUDE.md` 참조. 이 파일은 **프로젝트 고유 정보만** 담습니다.

# X Article Editor - 프로젝트 컨텍스트

## 📋 프로젝트
- **이름**: X Article Editor
- **스택**: Next.js + TypeScript + Supabase + TipTap Editor
- **한 줄 설명**: X(트위터) 아티클 작성 에디터

---

## 🔐 보안 체크리스트 (작업 시작 전 확인)

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

---

## ⚙️ 프로젝트 특이사항

- Supabase RLS 활성화 필수
- 파일 업로드: MIME 타입 기반 확장자 결정
- articleId 경로 탐색 공격 방지
- 프로덕션 에러 로깅 숨기기

---

## 📁 핵심 파일 구조
```
x-article-editor/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/upload/         # 이미지 업로드 API
│   │   ├── article/[id]/       # 아티클 뷰어
│   │   ├── editor/[id]/        # 에디터 페이지
│   │   ├── dashboard/          # 대시보드
│   │   ├── insights/           # 인사이트 트래킹
│   │   └── ...
│   ├── components/
│   │   ├── editor/             # TipTap 에디터 컴포넌트
│   │   ├── article/            # 아티클 관련
│   │   ├── insight/            # 인사이트 관련
│   │   └── ui/                 # 공통 UI
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/
│   │   ├── supabase/           # Supabase 클라이언트
│   │   ├── tiptap/             # TipTap 확장
│   │   └── utils/              # 유틸리티
│   └── types/                  # TypeScript 타입
├── supabase/migrations/        # DB 마이그레이션
└── CLAUDE.md                   # 프로젝트 컨텍스트
```

## 실행 방법
```bash
npm install
npm run dev     # http://localhost:3000
```

## 주요 기능
- TipTap 기반 리치 텍스트 에디터
- 이미지 업로드 (Supabase Storage)
- 자동 저장 (30초 간격)
- 태그 시스템 + 필터링
- 버전 히스토리 + 복원
- 시리즈 관리
- AI 초안 생성 (Gemini)
- 다크 모드 지원
- 인사이트 트래킹

---

## 🔌 MCP 서버 & 🔒 세션 잠금

> [워크스페이스 CLAUDE.md](../CLAUDE.md) 참고 (글로벌 설정)
