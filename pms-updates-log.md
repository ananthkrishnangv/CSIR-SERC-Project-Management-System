# PMS Portal Updates Log

## 2026-01-14 - Portal Feature Fixes

### Phase 1: Project Edit Functionality ✅
**Files Modified:**
- `frontend/src/pages/ProjectDetailPage.tsx`

**Changes:**
- Added `showEditModal` and `saving` state variables
- Added `editForm` state for form data (title, description, status, progress, dates)
- Added `canEdit` permission check for ADMIN, DIRECTOR, SUPERVISOR, PROJECT_HEAD
- Implemented `openEditModal()` function to populate form with current project data
- Implemented `handleUpdateProject()` function calling PUT `/api/projects/:id`
- Added conditional Edit button in header (visible only to authorized roles)
- Added Edit Project modal with form fields:
  - Title (text input)
  - Description (textarea)
  - Status (select: Active, Completed, On Hold, Pending Approval, Cancelled)
  - Progress (number input 0-100%)
  - Start Date / End Date (date inputs)

---

### Phase 2: Budget Request Project Select Fix ✅
**Files Modified:**
- `frontend/src/pages/FinancePage.tsx`

**Changes:**
- Improved project fetch handling at line 144-152
- Added `Array.isArray()` check to validate response format
- Handles multiple response formats: `data.data`, `data.projects`, or direct array
- Added console warning for unexpected data formats
- Prevents empty dropdown when projects exist but format differs

---

### TypeScript Configuration Fix
**Files Modified:**
- `frontend/tsconfig.json`

**Changes:**
- Added `"types": ["vite/client"]` to compilerOptions
- Fixes `import.meta.env` TypeScript errors across all files

---

## Previous Session Updates (from truncated context)

### RC Meeting System Enhancements
**Files Modified:**
- `frontend/src/pages/ProposalPage.tsx` - Fixed API_BASE fallback to `/api`
- `frontend/src/pages/ProposalReviewPage.tsx` - Fixed API_BASE fallback to `/api`
- `backend/src/routes/rc-meeting.routes.ts` - Added alias routes for `/agenda-items`
- `backend/src/controllers/rc-meeting.controller.ts` - Added controller functions:
  - `getAgendaItems` - Fetch agenda items with comments
  - `getAgendaComments` - Get comments for specific agenda item
  - `addAgendaComment` - Add comment to agenda item
  - `deleteAgendaComment` - Remove comment
  - `finalizeAgendaItem` - Mark agenda item as finalized
  - `generateAgendaPDF` - Generate PDF data for meeting agenda

---

## Build Status
- **Frontend Build**: ✅ Successful (2026-01-14)
- **Output**: `frontend/dist/` ready for deployment

---

### Phase 3: Chart Export as Image ✅
**Files Modified:**
- `frontend/src/pages/ReportsPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`

**Changes:**
- Added `useRef` import and chart refs (`categoryChartRef`, `progressChartRef`, `budgetChartRef`)
- Added `ImageRegular` icon import from @fluentui/react-icons
- Implemented `saveChartAsImage()` function using Chart.js toBase64Image API
- Added export buttons with hover effects to all charts:
  - ReportsPage: Projects by Category (Doughnut), Monthly Progress (Bar), Budget Utilization (Bar)
  - DashboardPage: Project Status (Doughnut), Projects by Category (Bar)

---

### Phase 4: Project Comments/Journal Tab ✅
**Files Modified:**
- `backend/prisma/schema.prisma`
- `backend/src/routes/project.routes.ts`
- `backend/src/controllers/project.controller.ts`
- `frontend/src/pages/ProjectDetailPage.tsx`

**Backend Changes:**
- Added `ProjectComment` model with fields: id, projectId, userId, content, category, isPrivate, attachments, timestamps
- Added `comments` relation to `Project` model
- Added `projectComments` relation to `User` model
- Added comment API routes:
  - `GET /api/projects/:id/comments`
  - `POST /api/projects/:id/comments`
  - `DELETE /api/projects/:id/comments/:commentId`
- Implemented controller functions: `getProjectComments`, `addProjectComment`, `deleteProjectComment`
- Category types: UPDATE, MEETING_NOTE, DECISION, ISSUE, MILESTONE, RC_COMMENT

**Frontend Changes:**
- Added 'journal' tab to ProjectDetailPage tabs
- Added comments state (array of comments with user info)
- Added newComment, commentCategory, addingComment state
- Implemented `fetchComments()` and `handleAddComment()` functions
- Created Journal tab UI with:
  - Category selector dropdown
  - Comment input textarea
  - Add Entry button
  - Comments list with user avatar, name, category badge, timestamp
  - Color-coded category badges

---

### Phase 5: User Profile Page ✅
**Files Modified:**
- `frontend/src/layouts/DashboardLayout.tsx`

**Changes:**
- Added "My Profile" link to user dropdown menu (before Settings)
- Uses PersonRegular icon
- Links to `/profile` route (ProfilePage already existed with full functionality)

**Previously Existing (ProfilePage.tsx - 674 lines):**
- Complete user profile display with tabs
- Edit profile functionality with form fields
- Change password functionality
- Login history display
- Project memberships view
- Documents uploaded view
- 2FA toggle option

---

## All Features Completed ✅
- [x] Phase 1: Project Edit Modal (ProjectDetailPage)
- [x] Phase 2: Budget Request Project Select Fix (FinancePage)
- [x] Phase 3: Chart Export as Image (ReportsPage, DashboardPage)
- [x] Phase 4: Project Comments/Journal Tab (ProjectDetailPage + backend API)
- [x] Phase 5: User Profile Page Link (DashboardLayout dropdown)

---

## 2026-01-14 - Backend Infrastructure Fixes

### Rate Limiter X-Forwarded-For Fix
**Files Modified:**
- `backend/src/index.ts`

**Changes:**
- Added `validate: false` to express-rate-limit configuration
- Prevents `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` error when behind nginx proxy
- Trust proxy already configured for production/TRUST_PROXY=true environments

### Server Deployment
**Server:** 10.10.200.36
**Path:** `/opt/csir-serc-portal/`

**Deployment Steps Performed:**
1. Frontend dist synced to `/opt/csir-serc-portal/frontend/dist/`
2. Backend source synced to `/opt/csir-serc-portal/backend/`
3. Prisma client regenerated
4. PM2 process restarted (`csir-serc-portal`)
5. TRUST_PROXY=true added to server .env

---

## Known Issues

### API Authentication (401 Errors)
- Protected endpoints returning 401 Unauthorized
- Browser session tokens may be invalid/expired
- Database contains valid admin users
- `/api/verticals` returns data (confirms API working)
- Requires user to log out and log back in to refresh tokens

---

## GitHub Repository
- **URL:** https://github.com/ananthkrishnangv/CSIR-SERC-Project-Management-System
- **Latest Commit:** `23484f0` (2026-01-14)
