# UI/UX Implementation Guide - Coaxial Academy

## 📌 Quick Start

This guide helps you understand and maintain the new unified design system implemented across the Coaxial Academy frontend.

---

## 🎨 Design System Usage

### Using Color Variables

**Always use CSS custom properties instead of hardcoded colors:**

```css
/* ❌ Bad - Hardcoded colors */
.my-button {
  background: #1976D2;
  color: #ffffff;
}

/* ✅ Good - Using design system */
.my-button {
  background: var(--primary-blue);
  color: var(--white);
}
```

**Available Color Variables:**

```css
/* Primary Colors */
var(--primary-blue)           /* #1976D2 - Main brand color */
var(--primary-blue-dark)      /* #1565C0 - Hover states */
var(--primary-blue-light)     /* #42A5F5 - Highlights */
var(--light-blue)             /* #E3F2FD - Backgrounds */

/* Accent Colors */
var(--accent-orange)          /* #FF9800 - CTAs */
var(--accent-orange-dark)     /* #F57C00 - Hover */
var(--light-orange)           /* #FFF3E0 - Backgrounds */

/* Status Colors */
var(--success)                /* #10b981 - Success */
var(--warning)                /* #f59e0b - Warnings */
var(--error)                  /* #ef4444 - Errors */
var(--info)                   /* #3b82f6 - Info */

/* Grays */
var(--gray-50) through var(--gray-900)
var(--white)
```

---

### Using Spacing Variables

**Consistent spacing throughout:**

```css
/* ❌ Bad - Magic numbers */
.my-element {
  padding: 16px 24px;
  margin-bottom: 12px;
}

/* ✅ Good - Using spacing scale */
.my-element {
  padding: var(--spacing-4) var(--spacing-6);
  margin-bottom: var(--spacing-3);
}
```

**Spacing Scale:**
- `--spacing-1`: 4px
- `--spacing-2`: 8px
- `--spacing-3`: 12px
- `--spacing-4`: 16px
- `--spacing-5`: 20px
- `--spacing-6`: 24px
- `--spacing-8`: 32px
- `--spacing-10`: 40px
- `--spacing-12`: 48px

---

### Using Utility Classes

The design system includes Tailwind-style utility classes:

```jsx
// ❌ Bad - Inline styles
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>

// ✅ Good - Utility classes
<div className="flex gap-4 p-6">
```

**Common Utilities:**

```css
/* Flexbox */
.flex, .flex-col, .items-center, .justify-between

/* Spacing */
.p-4, .px-6, .py-3, .m-4, .mt-6, .mb-4

/* Typography */
.text-sm, .text-lg, .font-semibold, .text-center

/* Colors */
.text-blue-600, .bg-gray-50, .text-white

/* Display */
.hidden, .block, .mobile-hidden, .desktop-hidden

/* Borders */
.rounded, .rounded-lg, .border, .shadow-md
```

---

## 🔧 Component Patterns

### Creating a Button

```jsx
// ❌ Bad - Inline styles
<button style={{ 
  padding: '12px 24px', 
  background: '#1976D2',
  color: 'white' 
}}>
  Click Me
</button>

// ✅ Good - Using classes
<button className="btn btn-primary">
  Click Me
</button>

// ✅ Good - With variants
<button className="btn btn-primary btn-sm">Small Button</button>
<button className="btn btn-outline">Outline Button</button>
<button className="btn btn-danger">Delete Button</button>
```

**Available Button Classes:**
- `.btn` - Base button
- `.btn-primary` - Blue primary button
- `.btn-secondary` - Gray secondary button
- `.btn-outline` - Outlined button
- `.btn-danger` - Red danger button
- `.btn-success` - Green success button
- `.btn-warning` - Orange warning button
- `.btn-sm` - Small size
- `.btn-lg` - Large size
- `.btn-xs` - Extra small
- `.btn-icon` - Icon-only button
- `.btn-full` - Full width

---

### Creating a Card

```jsx
// ✅ Standard card
<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-body">
    <p>Card content goes here</p>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">Action</button>
  </div>
</div>
```

---

### Creating a Form

```jsx
// ✅ Standard form
<div className="form-section">
  <div className="form-header">
    <h3>Form Title</h3>
  </div>
  
  <form className="master-data-form">
    <div className="form-row">
      <div className="form-group">
        <label className="form-label">First Name</label>
        <input type="text" className="form-input" />
      </div>
      
      <div className="form-group">
        <label className="form-label">Last Name</label>
        <input type="text" className="form-input" />
      </div>
    </div>
    
    <div className="form-row full-width">
      <div className="form-group">
        <label className="form-label">Email</label>
        <input type="email" className="form-input" />
        <span className="form-help">We'll never share your email</span>
      </div>
    </div>
    
    <div className="form-actions">
      <button type="button" className="btn btn-secondary">Cancel</button>
      <button type="submit" className="btn btn-primary">Submit</button>
    </div>
  </form>
</div>
```

---

### Creating a Modal

```jsx
// ✅ Standard modal
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h3>Modal Title</h3>
      <button className="modal-close" onClick={onClose}>×</button>
    </div>
    
    <div className="modal-body">
      <p>Modal content goes here</p>
    </div>
    
    <div className="modal-footer">
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={onSubmit}>Confirm</button>
    </div>
  </div>
</div>
```

---

### Creating Dynamic Styled Elements

When you need dynamic values (heights, colors, etc.), use CSS custom properties:

```jsx
// ✅ Good - Dynamic values with CSS custom properties
<div 
  className="progress-bar"
  style={{ 
    '--progress-width': `${percentage}%`,
    '--progress-color': getColor(percentage)
  }}
/>
```

```css
/* In your CSS file */
.progress-bar {
  width: var(--progress-width, 0);
  background: var(--progress-color, var(--primary-blue));
  height: 8px;
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

---

## 📱 Mobile-First Development

### Responsive Design Principles

**Always design for mobile first, then enhance for larger screens:**

```css
/* ✅ Mobile-first approach */
.my-grid {
  grid-template-columns: 1fr; /* Mobile: single column */
}

@media (min-width: 768px) {
  .my-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .my-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 columns */
  }
}
```

### Touch Targets

**All interactive elements must be at least 44x44px:**

```css
.my-button {
  min-width: 44px;
  min-height: 44px;
  /* ... other styles */
}
```

### Mobile Scrolling

**For horizontal scrolling on mobile:**

```css
.scrollable-tabs {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Smooth iOS scrolling */
  scrollbar-width: thin;
  flex-wrap: nowrap;
}

.scrollable-tabs > * {
  flex-shrink: 0; /* Prevent items from shrinking */
}
```

---

## 🎯 Common Patterns

### Loading State

```jsx
<div className="loading-state">
  <div className="spinner-lg"></div>
  <p>Loading...</p>
</div>
```

### Empty State

```jsx
<div className="empty-state">
  <div className="empty-icon">📭</div>
  <h4>No Items Found</h4>
  <p>Try adjusting your filters or adding new items</p>
  <button className="btn btn-primary">Add New Item</button>
</div>
```

### Alert/Notification

```jsx
<div className="alert alert-success">
  <span>✓</span>
  <span>Successfully saved!</span>
</div>

<div className="alert alert-error">
  <span>✕</span>
  <span>An error occurred. Please try again.</span>
</div>
```

### Status Badge

```jsx
<span className="badge badge-success">Active</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-error">Failed</span>
<span className="status completed">Completed</span>
```

### Responsive Table

```jsx
<div className="table-responsive">
  <table className="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td>Student</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Use Inline Styles

```jsx
// ❌ Bad
<div style={{ padding: '20px', background: 'white' }}>

// ✅ Good
<div className="p-6 bg-white">
```

### ❌ Don't Hardcode Colors

```css
/* ❌ Bad */
.my-element {
  color: #1976D2;
  background: #FF9800;
}

/* ✅ Good */
.my-element {
  color: var(--primary-blue);
  background: var(--accent-orange);
}
```

### ❌ Don't Use Pixel Values for Spacing

```css
/* ❌ Bad */
.my-element {
  margin-bottom: 24px;
  padding: 16px 32px;
}

/* ✅ Good */
.my-element {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4) var(--spacing-8);
}
```

### ❌ Don't Forget Mobile Touch Targets

```css
/* ❌ Bad - Too small for touch */
.icon-button {
  width: 24px;
  height: 24px;
}

/* ✅ Good - Proper touch target */
.icon-button {
  min-width: 44px;
  min-height: 44px;
  padding: var(--spacing-2);
}
```

---

## 🔍 Debugging Guide

### Issue: Colors Don't Match

**Check:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Verify CSS file is loaded in browser DevTools
3. Check for !important overrides
4. Ensure CSS custom property is defined in :root

### Issue: Mobile Layout Broken

**Check:**
1. Responsive breakpoints are correct
2. Grid template columns collapse properly
3. Overflow-x: auto is set for scrollable elements
4. Touch targets are minimum 44x44px

### Issue: Inline Styles Not Working

**Remember:**
- CSS custom properties work in inline styles
- Use className for static styles
- Use style only for truly dynamic values

---

## 📚 File Organization

### CSS File Structure

```
src/
├── App.css                          ← Main design system (DO NOT DELETE)
├── index.css                        ← Imports design system
├── components/
│   ├── Header.css                   ← Header-specific styles
│   ├── Footer.css                   ← Footer-specific styles
│   ├── Sidebar.css                  ← Sidebar-specific styles
│   ├── Dashboard.css                ← Dashboard layouts
│   ├── Layout.css                   ← Main layout wrapper
│   ├── master-data/
│   │   ├── StudentDashboard.css     ← Student dashboard (large file)
│   │   ├── StudentHomeDashboard.css ← Student home
│   │   ├── StudentProgressTracker.css
│   │   ├── StudentQuestionCard.css  ← NEW FILE (created)
│   │   └── ...
│   └── pricing/
│       └── pricing.css              ← Pricing components
```

### Import Order

In your component JS files:

```javascript
// 1. React imports
import React, { useState } from 'react';

// 2. Third-party imports
import { useNavigate } from 'react-router-dom';

// 3. Context/hooks
import { useApp } from '../context/AppContext';

// 4. CSS imports (component-specific LAST)
import './MyComponent.css';
```

---

## 🎯 Adding New Components

### Step 1: Plan Your Component

- What's the primary purpose?
- Does it need responsive design?
- What colors will it use?
- What interactive elements does it have?

### Step 2: Use Design System First

Before creating custom CSS, check if these exist:
- `.btn` variants for buttons
- `.card` for card layouts
- `.form-*` for form elements
- `.modal` for modals
- Utility classes for spacing/layout

### Step 3: Create Component CSS (If Needed)

```css
/* MyComponent.css */

/* Use design system variables */
.my-component {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.my-component:hover {
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

/* Responsive */
@media (max-width: 768px) {
  .my-component {
    padding: var(--spacing-4);
  }
}
```

### Step 4: Ensure Accessibility

```css
.my-button {
  min-width: 44px;
  min-height: 44px;
}

.my-button:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

---

## 🔄 Migration Checklist

When updating an existing component:

- [ ] Import component CSS file
- [ ] Replace inline styles with className
- [ ] Use CSS custom properties for dynamic values
- [ ] Replace hardcoded colors with variables
- [ ] Replace hardcoded spacing with variables
- [ ] Ensure touch targets are 44x44px minimum
- [ ] Test on mobile (320px, 480px, 768px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Check accessibility (keyboard navigation, focus states)
- [ ] Hard refresh browser to test

---

## 💡 Pro Tips

### Dynamic Values

Use CSS custom properties for dynamic styling:

```jsx
// Component
<div 
  className="chart-bar" 
  style={{ 
    '--bar-height': `${percentage}%`,
    '--bar-color': getColor(score)
  }}
/>
```

```css
/* CSS */
.chart-bar {
  height: var(--bar-height, 0);
  background: var(--bar-color, var(--primary-blue));
}
```

### Gradients

Always use standard gradient format:

```css
/* ✅ Good - Using design system colors */
background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%);
```

### Shadows

Use predefined shadow values:

```css
box-shadow: var(--shadow-sm);   /* Subtle */
box-shadow: var(--shadow-md);   /* Standard */
box-shadow: var(--shadow-lg);   /* Elevated */
box-shadow: var(--shadow-xl);   /* Dramatic */
```

### Transitions

Use consistent transition timing:

```css
transition: all var(--transition-fast);    /* 150ms - Quick interactions */
transition: all var(--transition-normal);  /* 250ms - Standard */
transition: all var(--transition-slow);    /* 350ms - Dramatic effects */
```

---

## 🧪 Testing Your Changes

### Desktop Testing

```bash
# 1. Start development server
npm start

# 2. Open browser
# Visit http://localhost:3000

# 3. Test at different widths
# - 1920px (large desktop)
# - 1440px (laptop)
# - 1024px (small laptop)
```

### Mobile Testing

**Using Chrome DevTools:**
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Test on:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)

**Real Device Testing:**
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start dev server: `npm start`
3. Access from mobile: `http://YOUR_IP:3000`

---

## 🐛 Troubleshooting

### Styles Not Applying

**Check:**
1. CSS file is imported in component
2. ClassName is spelled correctly
3. No typos in CSS custom property names
4. CSS specificity isn't being overridden
5. Browser cache is cleared (hard refresh)

### Mobile Layout Broken

**Check:**
1. Responsive breakpoints are correct
2. Flex/Grid items have proper sizing
3. Overflow is handled (overflow-x: auto)
4. Touch targets are proper size
5. Viewport meta tag is present in index.html

### Colors Look Wrong

**Check:**
1. Using `var(--color-name)` not hardcoded hex
2. CSS custom property is defined in `App.css :root`
3. No inline styles overriding
4. Browser isn't in high contrast mode

---

## 📖 Reference

### All Available CSS Classes

See `src/App.css` for complete list:
- Layout: `.container`, `.grid`, `.flex`
- Typography: `.text-*`, `.font-*`
- Spacing: `.p-*`, `.m-*`, `.px-*`, `.py-*`
- Colors: `.text-*`, `.bg-*`
- Borders: `.border`, `.rounded-*`
- Shadows: `.shadow-*`
- Buttons: `.btn`, `.btn-*`
- Forms: `.form-*`
- Cards: `.card`, `.card-*`
- Modals: `.modal`, `.modal-*`
- Tables: `.table`
- Alerts: `.alert`, `.alert-*`
- Badges: `.badge`, `.badge-*`
- Status: `.status`, `.status-*`
- Utilities: `.hidden`, `.w-full`, `.cursor-pointer`

### Responsive Utilities

```css
.mobile-hidden    /* Hidden on ≤768px */
.desktop-hidden   /* Hidden on >768px */
.mobile-block     /* Block on ≤768px */
.mobile-flex      /* Flex on ≤768px */
```

---

## 🎓 Best Practices

1. **Use the Design System** - Don't reinvent the wheel
2. **Mobile First** - Start with mobile, enhance for desktop
3. **Touch Targets** - Minimum 44x44px for all interactive elements
4. **Consistent Colors** - Use CSS custom properties
5. **Semantic HTML** - Use proper HTML5 elements
6. **Accessibility** - Add ARIA labels, focus states
7. **Performance** - Use transform for animations
8. **Testing** - Test on real devices when possible

---

## 🚀 Next Steps

1. Review the changes in your browser
2. Test on mobile device (critical!)
3. Check all user flows (login, logout, navigation)
4. Verify colors are consistent
5. Ensure touch targets work well
6. Get user feedback

---

**Need Help?**
- Check `UI_UX_IMPROVEMENTS_SUMMARY.md` for detailed changes
- Review `src/App.css` for all available utilities
- Look at existing components for patterns
- Test thoroughly on multiple devices

---

**Last Updated:** October 15, 2025
**Version:** 1.0

