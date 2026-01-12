# Fabricator Revenue Assignment Features

## Overview
The Ehub Project Management system now includes comprehensive fabricator revenue assignment functionality, allowing supervisors and administrators to allocate project revenue to individual fabricators.

## Key Features

### 1. Revenue Assignment Management
- **Who can assign**: Admins and Supervisors
- **Where**: Project Details → Revenue Tab
- **Capabilities**:
  - Assign specific dollar amounts to each fabricator on a project
  - Visual percentage breakdown showing each fabricator's share
  - Real-time validation to ensure total doesn't exceed project revenue
  - Quick actions: "Split Equally" and "Clear All"

### 2. Enhanced Type Definitions
The `FabricatorBudget` interface now includes:
```typescript
{
  fabricatorId: string;
  allocatedAmount: number;
  spentAmount: number;
  allocatedRevenue: number; // NEW: Revenue assigned to this fabricator
  description: string;
}
```

### 3. Updated Components

#### FabricatorRevenueManager Component
- **Location**: `/components/projects/FabricatorRevenueManager.tsx`
- **Features**:
  - Project revenue overview (Total, Allocated, Remaining)
  - Individual revenue input for each fabricator
  - Percentage calculations
  - Validation and error handling
  - Success notifications
  - Quick action buttons

#### ProjectDetails Component
- **New Tab**: "Revenue" tab added to project details
- **Team Tab Enhancement**: Shows allocated revenue badges for each fabricator
- **Access Control**: Only admins and supervisors can see revenue details

#### RevenueOverview Component
- **Fabricator View**: 
  - Total allocated revenue summary card
  - Per-project revenue breakdown
  - Percentage share of each project
  - Visual highlighting of assigned revenue
- **Supervisor/Admin View**: Unchanged (full financial overview)

### 4. User Experience Improvements

#### For Supervisors/Admins:
1. Navigate to any project
2. Click the "Revenue" tab
3. Enter revenue amounts for each fabricator
4. Use "Split Equally" for equal distribution
5. Click "Save Revenue Allocations"

#### For Fabricators:
1. Navigate to Revenue section
2. See total allocated revenue across all projects
3. View detailed breakdown per project
4. Understand their percentage share of each project

### 5. Font Updates
- **New Font**: Archivo Black throughout the entire application
- **Import**: Google Fonts CDN
- **Application**: Applied to all elements via globals.css

## Data Flow

1. **Creation**: Projects created with empty fabricatorBudgets array
2. **Assignment**: Supervisor/Admin assigns revenue via FabricatorRevenueManager
3. **Storage**: Revenue data saved in project.fabricatorBudgets
4. **Display**: 
   - Admins/Supervisors see full breakdown in Project Details
   - Fabricators see their allocation in Revenue Overview

## Technical Implementation

### Files Modified:
- `/types/index.ts` - Added allocatedRevenue field
- `/styles/globals.css` - Added Archivo Black font
- `/components/projects/ProjectDetails.tsx` - Added Revenue tab and enhanced Team tab
- `/components/revenue/RevenueOverview.tsx` - Enhanced fabricator view with revenue details

### Files Created:
- `/components/projects/FabricatorRevenueManager.tsx` - New revenue management component

## Access Control

| Role | Can Assign Revenue | Can View Own Revenue | Can View All Revenue |
|------|-------------------|---------------------|---------------------|
| Admin | ✅ | ✅ | ✅ |
| Supervisor | ✅ (own projects) | ✅ | ✅ (own projects) |
| Fabricator | ❌ | ✅ | ❌ |
| Client | ❌ | ❌ | ❌ |

## Validation Rules

1. Total allocated revenue cannot exceed project revenue
2. Individual allocations must be positive numbers
3. Only admins and project supervisors can modify allocations
4. Changes are saved immediately to the database

## Future Enhancements

Potential additions for future releases:
- Revenue payment tracking
- Revenue distribution history
- Automated equal splits based on work hours
- Revenue milestone payments
- Tax and deduction calculations
- Payment status tracking
