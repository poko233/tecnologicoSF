# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo and TypeScript for "Tecnológico Sur", an educational institution management system. The app handles student enrollment, attendance, grades, teacher assignments, payments, and administrative functions with role-based access control.

**Tech Stack:**
- Expo SDK ~54 with React Native 0.81.5 and React 19.1.0
- Expo Router for file-based navigation
- TypeScript with strict mode
- NativeWind (Tailwind CSS for React Native)
- Zustand for state management
- Expo Secure Store for token/session storage
- React Native Toast Message for notifications

## Development Commands

**Start development server:**
```bash
npm start
# or
npx expo start
```

**Platform-specific builds:**
```bash
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser
```

**Linting:**
```bash
npm run lint
```

**Install dependencies:**
```bash
npm install
```

## Architecture

### Routing Structure

The app uses Expo Router with file-based routing organized in three main groups:

1. **`app/(auth)/`** - Authentication screens (login, register)
2. **`app/(app)/`** - Protected admin/management routes (area, carreras, inscripcion, gestiones, etc.)
3. **`app/(tabs)/`** - Bottom tab navigation for role-specific views (perfil, materias, mis-notas, marcado)

Route access is controlled by:
- **Module-based permissions**: Dynamic routes from `modulesStore` fetched via `/api/mis-modulos`
- **Role-based tabs**: Defined in `utils/roleBasedTabs.ts` mapping roles to tab definitions
- Combined into `allowedRoutes` Set in `AuthContext`

### Authentication & Authorization

**Authentication flow** (`contexts/AuthContext.tsx`):
- On app load, checks for stored token and fetches `/api/user`
- Maps backend user model to frontend `Usuario` type
- Fetches user's accessible modules and combines with role-based tabs
- Provides `hasRole()`, `hasAnyRole()`, and `allowedRoutes` for access control

**Roles:**
- Estudiante
- Docente
- Personal
- Administrador
- Rector
- Director Administrativo
- Director Academico
- Fundador

**Students (Estudiante role):**
- No mobile drawer is shown
- Limited to tab navigation (perfil, mis-notas, materias)

### HTTP Layer

**`http/httpClient.ts`** provides a centralized API client:
- `httpClient.post()` - Unauthenticated POST
- `httpClient.getAuth()` - Authenticated GET with optional AbortSignal
- `httpClient.postAuth()` - Authenticated POST
- `httpClient.putAuth()` - Authenticated PUT
- `httpClient.deleteAuth()` - Authenticated DELETE
- `httpClient.postFormData()` - Form data upload with auth
- `httpClient.patchFormData()` - Form data PATCH (uses `_method` field for Laravel compatibility)
- `httpClient._rawFetch()` - Low-level fetch for custom Accept headers

**Base URL** is set via `EXPO_PUBLIC_API_URL` environment variable (`.env` file).

**Error handling:**
- Network errors show "Sin conexión" toast
- API errors extract message from response JSON (`message`, `error`, or `errors` fields)
- All requests automatically inject JWT Bearer token from secure storage

### State Management

**Global stores:**
- `store/modulesStore.ts` - User's accessible modules/forms (Zustand)
- `store/themeStore.ts` - Theme preference persistence
- `contexts/AuthContext.tsx` - User session and role information
- `contexts/ThemeContext.tsx` - Active theme state
- `contexts/MobileDrawerContext.tsx` - Mobile drawer open/close state

**Event bus:**
- `screens/admin/events/modulosEventBus.ts` - Pub/sub for module changes triggering re-fetch

### Screen Organization

**`screens/` directory** contains all screen implementations organized by feature:
- `admin/` - Multi-level admin features (groups, subjects, assignments, permissions, academic config)
- `asistencia/` - Attendance tracking
- `asignaciones/` - Student-subject assignments
- `asignacionDocente/` - Teacher-subject assignments
- `auth/` - Login/registration screens
- `convalidacion/` - Course validation/equivalency
- `cuota/` - Payment management
- `docente/` - Teacher-specific views
- `gestiones/` - Academic period/semester management
- `inscripcion/` - Student enrollment
- `landing/` - Landing/welcome screens
- `notas/` - Grade management
- `perfil/` - User profile
- `qr/` - QR code generation and scanning (attendance)
- `recursosHumanos/` - HR management
- `reportes/` - Reports and analytics
- `rol/` - Role management

Most screen directories follow this internal structure:
- `components/` - Screen-specific components
- `services/` - API service functions
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `forms/` - Form components
- `screens/` - Nested sub-screens

### Components

**Global reusable components** (`components/`):
- `AppLayout.tsx` - Main layout wrapper with Sidebar
- `CustomToast.tsx` - Styled toast notifications
- `DatePickerModal.tsx` - Date picker component
- `MobileDrawer.tsx` - Sidebar drawer for mobile
- `MobileHeader.tsx` - Mobile header with drawer toggle
- `ProtectedRoute.tsx` - Route protection wrapper
- `Sidebar/` - Desktop sidebar navigation
- `ThemeSelector.tsx` - Light/dark theme toggle
- `Toaster.tsx` - Toast message container
- `Tooltip.tsx` - Tooltip component

### Styling

**NativeWind** (Tailwind CSS) is used for styling:
- Tailwind classes work via `className` prop
- Theme-aware via `useTheme()` hook from `theme/useTheme.ts`
- Custom theme definitions in `theme/themes.ts`
- Global scrollbar styles injected via `components/globalScrollbar.ts`

### Storage

**Secure Storage** (`storage/secureStorage.ts`):
- `saveToken()` / `getToken()` - JWT token persistence
- `clearSession()` - Logout cleanup
- Uses Expo SecureStore for encrypted storage

**Regular Storage** (`storage/storage.ts`):
- AsyncStorage wrapper for non-sensitive data

### Utilities

**Key utilities:**
- `utils/roleBasedTabs.ts` - Maps user roles to bottom tab definitions
- `utils/dateHelpers.ts` - Date formatting and manipulation
- `utils/semesterHelpers.ts` - Academic semester calculations
- `utils/qrCrypto.ts` - QR code encryption/decryption (uses `EXPO_PUBLIC_QR_SECRET_KEY`)
- `utils/getLocation.ts` - Geolocation helpers

## Environment Variables

Configure in `.env`:
```
EXPO_PUBLIC_API_URL=http://192.168.100.88:8001
EXPO_PUBLIC_MASTER_KEY=una-clave-muy-larga-y-segura-2026
EXPO_PUBLIC_QR_SECRET_KEY=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

## Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` - Root directory
- `@theme` - `./theme/useTheme`
- `@http` - `./http/httpClient`
- `@components/*` - `./components/*`

## Key Patterns

**Creating a new protected screen:**
1. Add screen file in appropriate `screens/` subdirectory
2. Create route file in `app/(app)/` that imports the screen component
3. Backend assigns module/form permission to user roles via `/api/mis-modulos`
4. Route automatically becomes accessible based on `allowedRoutes`

**Adding a new role-based tab:**
1. Create tab file in `app/(tabs)/`
2. Add tab definition to `roleTabMap` in `utils/roleBasedTabs.ts`
3. Tab becomes available to users with that role

**Making authenticated API calls:**
```typescript
import { httpClient } from '@http';

// GET request
const data = await httpClient.getAuth<ResponseType>('/api/endpoint');

// POST request
const result = await httpClient.postAuth<ResponseType>('/api/endpoint', { 
  field: value 
});
```

**Role checking:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { hasRole, hasAnyRole } = useAuth();

if (hasRole('Administrador')) {
  // Admin-only code
}

if (hasAnyRole(['Docente', 'Administrador'])) {
  // Teacher or admin code
}
```

**Showing notifications:**
```typescript
import Toast from 'react-native-toast-message';

Toast.show({
  type: 'success', // or 'error', 'info'
  text1: 'Title',
  text2: 'Message',
  visibilityTime: 3000,
});
```

## Important Notes

- Students (Estudiante role) have restricted UI - no mobile drawer, tab-only navigation
- All date operations should use utilities in `utils/dateHelpers.ts` for consistency
- QR codes for attendance are encrypted using `EXPO_PUBLIC_QR_SECRET_KEY`
- The app supports both light and dark themes via `ThemeContext`
- Module permissions are dynamic and fetched from backend, not hardcoded
- Route access is validated via `allowedRoutes` Set in `AuthContext`
- Backend expects Laravel-style `_method` field for PATCH requests via FormData
