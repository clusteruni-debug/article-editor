# X Article Editor — AGENTS.md

> Global rules: see `~/.codex/instructions.md`

## Overview
- **Stack**: Next.js 16 + TypeScript + Supabase + TipTap Editor
- **Deploy**: Vercel (git push = auto-deploy)
- **DB**: Supabase (RLS required)

## Directory Structure
- `src/app/` — Page routes
- `src/components/` — UI components
- `src/lib/supabase/` — Supabase client/queries

## Precautions
- Supabase RLS required — user_id filter on all queries
- MIME type validation on file uploads
- articleId path traversal attack prevention
- localStorage as sole storage is prohibited

## Git Permissions (shared, non-overridable)
- **Codex must never execute `git commit` / `git push`.**
- Codex performs code changes + build verification only, and reports changed files + verification results upon completion.
- All commit/push operations are handled by Claude Code (or the user).

## Multi-Platform Execution Context (shared)
- This project operates under the assumption of Windows source files + WSL /mnt/c/... same-file access structure.
- External (laptop/mobile) work defaults to SSH -> WSL access.
- Runtime environment: **Windows default** (remote access via SSH -> WSL for editing, runtime constraints follow project rules)
- If path confusion arises, check CLAUDE.md "Development Environment (Multi-Platform)" section first.

<!-- BEGIN: CODEX_GIT_POLICY_BLOCK -->
## Codex Git Permissions (globally enforced)

This section is a workspace-wide enforced rule and cannot be overridden by project documents.

| Action | Claude Code/User | Codex |
|--------|:----------------:|:-----:|
| Code changes | ✅ | ✅ |
| Build/test verification | ✅ | ✅ |
| `git commit` | ✅ | **Prohibited** |
| `git push` | ✅ | **Prohibited** |

- Codex performs code changes + verification + completion report only.
- Commits/pushes are handled by Claude Code or the user.
- In case of conflict with other statements in the document, this section takes precedence.
<!-- END: CODEX_GIT_POLICY_BLOCK -->
