# New Grid Playbook

This document outlines the process for creating and deploying new grids in GuessGrid.

## Visual Flowchart

See [new-grid-flowchart-diagram.md](./new-grid-flowchart-diagram.md) for a visual representation of this process.

## Prerequisites

- [ ] Database access (Supabase)
- [ ] Storage access for images
- [ ] DBT access for queries
- [ ] Understanding of grid concept and target audience

## Implementation Steps

### Step 1: Create Grid Model
- [ ] Define grid concept and theme
- [ ] Create grid metadata in database:
  ```sql
  INSERT INTO grids (id, name, description, icon, is_active)
  VALUES ('your-grid-id', 'Your Grid Name', 'Description', '🎯', false);
  ```
- [ ] Define grid attributes and comparison logic

### Step 2: Add Grid Image
- [ ] Create/obtain grid icon/image
- [ ] Upload grid image to storage
- [ ] Update grid record with image URL

### Step 3: Entity Setup Decision

#### Path A: Entities Don't Exist in Database

##### Check for Existing Client
- **Have a client?**
  - YES → Check if we need a new method
  - NO → Create new client for data source

##### Client Method Setup
- **Need new method?**
  - YES → Initialize source table schema
  - NO → Update existing client with new method

##### Load Entities
- [ ] Initialize source table (`src_[grid_name]`)
- [ ] Create/update client method to fetch entities
- [ ] Load entities into source table
- [ ] Validate data completeness

#### Path B: Entities Already Exist
- [ ] Verify entities are complete and up-to-date
- [ ] Proceed to image validation

### Step 4: Entity Image Management

#### Check Entity Images
- [ ] Verify all entities have images in storage
- [ ] If missing images:

##### Client Image Support
- **Does client support image URLs & sync?**
  - YES → Sync images from client
  - NO → Create image upload method

##### Image Upload Process
- [ ] Create method to fetch entity images
- [ ] Upload all entity images to storage
- [ ] Update entity records with storage URLs

### Step 5: Grid Entities Query Setup

#### DBT Configuration
- [ ] Develop grid entities query
- [ ] Add query to DBT project
- [ ] Test query output
- [ ] Ensure proper attribute mapping

### Step 6: Attribute Images

#### Validate Attribute Images
- [ ] Check if all image-based attributes have images in storage
- [ ] If missing:
  - [ ] Write script to upload attribute images
  - [ ] Execute upload script
  - [ ] Verify all images uploaded

### Step 7: Testing

#### UI Testing
- [ ] Test grid in development environment
- [ ] Verify entity search functionality
- [ ] Test comparison logic (🟩🟨⬜)
- [ ] Check image loading
- [ ] Test game flow end-to-end
- [ ] Mobile responsiveness check

#### Issue Resolution
- **Everything looks good?**
  - YES → Proceed to deployment
  - NO → Fix identified issues and retest

### Step 8: Deployment

#### Pre-deployment Checklist
- [ ] All entities loaded with images
- [ ] Grid entities query in DBT
- [ ] All attribute images uploaded
- [ ] Testing complete
- [ ] Daily targets configured (30+ days)

#### Deploy Steps
- [ ] Set `is_active = true` in grids table
- [ ] Deploy code changes
- [ ] Verify grid appears in production
- [ ] Monitor initial usage

## Technical Details

### Database Tables

1. **grids** - Grid metadata
2. **grid_entities** - Entities for each grid
3. **daily_targets** - Daily puzzle targets
4. **Source tables** - `src_[grid_name]` for raw entity data

### Storage Structure

```
/grids/
  /[grid-id]/
    grid-icon.png
    /entities/
      [entity-id].png
    /attributes/
      [attribute-name]/
        [value].png
```

### Client Architecture

Clients are responsible for:
- Fetching entity data from external sources
- Providing entity images
- Keeping data synchronized

### DBT Queries

Grid entities queries should:
- Select from appropriate source tables
- Map attributes correctly
- Include all required fields
- Handle data transformations

## Common Issues & Solutions

### Missing Images
- Ensure client has image URL support
- Check storage permissions
- Verify image format compatibility

### Query Errors
- Validate source table schema
- Check attribute mappings
- Test with sample data

### UI Display Issues
- Verify image URLs are accessible
- Check comparison logic implementation
- Test with various screen sizes

## Post-Launch

### Monitoring
- [ ] Track completion rates
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Check image loading performance

### Maintenance
- [ ] Update entities as needed
- [ ] Add new daily targets monthly
- [ ] Refresh entity images if updated
- [ ] Adjust difficulty based on metrics

## Example Implementation

### NBA Players Grid
1. Created grid model with basketball theme
2. Used existing NBA client
3. Added method to fetch current players
4. Uploaded team logos as attribute images
5. Created DBT query joining players with teams
6. Tested with various player comparisons
7. Deployed with 60 days of targets

## Documentation

- Update this playbook with lessons learned
- Document any custom logic in code comments
- Add grid-specific notes to grid configuration