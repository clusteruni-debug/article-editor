# X Article Editor - Changelog & Roadmap

## [2026-02-05] - Move Editor Settings to Toolbar Inline Panel
### Changes
- **Editor settings location change**: Header modal → gear button at end of editor toolbar + inline panel
  - Settings button placed next to bold/italic/heading/list/quote buttons
  - Click opens a collapsible settings panel directly below toolbar (full-screen modal removed)
- **Letter spacing / line height settings** added: Narrow/Normal/Wide 3-level presets
- **Inline panel layout**: Letter spacing and line height placed side by side on one row to save space
- **CSS variable** `--editor-letter-spacing` added
- **Width expansion**: main max-w-[680px] → max-w-4xl, header → max-w-6xl
- Ctrl+, shortcut maintained via editorRef.toggleSettings()

### Modified Files
- `src/components/editor/EditorToolbar.tsx` (added settings toggle button)
- `src/components/editor/EditorSettings.tsx` (modal → inline panel conversion)
- `src/components/editor/TiptapEditor.tsx` (settings state management + panel rendering)
- `src/app/editor/page.tsx` (removed header settings button/modal)
- `src/app/editor/[id]/page.tsx` (removed header settings button/modal)
- `src/app/globals.css` (CSS variable + letter-spacing applied)
- `src/app/article/[id]/page.tsx` (width expansion)

### DB Changes: None

### Next Steps
- After Vercel deploy, verify toolbar settings button click → inline panel expand/collapse
- Verify letter spacing/line height changes → real-time editor reflection

---

## [2026-02-05] - Article List Pagination + Enhanced Filter/Sort
### Changes
- **Server-side pagination** (10 items per page)
  - Supabase `.range()` + `count: 'exact'` for server-side paging
  - Total article count display + page number navigation
- **Server-side filtering/search**
  - Search term: server-side search via Supabase `ilike` (300ms debounce)
  - Tag filter: server-side processing with `contains` operator
  - Status filter: All/Draft/Published
- **Sort options**: Newest, Oldest, Recently Modified, Title
- **View mode toggle**: Card view (existing) / List view (compact single row)
- **URL query parameter sync**
  - Search term, tag, status, sort, page, view mode all reflected in URL
  - Filter state persists on refresh, bookmarkable
- **Reset filters button** (search results area)
- **Page adjustment after deletion** (navigate to previous page when last item deleted)

### New Files
- `src/components/ui/Pagination.tsx` (pagination component)
- `src/components/article/ArticleListView.tsx` (compact list view)

### Modified Files
- `src/hooks/useArticle.ts` (added getArticlesPaginated, getAllTags functions)
- `src/app/page.tsx` (full rewrite: pagination/filter/sort/URL/view mode)

### DB Changes: None

### Next Steps
- Usability testing (page transitions, filter combinations, URL restoration)
- Consider applying same pattern to trash page

---

## [2026-02-04] - Insight Form UX Improvement: Source/Link Separation + Delete UX
### Changes
- **Source and link field separation**
  - Added `insights.link` TEXT column (original link for individual insights)
  - Rows with URL (http) in existing source → auto-migrated to link column
  - Added "Original Link" URL input to InsightForm (below source)
- **Source deselection UX improvement** (SourceSelect)
  - Selected state: chip (pill) format + "X remove" button for visual clarity
  - Unselected state: existing search/input method retained
- **Tag deletion UX improvement** (InsightForm)
  - Red background/text highlight on tag hover to clarify delete intent
- **InsightCard link icon**
  - External link icon displayed when link value exists (opens in new tab)

### New Files
- `supabase/migrations/009_add_insights_link.sql`

### Modified Files
- `src/types/insight.ts` (added link field)
- `src/hooks/useInsight.ts` (link mapping/save)
- `src/components/insight/InsightForm.tsx` (link input + tag UX)
- `src/components/insight/InsightCard.tsx` (link icon)
- `src/components/source/SourceSelect.tsx` (deselection chip UI)

### Next Steps
- Need to run 009 migration on Supabase
- UX usability testing (source select/deselect, link input, tag deletion)

---

## [2026-02-04] - Newsletter Source Management System
### Changes
- **Source management system added**
  - Created `sources` table (name UNIQUE, url, description, category)
  - Added `insights.source_id` FK column (ON DELETE SET NULL)
  - Existing source text → auto-migration to sources table
  - Categories: Newsletter, Blog, Podcast, YouTube, X/Twitter, Other
- **Source CRUD** (useSource hook)
  - Create/update/delete + UNIQUE name duplicate error handling
  - Per-source insight count statistics (getSourceStats)
- **Source management modal** (SourceManager)
  - List + create/edit/delete UI
  - Per-source insight count, category emoji, URL link display
- **Source selection in insight form** (SourceSelect)
  - Text input + existing source autocomplete filtering
  - "Add new source" inline creation (category, URL input)
- **Source filter added to insights page** (below tag filter, purple pill buttons)
- `insights.source` TEXT column retained (backward compatibility)

### New Files
- `supabase/migrations/008_create_sources_table.sql`
- `src/types/source.ts`
- `src/hooks/useSource.ts`
- `src/components/source/SourceSelect.tsx`
- `src/components/source/SourceManager.tsx`
- `src/components/source/index.ts`

### Modified Files
- `src/types/insight.ts` (added source_id field)
- `src/hooks/useInsight.ts` (source_id mapping/save)
- `src/components/insight/InsightForm.tsx` (SourceSelect integration)
- `src/app/insights/page.tsx` (source management/filter integration)

### Next Steps
- Need to run 008 migration on Supabase
- Source management UI usability testing

---

## [2026-02-04] - Insight Tag/Filter System
### Changes
- Insight date-based grouping + accordion (recent 3 days expanded, rest collapsed)
- Tag system (DB tags column, 8 default recommended tags, input UI, filter)
- Tags included in search, sort dropdown (Newest/Oldest)
- Stats bar merged into clickable status filter (removed duplicate status filter)
- .env.local configuration (Supabase + Gemini)

### Affected Files
- `src/app/insights/page.tsx`, `src/components/insight/InsightCard.tsx`
- `src/components/insight/InsightForm.tsx`, `src/hooks/useInsight.ts`
- `src/types/insight.ts`, `supabase/migrations/007_add_insights_tags.sql`

### Next Steps
- Need to run 007 migration on Supabase (tags column)
- Add tag data to insights to utilize filter functionality

---

## Current Version Features (v1.0)

### Editor Core
- **Tiptap-based rich text editor**
- Formatting: Bold, Italic, Underline, Strikethrough
- Headings: H1, H2, H3, Body (P)
- Lists: Bullet, Numbered
- Blockquote
- Image paste & drag-and-drop

### Article Management
- Supabase integration (DB + Storage)
- Auto-save (30-second interval)
- Tag add/delete/filtering
- Article search (title/content)
- Trash (7-day retention with auto-delete)
- Version history (restore functionality)

### Export
- Markdown (.md)
- HTML (.html)
- JSON (.json)

### Writing Tools
- Character count / reading time display
- Writing goal setting (daily character count)
- Spell check (30+ commonly mistaken expressions)
- AI writing assistant (Gemini integration)

### UI/UX
- Dark mode support
- Mobile responsive optimization
- Keyboard shortcuts
  - `Ctrl+S`: Save draft
  - `Ctrl+Shift+P`: Publish
  - `Ctrl+,`: Settings
  - `Escape`: Close menu

### Dashboard
- Writing activity statistics (total articles, character count, weekly/monthly)
- Per-platform performance tracking
- Per-tag analysis

---

## Future Improvement Considerations

### Writing Habits
- [ ] Consecutive writing days (streak) display
- [ ] Writing reminder notifications
- [ ] Weekly/monthly reports

### Editor UX
- [ ] Focus mode (Zen Mode)
- [ ] Article template save/load
- [ ] Word/sentence repetition detection

### AI Feature Expansion
- [ ] Auto-generate article summary
- [ ] Tone & manner analysis/adjustment
- [ ] SEO title suggestions
- [ ] Article structure feedback

### Content Management
- [ ] Folder/category classification
- [ ] Inter-article link connections
- [ ] Series order drag-and-drop sorting

### Publishing (Optional)
- [ ] Direct X/Twitter posting
- [ ] Public sharing link

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Editor**: Tiptap
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API

---

## Development Environment

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```
