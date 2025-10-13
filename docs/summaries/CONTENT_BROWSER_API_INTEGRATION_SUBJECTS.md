# Content Browser - Subjects API Integration

## Date: October 10, 2025

## Overview
Integrated real API for loading subjects when a subscription is selected in the Content Browser.

## API Endpoint

### Get Entity Subjects
```
GET /api/student/subscriptions/entity-subjects
Query Parameters:
  - entityId: {number} (from subscription)
  - courseTypeId: {number} (from subscription)
Headers:
  - Authorization: Bearer {jwt_token}
```

**Full URL Example:**
```
http://localhost:8080/api/student/subscriptions/entity-subjects?entityId=1&courseTypeId=1
```

## Response Format

```json
{
  "courseTypeName": "Academic",
  "courseTypeId": 1,
  "subjects": [
    {
      "linkageId": 1,
      "subjectDescription": "Algebra, geometry, trigonometry, and basic calculus",
      "displayOrder": 0,
      "isActive": true,
      "subjectId": 107,
      "subjectName": "Mathematics"
    }
  ],
  "entityId": 1,
  "totalCount": 1
}
```

## Implementation

### 1. Service Function Added

**File:** `src/services/subscriptionService.js`

```javascript
export const getEntitySubjects = async (token, entityId, courseTypeId) => {
  const endpoint = `${API_BASE}/api/student/subscriptions/entity-subjects?entityId=${entityId}&courseTypeId=${courseTypeId}`;
  
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subjects: ${response.status}`);
  }
  
  return await response.json();
};
```

### 2. Component Integration

**File:** `src/components/master-data/StudentContentBrowser.js`

**Import Added:**
```javascript
import { getActiveSubscriptions, getEntitySubjects } from '../../services/subscriptionService';
```

**Updated loadContentForSubscription:**
```javascript
const loadContentForSubscription = async () => {
  if (!selectedSubscription || !token) return;

  try {
    setLoading(true);
    console.log('📥 Loading subjects for subscription:', selectedSubscription.entityName);
    
    // Call real API to get subjects
    const response = await getEntitySubjects(
      token,
      selectedSubscription.entityId,
      selectedSubscription.courseTypeId
    );
    
    console.log('📥 Subjects API response:', response);
    
    // Map API response to component format
    const subjects = (response.subjects || []).map(subject => ({
      id: subject.subjectId,
      linkageId: subject.linkageId,
      name: subject.subjectName,
      subjectName: subject.subjectName,
      description: subject.subjectDescription || 'No description available',
      // Mock data for now - will be replaced when we integrate progress tracking
      topicCount: 0,
      moduleCount: 0,
      chapterCount: 0,
      progress: 0,
      status: 'not-started'
    }));
    
    console.log(`✅ Loaded ${subjects.length} subjects`);
    
    setContentData(prev => ({
      ...prev,
      subjects: subjects
    }));

    // Reset selected path
    setSelectedPath({
      subjectId: null,
      topicId: null,
      moduleId: null,
      chapterId: null
    });

  } catch (error) {
    console.error('❌ Error loading subjects:', error);
    addNotification('Failed to load subjects: ' + error.message, 'error');
    setContentData(prev => ({
      ...prev,
      subjects: []
    }));
  } finally {
    setLoading(false);
  }
};
```

## Data Mapping

### API Response → Component State

```javascript
API Field              → Component Field
─────────────────────────────────────────
subjectId             → id
linkageId             → linkageId
subjectName           → name, subjectName
subjectDescription    → description
isActive              → (filter condition)
displayOrder          → (not used yet)

Placeholder (for future):
- topicCount: 0
- moduleCount: 0
- chapterCount: 0
- progress: 0
- status: 'not-started'
```

## Display in UI

**Subject Card Shows:**
- ✅ Subject name (from API)
- ✅ Subject description (from API)
- 📊 Topics count (placeholder: 0)
- 📦 Modules count (placeholder: 0)
- 📃 Chapters count (placeholder: 0)
- Progress bar (placeholder: 0%)

**Note:** Counts and progress are currently placeholders. They will be updated when we integrate the Topics/Modules/Chapters APIs.

## User Flow

```
1. Student logs in
   ↓
2. Navigate to Content Browser
   ↓
3. Active subscriptions load from API
   ↓
4. Student clicks subscription (e.g., "Grade 1")
   ↓
5. API call: GET /api/student/subscriptions/entity-subjects
   Parameters: entityId=1, courseTypeId=1
   ↓
6. Subjects display with real data
   ↓
7. Student sees subject names from backend
```

## Console Logs

**Success Flow:**
```
📥 Loading active subscriptions from API...
📥 Active subscriptions loaded: [...]
✅ Found 2 active subscriptions
(User clicks subscription)
📥 Loading subjects for subscription: Grade 1
📥 Subjects API response: {...}
✅ Loaded 4 subjects
```

**Error Flow:**
```
📥 Loading subjects for subscription: Grade 1
❌ Error loading subjects: Failed to fetch subjects: 401
(Shows error notification to user)
```

## Error Handling

✅ **No token:** Function returns early
✅ **No subscription:** Function returns early
✅ **API error:** Shows error notification + sets empty subjects
✅ **Invalid response:** Handles gracefully with empty array
✅ **Network error:** Catches and displays error message

## Testing Checklist

- [x] Service function created
- [x] Import added to component
- [x] API call integrated
- [x] Response mapping correct
- [x] Error handling implemented
- [x] Loading states work
- [x] Console logging for debugging
- [x] No linting errors
- [ ] Test with real backend (pending)
- [ ] Verify subjects display correctly (pending)

## Files Modified

1. **`src/services/subscriptionService.js`**
   - Added `getEntitySubjects()` function

2. **`src/components/master-data/StudentContentBrowser.js`**
   - Imported `getEntitySubjects`
   - Updated `loadContentForSubscription()` to use real API
   - Added response mapping
   - Enhanced error handling and logging

## Next Integration Steps

Once subjects are working, integrate in this order:

1. **Topics** - Load topics when subject is clicked
2. **Modules** - Load modules when topic is clicked
3. **Chapters** - Load chapters when module is clicked
4. **Progress Tracking** - Get actual progress data
5. **Chapter Content** - Load video/PDF URLs

## Current Status

✅ **Subscriptions** - Real API integrated
✅ **Subjects** - Real API integrated
⏳ **Topics** - Waiting for API details
⏳ **Modules** - Waiting for API details
⏳ **Chapters** - Waiting for API details

---

**Status:** ✅ Subjects API Integration Complete
**Ready for:** Backend testing with real data
**Next:** Provide Topics API when ready

