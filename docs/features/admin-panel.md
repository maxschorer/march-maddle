# Admin Panel Feature - Implementation Plan

## Overview
Create a protected admin interface for managing grid details and attributes through the UI.

## Current Behavior
- No admin interface exists
- Grid management only possible through Supabase dashboard
- No role-based access control

## Desired Behavior
- Protected admin panel at `/admin`
- Role-based access with automatic redirect for non-admins
- Full grid and attribute management through UI

## Implementation Steps

### Phase 1: Database Setup 🚧
- [x] Design role system architecture
- [x] Create RLS policies for user_roles table
- [ ] Apply database migrations
- [ ] Test RLS policies

### Phase 2: Authentication & Authorization
- [ ] Update auth context to include role checking
- [ ] Create AdminRoute component for protected routes
- [ ] Implement automatic redirect for non-admins
- [ ] Add role check utilities

### Phase 3: Admin UI Development
- [ ] Create admin layout wrapper
- [ ] Build grid list dashboard
- [ ] Implement grid editor page
- [ ] Build attribute management interface

### Phase 4: Testing & Polish
- [ ] Test all CRUD operations
- [ ] Verify security policies work correctly
- [ ] Add error handling and notifications
- [ ] Final UI polish

## Technical Implementation

### Database Schema

```sql
-- Create user_roles table with RLS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- RLS Policies
-- Users can only see their own role
CREATE POLICY "Users can view their own role"
ON "public"."user_roles"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own profile in public.users
CREATE POLICY "Users can insert their own profile"
ON "public"."users"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Admins can insert and update grids
CREATE POLICY "Admins can insert and update grids"
ON "public"."grids"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role(check_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM user_roles WHERE user_id = check_user_id),
    'user'
  );
END;
$$ LANGUAGE plpgsql;
```

### Role Types
- `user` - Default role (implicit, doesn't need entry in table)
- `admin` - Full admin access
- `moderator` - (future) Limited admin capabilities
- `beta` - (future) Access to beta features

### Components Structure
```
/src/components/admin/
├── AdminLayout.tsx       # Admin panel layout wrapper
├── GridList.tsx          # List of all grids
├── GridEditor.tsx        # Individual grid editing
├── AttributeEditor.tsx   # Attribute management
└── AdminRoute.tsx        # Protected route wrapper
```

### Route Structure
- `/admin` - Main admin dashboard
- `/admin/grids/:gridId` - Grid editor
- `/admin/grids/:gridId/attributes` - Attribute management

## Security Considerations
- [ ] No client-side role modifications allowed
- [ ] All admin operations require server-side role verification
- [ ] RLS policies prevent unauthorized access
- [ ] Role management only through Supabase dashboard

## Files to be Modified
- `/src/contexts/AuthContext.tsx` - Add role checking
- `/src/App.tsx` - Add admin routes
- `/src/types/database.ts` - Add user_roles type
- `/src/lib/supabase.ts` - Add role check utilities

## Testing Requirements
- [ ] Test RLS policies with different user roles
- [ ] Verify redirect behavior for non-admins
- [ ] Test all CRUD operations as admin
- [ ] Test that regular users cannot access admin routes

## Future Enhancements
- Activity logs for admin actions
- Bulk operations on grids
- More granular permissions (read-only admin, etc.)
- Import/export functionality for grids/attributes