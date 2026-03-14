# Bloomelle AI Rules & Tech Stack

This document outlines the technical standards and library preferences for the Bloomelle application.

## Tech Stack

- **Framework**: React 18 with Vite for fast development and optimized builds.
- **Language**: TypeScript for type safety and better developer experience.
- **Styling**: Tailwind CSS for utility-first styling and responsive design.
- **UI Components**: shadcn/ui (built on Radix UI) for accessible, high-quality components.
- **Backend & Auth**: Supabase for authentication, database, and storage.
- **Data Fetching**: TanStack Query (React Query) for server state management and caching.
- **Routing**: React Router DOM for client-side navigation.
- **Animations**: Framer Motion for smooth, elegant transitions and interactions.
- **Forms**: React Hook Form with Zod for robust form handling and validation.
- **Charts**: Recharts for data visualization and emotional progress tracking.

## Library Usage Rules

### UI & Styling
- **Components**: Always check `src/components/ui/` first. Use shadcn/ui components for all standard UI elements (buttons, inputs, dialogs, etc.).
- **Icons**: Use `lucide-react` for all iconography.
- **Layout**: Use Tailwind CSS utility classes for all layout and spacing needs. Avoid custom CSS unless absolutely necessary.
- **Theming**: Use the `ThemeContext` and Tailwind's dark mode support.

### State & Data
- **Server State**: Use `@tanstack/react-query` for all API calls and data synchronization.
- **Backend**: Use the provided Supabase client in `src/integrations/supabase/client.ts`.
- **Authentication**: Use the `AuthContext` for accessing user session and profile data.

### Logic & Utilities
- **Forms**: Use `react-hook-form` combined with `zod` schemas for all form validation.
- **Dates**: Use `date-fns` for any date manipulation or formatting.
- **Notifications**: Use `sonner` for toast notifications or the shadcn `use-toast` hook for more complex alerts.
- **Animations**: Use `framer-motion` for any non-trivial animations or transitions.

### Project Structure
- **Pages**: Place top-level views in `src/pages/`.
- **Components**: Place reusable components in `src/components/`.
- **Hooks**: Place custom logic in `src/hooks/`.
- **Contexts**: Place global state providers in `src/contexts/`.