# Admin Grid Creation - Implementation Plan

## Overview
Extend the existing admin UI to allow creating new grids through the web interface instead of manually inserting into the database. This builds on the existing admin panel architecture and provides a streamlined workflow for grid creation.

## Current Behavior
- Grid creation requires direct database manipulation
- New grids must be manually inserted via SQL
- No validation or guided workflow exists
- Process is error-prone and requires database access

## Desired Behavior
- Create new grids through a web form in the admin panel
- Guided workflow with validation
- Automatic permalink generation from title
- Default attribute setup options
- Integration with existing admin grid management

## Implementation Steps

### Phase 1: Database Preparation ✅
- [x] Verify existing grids table schema supports creation
- [x] Review current admin authentication/authorization
- [x] Check existing close functions for attribute defaults
- [x] Validate RLS policies allow admin grid creation

### Phase 2: Grid Creation API 🚧
- [ ] Create `createGrid` function in data layer
- [ ] Add form validation utilities
- [ ] Implement permalink generation from title
- [ ] Handle default attribute templates
- [ ] Add error handling and validation

### Phase 3: UI Components
- [ ] Design and implement NewGridForm component
- [ ] Add grid creation route `/admin/grids/new`
- [ ] Create attribute template selector
- [ ] Add form validation and error display
- [ ] Implement success/redirect handling

### Phase 4: Integration & Polish
- [ ] Update Admin.tsx to include "Create New Grid" button
- [ ] Add navigation between grid creation and editing
- [ ] Implement form state persistence
- [ ] Add confirmation dialogs for navigation
- [ ] Testing and bug fixes

## Technical Implementation

### Database Schema
Current `grids` table structure supports creation:
```sql
-- grids table (existing)
CREATE TABLE grids (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  permalink TEXT UNIQUE NOT NULL,
  max_guesses INTEGER NOT NULL DEFAULT 6,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT false,
  state TEXT DEFAULT 'upcoming',
  audio_file TEXT,
  attributes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### New Data Functions
```typescript
// src/data/grids.ts
export interface CreateGridData {
  title: string;
  tagline: string;
  permalink?: string; // Auto-generated if not provided
  category: string;
  maxGuesses?: number;
  attributes?: GridAttribute[];
}

export async function createGrid(gridData: CreateGridData): Promise<Grid> {
  // Generate permalink if not provided
  const permalink = gridData.permalink || generatePermalink(gridData.title);
  
  // Create grid in database
  const { data, error } = await supabase
    .from('grids')
    .insert({
      title: gridData.title,
      tagline: gridData.tagline,
      permalink,
      category: gridData.category,
      max_guesses: gridData.maxGuesses || 6,
      attributes: gridData.attributes || [],
      active: false,
      state: 'upcoming'
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapDbGridToGrid(data);
}

function generatePermalink(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}
```

### Component Structure
```
/src/components/admin/
├── NewGridForm.tsx          # New grid creation form
├── AttributeTemplates.tsx   # Predefined attribute templates
├── PermalinkGenerator.tsx   # Auto-generate permalinks
└── GridCreationWizard.tsx   # Multi-step creation process (future)
```

### Route Structure
- `/admin/grids/new` - New grid creation form
- `/admin/grids/:gridId` - Edit existing grid (current)

### Form Fields
```typescript
interface NewGridFormData {
  title: string;           // Required
  tagline: string;         // Required  
  category: string;        // Required (dropdown)
  permalink: string;       // Auto-generated, editable
  maxGuesses: number;      // Default 6
  attributeTemplate: string; // Optional template selector
  customAttributes: GridAttribute[]; // Manual attribute definition
}
```

### Attribute Templates
Pre-defined attribute sets for common grid types:
- **Sports Player** (team, position, years_active, age_range)
- **Movies** (genre, year, director, rating)
- **TV Shows** (network, genre, years_aired, status)
- **Music** (genre, decade, artist_type, label)
- **Geography** (continent, population_range, area_size)
- **Custom** (define manually)

### Validation Rules
- Title: Required, 3-100 characters
- Tagline: Required, 10-200 characters
- Permalink: Required, unique, URL-safe characters only
- Category: Required, from predefined list
- Max Guesses: 1-20, default 6
- At least one attribute required

## Security Considerations
- [ ] Reuse existing admin authentication
- [ ] Validate user has admin role before creation
- [ ] Sanitize all input data
- [ ] Rate limiting on creation attempts
- [ ] Audit log for grid creation events

## Files to be Modified
- `/src/data/grids.ts` - Add createGrid function
- `/src/pages/Admin.tsx` - Add "Create New Grid" button
- `/src/components/admin/NewGridForm.tsx` - New component
- `/src/App.tsx` - Add new route for grid creation
- `/src/utils/validation.ts` - Add grid validation utilities
- `/src/types/Grid.ts` - Add CreateGridData interface

## Testing Requirements
- [ ] Unit tests for createGrid function
- [ ] Form validation testing
- [ ] Permalink generation edge cases
- [ ] Integration tests for full creation flow
- [ ] Admin authorization testing
- [ ] Error handling scenarios

## User Experience Flow
1. Admin clicks "Create New Grid" from admin dashboard
2. Form loads with empty fields and attribute template selector
3. User fills title (permalink auto-generates), tagline, category
4. User selects attribute template or defines custom attributes
5. Form validates in real-time
6. On submit, grid is created and user redirected to edit page
7. Success message shows grid created successfully

## Error Handling
- Network errors during creation
- Validation errors (duplicate permalink, invalid data)
- Permission errors (non-admin users)
- Server errors (database constraints)
- Form state preservation on errors

## Future Enhancements
- Multi-step wizard for complex grids
- Grid templates with pre-filled data
- Bulk grid creation from CSV
- Grid cloning/duplication
- Image upload during creation
- Integration with entity import tools

## Related Features
This builds on existing admin functionality:
- Current grid editing (GridAdmin.tsx)
- Admin authentication system
- Attribute management interface
- Grid listing dashboard

## Success Metrics
- Reduce grid creation time from hours to minutes
- Eliminate database access requirement for grid creation
- Reduce grid creation errors
- Enable non-technical team members to create grids