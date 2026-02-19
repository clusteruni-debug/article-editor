# Codex Review Report

- Project: `x-article-editor`
- Reviewer: `Codex (GPT-5 coding agent)`
- Date: `2026-02-16`
- Scope: Static review + lint-based defect scan

## Findings

### 1) [Critical] Lint baseline is broken (32 errors), blocks reliable CI quality gate

- Command: `npm run lint`
- Result: `47 problems (32 errors, 15 warnings)`
- Representative files:
  - `src/app/dashboard/page.tsx:38`
  - `src/app/editor/page.tsx:60`
  - `src/app/series/page.tsx:38`
  - `src/components/editor/EditorToolbar.tsx:15`
  - `src/components/layout/ThemeProvider.tsx:35`
- Impact:
  - High probability of runtime regressions and unstable refactors because static safety net is currently failing.

### 2) [High] API endpoints have no explicit authentication/authorization guard

- Files:
  - `src/app/api/upload/route.ts:18`
  - `src/app/api/generate-draft/route.ts:4`
- Observation:
  - Both endpoints process requests directly without checking authenticated user/session first.
- Impact:
  - Abuse risk (compute/storage cost burn), and unauthorized access patterns depending on infra routing/policies.
- Recommended fix:
  - Enforce session check (e.g., Supabase auth user validation) before processing.
  - Add request-size/rate limits for public-facing routes.

### 3) [High] `upload` route validates MIME but does not verify authenticated actor ownership of target scope

- File:
  - `src/app/api/upload/route.ts:45`
- Observation:
  - Path is derived from `articleId`, but no ownership check against current user/article relation is visible.
- Impact:
  - Potential cross-article write abuse if storage policy is permissive or misconfigured.
- Recommended fix:
  - Validate article ownership before upload.
  - Store under per-user namespace and enforce RLS/storage policy alignment.

### 4) [Medium] Korean spell-check rule includes incorrect correction

- File:
  - `src/app/api/spell-check/route.ts:16`
- Observation:
  - Rule maps `왠지 -> 웬지` with explanatory text, which is linguistically incorrect for standard usage.
- Impact:
  - Users may receive wrong correction suggestions, reducing trust in the editor.

### 5) [Medium] Multiple function-hoisting/closure order issues detected by React rules

- Files:
  - `src/app/dashboard/page.tsx:38`, `src/app/dashboard/page.tsx:41`
  - `src/app/series/page.tsx:38`, `src/app/series/page.tsx:41`
  - `src/app/editor/page.tsx:60`, `src/app/editor/page.tsx:71`
  - `src/app/editor/[id]/page.tsx:41`, `src/app/editor/[id]/page.tsx:34`
- Impact:
  - Logic fragility and dependency mistakes in hooks/effects; future edits can introduce stale closures and non-deterministic behavior.

### 6) [Medium] Components are declared inside render path in toolbar

- File:
  - `src/components/editor/EditorToolbar.tsx:15`
  - `src/components/editor/EditorToolbar.tsx:39`
- Observation:
  - `ToolbarButton`, `Divider` are declared inside `EditorToolbar` render function.
- Impact:
  - New lint rules flag this as state-reset/perf risk; repeated recreation increases maintenance burden.

## Notes

- This report prioritizes defects and operational risks, not style cleanup.
- Recommended first action: restore clean lint baseline, then enforce auth + rate limiting for API routes.
