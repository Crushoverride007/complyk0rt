# Session Notes — ComplykOrt Frontend/Backend Theming + UX Updates

Date: 2025-09-23

## What was done

- Dark/Light theming foundation
  - Confirmed Tailwind dark mode uses `class` strategy.
  - Implemented CSS variable–based tokens in `frontend/src/app/globals.css` for light and dark.
  - Mapped Tailwind colors to tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring).
  - Added semantic utilities: `.badge`, tone classes (`.tone-finished`, `.tone-review`, `.tone-inprogress`, `.tone-backlog`, `.tone-danger`, `.tone-success`, `.tone-warning`) and dot indicators (`.dot-success`, `.dot-warning`, `.dot-danger`).

- Token refactors across UI
  - Replaced hard-coded grays/blues with semantic token classes in major components: TopNav, AuthenticatedDashboard, Breadcrumb, TabsHeader, AssessmentsView, AssessmentsList, UsersTable, LoginModal, KanbanBoard, AssessmentsKanban, assessments panels.
  - Updated badges in Kanban/List to reuse `.badge` + `tone-*` utilities.

- Command Palette (Ctrl/Cmd+K)
  - New component: `frontend/src/components/CommandPalette.tsx`.
  - Glass/semi-transparent Tailwind UI–style: search with icon, section header, rows with icons and kbd hints (G D, G A, G F, G R, T).
  - Actions: Dashboard, Assessments, Files, Frameworks, Toggle Theme.
  - Mounted globally in `frontend/src/app/layout.tsx` (right after `<TopNav />`).

- Assessment detail UX
  - Tabs deep-linking via `?tab=` in `frontend/src/app/assessments/[id]/page.tsx`.
  - LeftTree status dots show success/warning/danger sample states using new dot utilities.

- Assessment creation: Framework support
  - UI: `CreateAssessmentModal.tsx` now includes a Framework select (PCI DSS 3.2.1 / 4.0, ISO/IEC 27001:2013/2022, SOC2 I/II, HIPAA, GDPR).
  - Client types/API updated in `frontend/src/services/assessments.ts` to carry optional `framework`.
  - Backend (demo) updated in `backend/simple-fresh-backend.js` to persist `framework` for POST/PUT and seed sample assessments with frameworks.
  - Kanban cards display framework label.

- Home page hero background (Next.js-style)
  - Added subtle grid + spotlight + colorful blur background to `frontend/src/app/page.tsx`.
  - New utilities in globals: `.bg-grid` and `.bg-spotlight` for reusable backgrounds.

- Config
  - Service base URL now reads `NEXT_PUBLIC_API_URL` or falls back to `NEXT_PUBLIC_API_BASE` (existing in `.env.local`).

## Key files touched

- Frontend
  - `src/app/globals.css` (tokens, utilities: badge/tone/dot/glass/kbd/search, grid/spotlight)
  - `src/app/layout.tsx` (mount CommandPalette)
  - `src/app/page.tsx` (hero background)
  - `src/components/CommandPalette.tsx` (new)
  - `src/components/AssessmentsKanban.tsx` (badges; framework label)
  - `src/components/KanbanBoard.tsx` (badges -> tone utilities)
  - `src/components/AssessmentsList.tsx` (badges -> tone utilities)
  - `src/components/assessments/CreateAssessmentModal.tsx` (Framework select)
  - `src/app/assessments/[id]/page.tsx` (tab deep-linking)
  - Many shared components refactored to token classes.

- Services
  - `src/services/assessments.ts` (types: `framework?`; create/update payloads; BASE env fallback)

- Backend (demo)
  - `backend/simple-fresh-backend.js` (framework persisted; seed data updated)

## How to use/verify

- Command Palette: press Ctrl/Cmd+K, try actions and Toggle Theme.
- Assessments → Create new: select a Framework, verify it shows on the board card.
- Assessment detail tabs respond to `?tab=section|tasks|attachments|messages`.
- Home page shows spotlight + grid + blur background in both themes.

## Environment & config

- Frontend env: `.env.local`
  - Use either `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_BASE` for the API origin.
- Demo backend updated locally (if using `backend/simple-fresh-backend.js`). Remote demo may not include framework unless updated.

## Follow-ups / Next steps (optional)

- Hook LeftTree dot statuses to real validation/completion data.
- Add true keyboard sequences inside the palette (e.g., G then A) beyond the visual hints.
- Extend tone utilities to more components (toasts, badges, chips) if any hard-coded colors remain.
- Decide whether to apply the glass search styling to Toolbar search.
- Consider SSR-safe theme initialization with user preference (avoid flash).

## Quick paths

- Frontend root: `frontend/`
- Key files:
  - `frontend/src/app/globals.css`
  - `frontend/src/components/CommandPalette.tsx`
  - `frontend/src/components/assessments/CreateAssessmentModal.tsx`
  - `frontend/src/app/assessments/[id]/page.tsx`
  - `frontend/src/components/AssessmentsKanban.tsx`
  - `backend/simple-fresh-backend.js`

\nDebugging note (2025-09-23): If UI looks unstyled, check Apache is proxying to Next on port 3000 and that /_next is proxied; restart Next (HOSTNAME=0.0.0.0 PORT=3000 npm --prefix frontend run dev) and reload Apache (apache2ctl configtest && systemctl reload apache2).
