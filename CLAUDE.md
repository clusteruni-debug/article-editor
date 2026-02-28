# X Article Editor

## Stack
Next.js + TypeScript + Supabase + TipTap Editor

## Running
```bash
npm install
npm run dev     # http://localhost:3000
```

## Deployment
Vercel (git push = auto-deploy)

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY

## Structure
```
src/
├── app/
│   ├── api/                       # upload, generate-draft, spell-check
│   ├── components/                # ← Home page split components
│   │   ├── HomeHeader.tsx         # Search, sort, filter
│   │   └── HomeArticleList.tsx    # Article list/grid
│   ├── dashboard/
│   │   └── components/            # ← Dashboard split components
│   │       ├── WritingStatsCard, PerformanceSummaryCards
│   │       ├── PlatformStats, TagStats, StatsDetailList
│   │       └── ArticleSelectModal
│   ├── editor/
│   │   ├── [id]/page.tsx          # Editor detail
│   │   └── components/            # ← Editor split components
│   │       ├── EditorHeader, ExportMenu, EditorInsightBanner
│   ├── insights/
│   │   └── components/            # ← Insight split components
│   │       ├── InsightStatsBar, InsightSearchBar
│   │       ├── InsightFilters, InsightDateGroupList
│   ├── series/, article/[id], trash/
│   └── globals.css                # Tailwind + custom (403 lines, no split needed)
├── components/
│   ├── editor/                    # TiptapEditor, EditorToolbar, SpellChecker, etc.
│   ├── article/                   # ArticleCard, PlatformConverter, etc.
│   ├── insight/
│   │   ├── InsightCard.tsx, InsightForm.tsx (orchestrator)
│   │   ├── TagSelector.tsx        # ← split out
│   │   ├── ActionTypeSelector.tsx # ← split out
│   │   └── StatusSelector.tsx     # ← split out
│   ├── source/
│   │   ├── SourceManager.tsx (orchestrator)
│   │   ├── SourceCard.tsx         # ← split out
│   │   └── SourceForm.tsx         # ← split out
│   ├── stats/, layout/, ui/
├── hooks/                         # Single hooks (tightly coupled, cannot split)
│   ├── useArticle.ts (455 lines), useInsight.ts (417 lines)
│   ├── useStats.ts (346 lines), useSeries.ts (342 lines)
│   └── useSource.ts, useAutoSave.ts, useVersion.ts, useKeyboardShortcuts.ts
├── lib/                           # supabase/, tiptap/, gemini/, utils/
└── types/                         # article, insight, series, source, stats, database
supabase/migrations/               # DB migrations
```

## Unique Constraints
- Supabase RLS must be enabled
- File upload: extension determined by MIME type
- articleId path traversal attack prevention (sanitize)
- Hide production errors (NODE_ENV check)

## Key Features
TipTap editor, image upload, auto-save (30s), tags/series, version history, AI drafts (Gemini), insight tracking

## Verification Checklist
- [ ] .env.local included in .gitignore
- [ ] Supabase RLS enabled
- [ ] Build: npm run build with no errors

## References
- CC/CX file ownership: agent_docs/domain-map.md
