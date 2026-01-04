# Contributing to RadReport AI

Thank you for your interest in contributing to RadReport AI! This guide will help you get started.

## Development Setup

### Quick Start
```bash
./setup.sh
```

Or manual setup:
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
rad-ai-radix/
├── backend/              # Node.ts + Express API
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth and other middleware
│   ├── services/        # Business logic (AI service)
│   ├── __tests__/       # Jest tests
│   └── server.ts        # Express server
│
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── lib/         # Utilities (API client)
│   │   └── hooks/       # Custom React hooks
│   └── tests/           # Playwright E2E tests
│
└── docs/                # Documentation
```

## Code Style

### Backend (JavaScript)
- Use ES6 modules (`import/export`)
- Async/await for asynchronous code
- Express.ts routing conventions
- Mongoose for MongoDB
- Jest for testing

Example:
```javascript
// Good
import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Frontend (React + JSX)
- Functional components with hooks
- Component files use `.tsx` extension
- Use TailwindCSS for styling
- React Query for data fetching
- Framer Motion for animations

Example:
```jsx
// Good
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function MyComponent() {
  const [state, setState] = useState(null);
  
  const { data } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-xl"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

## Adding New Features

### Backend API Endpoint

1. **Create/Update Model** (if needed)
```javascript
// backend/models/NewModel.ts
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  field: { type: String, required: true },
  // ... more fields
});

export default mongoose.model('NewModel', schema);
```

2. **Create Route Handler**
```javascript
// backend/routes/newroutes.ts
import express from 'express';
import { authMiddleware } from '../middleware/auth.ts';
import Model from '../models/NewModel.ts';

const router = express.Router();

router.use(authMiddleware); // Protect all routes

router.get('/', async (req, res) => {
  // Implementation
});

export default router;
```

3. **Register Route in Server**
```javascript
// backend/server.ts
import newRoutes from './routes/newroutes.ts';
app.use('/api/newroutes', newRoutes);
```

4. **Add Tests**
```javascript
// backend/__tests__/newroutes.test.ts
import request from 'supertest';
import app from '../server.ts';

describe('New Routes', () => {
  test('should work', async () => {
    const res = await request(app).get('/api/newroutes');
    expect(res.status).toBe(200);
  });
});
```

### Frontend Component

1. **Create Component**
```jsx
// frontend/src/components/category/NewComponent.tsx
export default function NewComponent({ prop1, prop2 }) {
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
}
```

2. **Add to Parent**
```jsx
// Import and use in parent component
import NewComponent from '../components/category/NewComponent';

<NewComponent prop1="value" prop2={data} />
```

3. **Add E2E Test**
```javascript
// frontend/tests/newfeature.spec.ts
import { test, expect } from '@playwright/test';

test('new feature works', async ({ page }) => {
  await page.goto('/feature-page');
  await expect(page.locator('.component')).toBeVisible();
});
```

## Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- auth.test.ts   # Run specific test
```

### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e           # Run all E2E tests
npm run test:e2e -- --ui   # Run with UI
npm run test:e2e -- --debug # Debug mode
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `test/description` - Test additions/updates

### Commit Messages
Follow conventional commits:
- `feat: add patient timeline component`
- `fix: resolve upload duplicate detection`
- `docs: update API documentation`
- `test: add E2E tests for reports`
- `refactor: improve error handling`

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/my-feature
```

2. **Make Changes**
```bash
git add .
git commit -m "feat: add my feature"
```

3. **Push and Create PR**
```bash
git push origin feature/my-feature
```

4. **PR Checklist**
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated (if needed)
- [ ] No console errors
- [ ] Builds successfully
- [ ] All tests pass

## API Design Guidelines

### RESTful Conventions
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `GET /api/resources/:id` - Get resource
- `PATCH /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Response Format
```javascript
// Success
res.json({ data, message: 'Success' });

// Error
res.status(400).json({ error: 'Error message' });

// List with pagination
res.json({
  data: items,
  pagination: {
    page: 1,
    perPage: 20,
    total: 100
  }
});
```

### Authentication
Protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## UI/UX Guidelines

### Colors
- **Primary**: Pink/Rose gradient (`from-pink-600 to-rose-600`)
- **BI-RADS Colors**:
  - Benign (1-2): Green (`bg-birads-benign`)
  - Probably Benign (3): Yellow (`bg-birads-probably-benign`)
  - Suspicious (4): Orange (`bg-birads-suspicious`)
  - Malignant (5-6): Red (`bg-birads-malignant`)

### Spacing
- Cards: `p-6` or `p-8`
- Sections: `space-y-6` or `space-y-8`
- Grids: `gap-6`

### Borders
- Rounded: `rounded-xl` (12px) or `rounded-2xl` (16px)
- Shadows: `shadow-md` or `shadow-lg`

### Animations
Use Framer Motion for:
- Page transitions: fade + slide
- Card reveals: opacity + y-offset
- Modal entry: scale + opacity

## Common Tasks

### Adding a New Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/layout/Layout.tsx`

### Adding API Client Method
Update `frontend/src/lib/api.ts`:
```javascript
async newMethod(params) {
  return this.request('/endpoint', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}
```

### Adding Database Model
1. Create model in `backend/models/`
2. Import in route files
3. Add validation
4. Create migration (if needed)

## Debugging

### Backend Issues
```bash
# Check logs
npm run dev

# Test endpoint directly
curl http://localhost:5000/api/health

# Check MongoDB connection
mongo mongodb://localhost:27017/radreport-ai
```

### Frontend Issues
```bash
# Check browser console
# Open DevTools: F12

# Check network requests
# DevTools > Network tab

# Check React Query cache
# React Query DevTools (already configured)
```

## Resources

- [Express.ts Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [RadixUI Docs](https://www.radix-ui.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Playwright Docs](https://playwright.dev/)

## Getting Help

- Check documentation in `/docs` or root directory
- Review existing code for patterns
- Check GitHub issues
- Ask in project discussions

## License

MIT - See LICENSE file for details

---

Thank you for contributing to RadReport AI! 🎉
