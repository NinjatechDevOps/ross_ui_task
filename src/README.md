# Project Structure

This project follows a feature-based folder structure for better organization and maintainability.

## Directory Structure

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication feature
│   │   ├── api/       # Auth API routes
│   │   ├── components/# Auth components (Login)
│   │   └── hooks/     # Auth hooks (useAuth)
│   │
│   ├── voting/        # Voting feature
│   │   ├── api/       # Voting API routes
│   │   ├── components/# Voting components (VotingDashboard)
│   │   ├── hooks/     # Voting hooks (useVoteTimer, useContestantPolling)
│   │   └── store/     # Voting Redux slice
│   │
│   └── admin/         # Admin feature
│       └── components/# Admin components (AdminDashboard)
│
├── shared/            # Shared/common code
│   └── components/    # Shared UI components
│       ├── ContestantCard.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingError.tsx
│       ├── LogoutButton.tsx
│       └── icons.tsx
│
└── store/             # Global Redux store
    ├── store.ts       # Store configuration
    ├── hooks.ts       # Typed Redux hooks
    └── provider.tsx   # Redux Provider

app/
├── api/              # Next.js API route handlers
│   ├── auth/         # Re-exports from src/features/auth/api
│   └── voting/       # Re-exports from src/features/voting/api
├── login/            # Login page
└── page.tsx          # Main page (role-based dashboard)
```

## Features

### Authentication (`/features/auth`)
- User and admin login functionality
- Email validation
- Session management via localStorage

### Voting (`/features/voting`)
- User voting dashboard
- One vote per contest per user
- Real-time vote updates
- Contest end time display

### Admin (`/features/admin`)
- Live results dashboard
- Simulated voting updates every 2 seconds
- Vote count highlighting

## API Routes

- `/api/auth/users` - User authentication
- `/api/auth/admins` - Admin authentication
- `/api/voting/contestants` - Get contestants and submit votes
- `/api/voting/uservote` - Check user vote status

## Import Examples

```typescript
// Feature imports
import { VotingDashboard } from '@/src/features/voting';
import { Login } from '@/src/features/auth';
import { AdminDashboard } from '@/src/features/admin';

// Shared components
import { ContestantCard, LogoutButton } from '@/src/shared/components';

// Store hooks
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

// Voting slice
import { fetchContestants, selectContestants } from '@/src/features/voting/store/votingSlice';
```

## Benefits of This Structure

1. **Feature Isolation**: Each feature is self-contained with its own components, hooks, and API routes
2. **Clear Dependencies**: Easy to see what depends on what
3. **Scalability**: New features can be added without affecting existing ones
4. **Maintainability**: Related code is grouped together
5. **Reusability**: Shared components are clearly separated
6. **Type Safety**: TypeScript paths are properly configured