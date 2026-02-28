# X Article Editor — CC/CX File Ownership

| Domain | File/Directory | Owner | Rationale |
|--------|---------------|:-----:|-----------|
| API Routes | src/app/api/** | CC | Server logic, security |
| DB Layer | src/lib/supabase/* | CC | Schema integration, RLS |
| Type Definitions | src/types/* | CC | Shared interfaces |
| Editor Core | src/lib/tiptap/* | CC | TipTap extensions, complex |
| UI Components | src/components/** | CX | Repetitive patterns |
| Custom Hooks | src/hooks/* | CX | Single files |
| Utilities | src/lib/utils/* | CX | Independent modules |
| Pages | src/app/**/page.tsx | CX | UI-centric |
| Environment Config | .env* | Manual | — |
