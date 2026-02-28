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
├── app/
│   ├── api/                       # upload, generate-draft, spell-check
│   ├── components/                # ← 홈 페이지 분리 컴포넌트
│   │   ├── HomeHeader.tsx         # 검색, 정렬, 필터
│   │   └── HomeArticleList.tsx    # 기사 목록/그리드
│   ├── dashboard/
│   │   └── components/            # ← 대시보드 분리 컴포넌트
│   │       ├── WritingStatsCard, PerformanceSummaryCards
│   │       ├── PlatformStats, TagStats, StatsDetailList
│   │       └── ArticleSelectModal
│   ├── editor/
│   │   ├── [id]/page.tsx          # 에디터 상세
│   │   └── components/            # ← 에디터 분리 컴포넌트
│   │       ├── EditorHeader, ExportMenu, EditorInsightBanner
│   ├── insights/
│   │   └── components/            # ← 인사이트 분리 컴포넌트
│   │       ├── InsightStatsBar, InsightSearchBar
│   │       ├── InsightFilters, InsightDateGroupList
│   ├── series/, article/[id], trash/
│   └── globals.css                # Tailwind + 커스텀 (403줄, 분리 불필요)
├── components/
│   ├── editor/                    # TiptapEditor, EditorToolbar, SpellChecker 등
│   ├── article/                   # ArticleCard, PlatformConverter 등
│   ├── insight/
│   │   ├── InsightCard.tsx, InsightForm.tsx (오케스트레이터)
│   │   ├── TagSelector.tsx        # ← 분리됨
│   │   ├── ActionTypeSelector.tsx # ← 분리됨
│   │   └── StatusSelector.tsx     # ← 분리됨
│   ├── source/
│   │   ├── SourceManager.tsx (오케스트레이터)
│   │   ├── SourceCard.tsx         # ← 분리됨
│   │   └── SourceForm.tsx         # ← 분리됨
│   ├── stats/, layout/, ui/
├── hooks/                         # 단일 훅 (밀결합, 분리 불가)
│   ├── useArticle.ts (455줄), useInsight.ts (417줄)
│   ├── useStats.ts (346줄), useSeries.ts (342줄)
│   └── useSource.ts, useAutoSave.ts, useVersion.ts, useKeyboardShortcuts.ts
├── lib/                           # supabase/, tiptap/, gemini/, utils/
└── types/                         # article, insight, series, source, stats, database
supabase/migrations/               # DB 마이그레이션
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
