# Enhanced Question Filtering System

## Overview

The Enhanced Question Filtering System provides a comprehensive, multi-criteria filtering interface for educational platforms with advanced search capabilities, responsive design, and intuitive user experience.

## Features

### 🎯 Core Features
- **Advanced Filter Panel**: Collapsible sections with clear organization
- **Multi-Criteria Filtering**: Basic, Academic, Exam Suitability, Previously Asked, and Search filters
- **Real-time Search**: Debounced search with instant results
- **Filter Presets**: Save and load frequently used filter combinations
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **URL Synchronization**: Shareable filter links
- **Bulk Actions**: Select and perform actions on multiple questions

### 🔧 Technical Features
- **State Management**: Centralized filter state with useReducer
- **Performance**: Debounced API calls, virtual scrolling ready
- **Accessibility**: Full keyboard navigation and screen reader support
- **Progressive Disclosure**: Advanced options revealed when needed
- **Error Handling**: Graceful fallbacks and user feedback

## Component Structure

```
QuestionFilters/
├── QuestionFilters.js (Main container)
├── FilterPanel.js (Collapsible sidebar)
├── sections/
│   ├── BasicFilters.js
│   ├── AcademicLevelFilters.js
│   ├── ExamSuitabilityFilters.js
│   ├── PreviouslyAskedFilters.js
│   └── SearchDateFilters.js
├── controls/
│   ├── FilterPresets.js
│   └── FilterActions.js
├── QuestionResults.js
└── BulkActions.js
```

## Usage

### Basic Implementation

```jsx
import QuestionFilters from './filters/QuestionFilters';

function App() {
  const handleBackToDashboard = () => {
    // Navigate back to dashboard
  };

  return (
    <QuestionFilters onBackToDashboard={handleBackToDashboard} />
  );
}
```

### State Management

The system uses a centralized state management approach:

```javascript
const initialFilterState = {
  basic: {
    isActive: null,
    questionType: '',
    difficultyLevels: [],
    minMarks: 1,
    maxMarks: 10
  },
  academic: {
    courseTypeId: null,
    relationshipId: null,
    subjectId: null,
    topicId: null,
    moduleId: null,
    chapterId: null
  },
  examSuitability: {
    examIds: [],
    suitabilityLevels: [],
    examTypes: [],
    conductingBodies: []
  },
  previouslyAsked: {
    examIds: [],
    appearedYears: [],
    sessions: [],
    minMarksInExam: null,
    maxMarksInExam: null,
    questionNumbers: []
  },
  searchDate: {
    questionTextSearch: '',
    explanationSearch: '',
    dateFrom: null,
    dateTo: null,
    page: 0,
    size: 20
  }
};
```

### API Integration

The system expects a POST endpoint for filtering:

```javascript
const requestPayload = {
  // Basic filters
  isActive: true,
  questionType: "MULTIPLE_CHOICE",
  difficultyLevels: ["EASY", "MEDIUM"],
  minMarks: 1,
  maxMarks: 5,
  
  // Academic filters
  courseTypeId: 1,
  courseId: 123,
  relationshipId: 456,
  subjectId: 789,
  topicId: 101,
  moduleId: 202,
  chapterId: 303,
  
  // Exam suitability
  examIds: [1, 2, 3],
  suitabilityLevels: ["HIGH", "MEDIUM"],
  examTypes: ["ENTRANCE", "COMPETITIVE"],
  conductingBodies: [1, 2],
  
  // Previously asked
  appearedYears: [2023, 2024],
  sessions: ["JEE Main 2023", "NEET 2024"],
  minMarksInExam: 2,
  maxMarksInExam: 4,
  questionNumbers: ["Q1", "Q25"],
  
  // Search & date
  questionTextSearch: "derivative",
  explanationSearch: "calculus",
  dateFrom: "2023-01-01",
  dateTo: "2024-12-31",
  page: 0,
  size: 20
};
```

## Customization

### Styling

The system uses CSS custom properties for easy theming:

```css
:root {
  --filter-primary: #3b82f6;
  --filter-secondary: #6b7280;
  --filter-success: #10b981;
  --filter-warning: #f59e0b;
  --filter-error: #ef4444;
  
  --filter-bg: #ffffff;
  --filter-surface: #f9fafb;
  --filter-border: #e5e7eb;
  
  --filter-radius-sm: 0.375rem;
  --filter-radius-md: 0.5rem;
  --filter-radius-lg: 0.75rem;
  
  --filter-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --filter-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### Custom Hooks

#### useFilterURLSync
Synchronizes filter state with URL parameters:

```javascript
import { useFilterURLSync } from '../hooks/useFilterURLSync';

const { syncFiltersToURL, loadFiltersFromURL } = useFilterURLSync();
```

#### useFilterPresets
Manages filter presets with localStorage:

```javascript
import { useFilterPresets } from '../hooks/useFilterPresets';

const { 
  savedPresets, 
  savePreset, 
  loadPreset, 
  deletePreset 
} = useFilterPresets();
```

## Responsive Behavior

### Desktop (>1024px)
- Fixed sidebar with main content area
- Full feature set available
- Hover states and animations

### Tablet (768px-1024px)
- Slide-out panel overlay
- Two-column layout
- Touch-optimized interactions

### Mobile (<768px)
- Full-screen modal overlay
- Accordion-style sections
- Simplified interactions
- Swipe gestures support

## Performance Considerations

### Debounced Search
Search inputs are debounced by 300ms to prevent excessive API calls:

```javascript
const debouncedSearch = useCallback(
  debounce((searchTerm) => {
    // API call
  }, 300),
  []
);
```

### Virtual Scrolling
For large result sets, implement virtual scrolling:

```javascript
const VirtualizedQuestionList = ({ questions }) => {
  // Implementation for 1000+ questions
};
```

### Lazy Loading
Dropdown options are loaded on-demand:

```javascript
const LazyDropdown = ({ endpoint, dependencies }) => {
  // Load options only when needed
};
```

## Accessibility

### Keyboard Navigation
- Full keyboard navigation support
- Tab order follows logical flow
- Escape key closes modals and dropdowns

### Screen Reader Support
- ARIA labels and descriptions
- Semantic HTML structure
- Live regions for dynamic content

### High Contrast Mode
- CSS media query support
- Increased border widths
- Enhanced color contrast

### Reduced Motion
- Respects `prefers-reduced-motion`
- Disables animations when requested
- Maintains functionality

## Error Handling

### API Errors
- Graceful fallbacks to cached data
- User-friendly error messages
- Retry mechanisms for failed requests

### Validation
- Real-time form validation
- Clear error indicators
- Helpful validation messages

### Loading States
- Skeleton loaders for content
- Progress indicators for actions
- Disabled states during operations

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- CSS Grid and Flexbox
- CSS Custom Properties
- ES6+ JavaScript features
- Fetch API
- Local Storage

## Integration Guide

### 1. Installation
Copy the `filters` directory to your project and ensure all dependencies are installed.

### 2. Dependencies
- React 16.8+ (hooks support)
- React Router (for URL synchronization)
- Context API (for authentication)

### 3. API Endpoints
Implement the following endpoints:
- `POST /api/admin/master-data/questions/filter`
- `GET /api/admin/master-data/course-types`
- `GET /api/admin/master-data/courses`
- `GET /api/public/master-exams/kv`
- `GET /api/public/years/kv`

### 4. Context Setup
Ensure your app has the required context:

```javascript
const AppContext = {
  token: 'auth-token',
  addNotification: (notification) => { /* implementation */ }
};
```

### 5. Routing
Add the component to your routing:

```javascript
import QuestionFilters from './components/master-data/filters/QuestionFilters';

<Route path="/questions/filter" component={QuestionFilters} />
```

## Troubleshooting

### Common Issues

1. **Filters not applying**
   - Check API endpoint configuration
   - Verify request payload format
   - Check network tab for errors

2. **URL sync not working**
   - Ensure React Router is properly configured
   - Check for conflicting route parameters
   - Verify hook dependencies

3. **Presets not saving**
   - Check localStorage permissions
   - Verify browser storage limits
   - Check for JSON serialization issues

4. **Responsive issues**
   - Test on actual devices
   - Check viewport meta tag
   - Verify CSS media queries

### Debug Mode
Enable debug logging:

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Filter state:', filters);
  console.log('API request:', requestPayload);
}
```

## Contributing

### Code Style
- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Add comprehensive comments

### Testing
- Unit tests for utility functions
- Integration tests for components
- E2E tests for user workflows
- Accessibility testing

### Performance
- Monitor bundle size
- Optimize re-renders
- Implement lazy loading
- Use memoization where appropriate

## License

This enhanced question filtering system is part of the coaxial-frontend project and follows the same licensing terms.
