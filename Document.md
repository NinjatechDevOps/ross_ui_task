# Talent Show Live Voting Application - Project Summary

## Overview
This is a **Next.js 15** web application that enables live voting for a talent show competition. The system supports two types of users - regular voters and administrators - with real-time vote tracking and a one-vote-per-contest restriction.

## Tech Stack
- **Framework**: Next.js 15.4.4 (App Router)
- **State Management**: Redux Toolkit with React-Redux
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Development Tools**: ESLint, PostCSS

## Architecture

### Feature-Based Folder Structure
```
src/
├── features/              # Feature modules
│   ├── auth/             # Authentication feature
│   │   ├── api/          # Auth API routes
│   │   │   ├── admins/
│   │   │   └── users/
│   │   ├── components/   # Auth components
│   │   │   └── Login.tsx
│   │   └── hooks/        # Auth hooks
│   │       └── useAuth.ts
│   │
│   ├── voting/           # Voting feature
│   │   ├── api/          # Voting API routes
│   │   │   ├── contestants/
│   │   │   └── uservote/
│   │   ├── components/   # Voting components
│   │   │   ├── VotingDashboard.tsx
│   │   │   └── VotingErrorBoundary.tsx
│   │   ├── hooks/        # Voting hooks
│   │   │   ├── useContestantPolling.ts
│   │   │   ├── useTimer.ts
│   │   │   └── useVoteTimer.ts
│   │   └── store/        # Voting state
│   │       └── votingSlice.ts
│   │
│   └── admin/            # Admin feature
│       └── components/
│           └── AdminDashboard.tsx
│
├── shared/               # Shared components
│   └── components/
│       ├── ContestantCard.tsx
│       ├── LoadingError.tsx
│       ├── LogoutButton.tsx
│       ├── ErrorBoundary.tsx
│       └── DataFetchErrorBoundary.tsx
│
└── store/                # Global Redux store
    ├── store.ts
    ├── provider.tsx
    └── hooks.ts

app/                      # Next.js App Router
├── page.tsx             # Home page with error boundaries
├── login/page.tsx       # Login page
└── api/                 # API route proxies

data/                    # JSON data storage
├── contestants.json
├── userVotes.json
└── admins.json
```

## Key Features

### 1. **User Authentication**
- Email-based login system
- Role-based access (admin/user)
- Special admin access for: `admin@gmail.com`
- Session persisted in localStorage

### 2. **Voting System**
- **One vote per contest** per user (lifetime restriction)
- Real-time vote counting
- Vote persistence across sessions
- Prevents duplicate voting for the entire contest
- Visual feedback for submitted votes
- Shows contest end time (midnight) for users who haven't voted

### 3. **Live Updates**
- Auto-polling every 5 seconds for vote updates
- Real-time contestant vote counts
- No page refresh required

### 4. **Admin Dashboard**
- View all contestants with current vote counts
- Live voting simulation with automatic vote updates every 2 seconds
- Visual card highlighting when votes increase
- Real-time updates without API polling
- Separate interface from regular users

### 5. **User Experience**
- Responsive design for all devices
- Gradient purple/pink theme
- Clear voting status indicators
- For users who haven't voted: Shows time remaining until contest ends (midnight)
- For users who have voted: Shows permanent "cannot vote again" message
- Loading states and error handling
- **Error Boundaries** for graceful error handling:
  - VotingErrorBoundary for vote-specific errors
  - DataFetchErrorBoundary with auto-retry capability
  - Fallback UIs instead of blank screens

## How It Works

### User Flow:
1. **Login**: User enters email address
   - Regular users: Any valid email
   - Admin: `admin@gmail.com`

2. **Voting (Regular Users)**:
   - View all contestants with their current vote counts
   - Can vote only once per contest
   - See visual confirmation of their vote
   - Non-voters see "Voting will be closed in HH:MM:SS" countdown to midnight
   - Voters see "You cannot vote again for this contest!" message

3. **Admin View**:
   - See real-time vote counts for all contestants
   - Live voting simulation runs automatically
   - Random vote increments every 2 seconds
   - Visual feedback with card highlighting
   - No voting capability (view-only)

### Technical Implementation:

**State Management**: 
- Redux Toolkit manages global state for contestants, voting status, and user votes
- Feature-based slices: `votingSlice` for all voting-related state
- Actions handle fetching contestants and submitting votes
- Selectors provide typed access to state values

**API Routes**:
- `/api/contestants` - GET: Fetch all contestants, POST: Submit vote
- `/api/uservote` - GET: Check user's current vote status
- `/api/users` - User authentication
- `/api/admins` - Admin authentication

**Vote Tracking**:
- Server-side: `userVotes.json` stores email → {contestantId, timestamp}
- Client-side: localStorage caches vote data
- One-vote-per-contest restriction enforced on both client and server
- Contest ends at midnight (12:00 AM) each day

**Real-time Updates**:
- Users: `useContestantPolling` hook fetches latest data every 5 seconds
- Admin: Live simulation updates every 2 seconds without API calls
- Updates reflect immediately without page refresh
- Card highlighting animation for vote changes

## Security Considerations
- Email validation on login
- Server-side vote validation
- Vote limiting (one per contest per user)
- Role-based access control
- Error boundaries prevent application crashes
- Graceful error handling with retry mechanisms

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Data Persistence
The application uses JSON files for data storage:
- `contestants.json` - Contestant profiles and vote counts
- `userVotes.json` - Tracks which user voted for whom and when
- `admins.json` - Admin email whitelist

This makes the application easy to deploy and manage without requiring a database setup.