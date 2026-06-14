# Namal FYP Portal

Academic Excellence Portal for Final Year Project management at Namal University.

## Quick Start

Open `index.html` in a browser, or serve locally:

```powershell
cd C:\Users\hassa\Projects\namal-fyp-portal
python -m http.server 8080
```

Then visit: http://localhost:8080

## Demo Accounts

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| Student | `student` | `student123` | Student overview, milestones, submissions |
| Faculty | `faculty` | `faculty123` | Project monitoring, submission review |
| Evaluator | `evaluator` | `evaluator123` | Evaluation schedule, marking rubric |
| Coordinator | `coordinator` | `coordinator123` | Full admin: groups, projects, evaluations |

## Project Structure

```
namal-fyp-portal/
├── index.html              # Login page
├── assets/
│   ├── auth.js             # Mock authentication & role redirect
│   ├── layout.js           # Shared sidebar & top navigation
│   ├── styles.css          # Design system styles
│   └── tailwind-config.js  # Tailwind theme (matches GUI mockups)
├── student/                # Student role pages (9 pages)
├── faculty/                # Faculty/Supervisor pages (8 pages)
├── evaluator/              # Evaluator pages (6 pages)
└── coordinator/            # Coordinator/Admin pages (13 pages)
```

## Features Implemented

### Authentication
- Login with username/password
- Remember Me checkbox
- Forgot Password link (placeholder)
- Role-based redirect via `USER_ACCOUNT` → `ROLE` → `USERACCOUNT_ROLE` (mocked)

### Student Dashboard
- Milestone stats, project summary, submission table
- Milestone timeline, latest feedback, team members
- Pages: My Project, Group, Milestones, Submissions, Feedback, Evaluations, Results, Profile

### Faculty Dashboard
- Assigned projects, pending reviews, progress analytics
- Project monitoring table with risk levels
- Submission review screen with PDF viewer, comments, approve/reject
- Pages: Projects, Groups, Submissions, Feedback, Milestones, Evaluations, Profile

### Evaluator Dashboard
- Assigned/pending/completed evaluations, average marks
- Today's schedule, evaluation history
- Marking rubric with live score calculation
- Pages: Evaluations, Rubrics, Marking Sheet, Results, Profile

### Coordinator Dashboard
- Total students/faculty/groups/projects stats
- Project domain distribution, faculty workload
- Quick actions: Create Group, Assign Supervisor, Schedule Evaluation
- Recent activity feed
- Management pages for Students, Faculty, Groups, Projects, Supervision, Milestones, Evaluations, Evaluators, Reports, Settings

## Tech Stack

- HTML5 + Tailwind CSS (CDN)
- Vanilla JavaScript (no build step required)
- Google Fonts (Inter, Geist) + Material Symbols
- Design system from provided GUI mockups

## Next Steps (Backend Integration)

Connect to a real backend by replacing `assets/auth.js` with API calls to:
- `POST /api/auth/login` — authenticate against `USER_ACCOUNT`, `ROLE`, `USERACCOUNT_ROLE`
- Role-specific REST endpoints for CRUD operations on projects, groups, milestones, submissions, evaluations
