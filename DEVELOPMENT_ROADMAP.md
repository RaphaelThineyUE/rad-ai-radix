# Development Roadmap - Completing RadReport AI

This guide provides step-by-step instructions for completing the remaining features of the RadReport AI platform.

## Current State

✅ **Backend**: 100% complete and production-ready
✅ **Frontend Structure**: Authentication, routing, and basic pages complete
⏳ **Frontend Features**: UI components and data flow need implementation

## Phase 1: Core Report Upload Feature (Priority: HIGH)

### 1.1 File Dropzone Component

**File**: `frontend/src/components/reports/FileDropzone.tsx`

```tsx
import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function FileDropzone({ patientId, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file) => {
    if (!patientId) {
      toast.error('Please select a patient first');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload file
      const uploadData = await apiClient.uploadFile(file);
      
      // 2. Create report record
      const report = await apiClient.createReport({
        patient_id: patientId,
        filename: file.name,
        file_url: uploadData.file_url,
        file_size: uploadData.file_size
      });

      // 3. Process with AI
      await apiClient.processReport(report._id);
      
      toast.success('Report uploaded and processed successfully!');
      onUploadSuccess?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Implement drag and drop handlers
  // Implement click to browse
  // Show upload progress
  
  return (/* JSX */);
}
```

**Implementation Steps:**
1. Add drag and drop event handlers
2. Add file input with click trigger
3. Implement upload progress indicator
4. Add loading spinner during AI processing
5. Handle errors gracefully

### 1.2 Report Card Component

**File**: `frontend/src/components/reports/ReportCard.tsx`

```tsx
import { format } from 'date-fns';
import { FileText, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

function getBiradsColor(value) {
  if (value <= 2) return 'bg-birads-benign text-green-900';
  if (value === 3) return 'bg-birads-probably-benign text-yellow-900';
  if (value === 4) return 'bg-birads-suspicious text-orange-900';
  return 'bg-birads-malignant text-red-900';
}

export default function ReportCard({ report, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-pink-600" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">{report.filename}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(report.created_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {report.birads && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBiradsColor(report.birads.value)}`}>
            BI-RADS {report.birads.value}
          </span>
        )}
      </div>

      {report.red_flags && report.red_flags.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">{report.red_flags.length} red flags</span>
        </div>
      )}

      <div className="mt-3">
        <span className={`text-sm px-2 py-1 rounded-md ${
          report.status === 'completed' ? 'bg-green-100 text-green-800' :
          report.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          report.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {report.status}
        </span>
      </div>
    </motion.div>
  );
}
```

### 1.3 Report Detail Slide-Over

**File**: `frontend/src/components/reports/ReportDetail.tsx`

Use Radix UI Dialog component for slide-over panel. Display:
- Report header with close button
- Red flags alert (if any)
- BI-RADS assessment with gradient background
- Patient-friendly summary
- Exam information
- Findings with evidence quotes
- Recommendations
- Delete button with confirmation

### 1.4 Update Home Page

**File**: `frontend/src/pages/Home.tsx`

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import FileDropzone from '../components/reports/FileDropzone';
import ReportCard from '../components/reports/ReportCard';
import ReportDetail from '../components/reports/ReportDetail';

export default function Home() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients()
  });

  const { data: reports, refetch } = useQuery({
    queryKey: ['reports', selectedPatient],
    queryFn: () => apiClient.getReports({ 
      patient_id: selectedPatient 
    }),
    enabled: !!selectedPatient
  });

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {/* Patient Selection Dropdown */}
      {/* FileDropzone */}
      {/* Reports List */}
      {selectedReport && (
        <ReportDetail 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
```

## Phase 2: Patient Management (Priority: HIGH)

### 2.1 Add Patient Dialog

**File**: `frontend/src/components/patient/AddPatientDialog.tsx`

Use:
- Radix UI Dialog
- react-hook-form for validation
- date-fns for date handling

Fields:
- Full name (required)
- Date of birth (required, date picker)
- Gender (select)
- Ethnicity
- Diagnosis date (required)
- Cancer type (required)
- Cancer stage (select)
- Tumor size
- Biomarker statuses (ER, PR, HER2)
- Initial treatment plan

### 2.2 Patient List Implementation

**File**: `frontend/src/pages/PatientList.tsx`

Features:
- Search by name
- Filter by stage
- Filter by cancer type
- Sort options
- Table or card view
- Click to navigate to detail

### 2.3 Patient Detail Tabs

**File**: `frontend/src/pages/PatientDetail.tsx`

Tabs:
1. **Overview**: Demographics and biomarkers
2. **Timeline**: PatientTimeline component
3. **Treatments**: List of treatments with add button
4. **Reports**: List of reports for this patient
5. **Comparison**: TreatmentComparison component

## Phase 3: Analytics Dashboard (Priority: MEDIUM)

### 3.1 Analytics Page with Charts

**File**: `frontend/src/pages/PatientAnalytics.tsx`

Use Recharts for visualizations:

```tsx
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Age distribution chart
// Stage distribution pie chart
// Cancer type distribution
// Biomarker status charts
// Treatment outcomes
```

Data Processing:
```tsx
function processPatientData(patients) {
  const stageData = patients.reduce((acc, p) => {
    acc[p.cancer_stage] = (acc[p.cancer_stage] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(stageData).map(([stage, count]) => ({
    stage,
    count
  }));
}
```

### 3.2 Treatment Comparison Component

**File**: `frontend/src/components/patient/TreatmentComparison.tsx`

Features:
- Input form for up to 5 treatment options
- "Compare Treatments" button
- Loading state during AI processing
- Display comparison results in cards
- Show recommendation scores, benefits, side effects

## Phase 4: Advanced Features (Priority: MEDIUM)

### 4.1 Consolidated Report Analysis

**File**: `frontend/src/components/reports/ConsolidatedView.tsx`

Trigger: Button appears when patient has 2+ completed reports

Features:
- Modal dialog with scrollable content
- Aggregate statistics
- AI-generated consolidated summary
- List of individual reports included
- Export as JSON button

```tsx
async function handleConsolidate() {
  setLoading(true);
  try {
    const result = await apiClient.consolidateReports(patientId);
    setConsolidatedData(result);
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
}
```

### 4.2 Patient Timeline

**File**: `frontend/src/components/patient/PatientTimeline.tsx`

Display:
- Diagnosis date (starting point)
- Treatment events
- Report uploads
- Color-coded icons
- Days since diagnosis

Layout: Vertical timeline with connecting lines

## Phase 5: Testing Implementation

### 5.1 Backend Tests

Create tests for each route:

**File**: `backend/__tests__/patients.test.js`
```javascript
describe('Patient Routes', () => {
  test('GET /api/patients should return user patients', async () => {
    // Test implementation
  });

  test('POST /api/patients should create patient', async () => {
    // Test implementation
  });

  // ... more tests
});
```

Repeat for:
- `reports.test.js`
- `treatments.test.js`
- `ai.test.js`

### 5.2 Frontend E2E Tests

**File**: `frontend/tests/home.spec.js`
```javascript
test('should upload and process report', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Select patient
  await page.selectOption('select', { label: 'John Doe' });
  
  // Upload file
  await page.setInputFiles('input[type="file"]', './test-report.pdf');
  
  // Wait for processing
  await page.waitForSelector('text=completed');
  
  // Verify report appears
  await expect(page.locator('.report-card')).toBeVisible();
});
```

## Phase 6: Polish & Production

### 6.1 Error Handling

Add error boundaries:

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 6.2 Loading States

Add skeleton loaders using Tailwind:

```tsx
function ReportCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
```

### 6.3 Responsive Design

Add mobile-specific styles:

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### 6.4 Accessibility

- Add ARIA labels
- Ensure keyboard navigation
- Test with screen reader
- Check color contrast

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Protected routes redirect to login
- [ ] Patient creation works
- [ ] Patient list displays and filters
- [ ] PDF upload works
- [ ] AI processing completes
- [ ] Report detail opens
- [ ] Report deletion works with confirmation
- [ ] BI-RADS colors display correctly
- [ ] Consolidated analysis works (2+ reports)
- [ ] Treatment comparison works
- [ ] Analytics charts render
- [ ] Export functionality works
- [ ] Error messages display properly
- [ ] Loading states show during async operations
- [ ] Mobile layout works
- [ ] All forms validate properly

## Quick Win Features

If time is limited, prioritize these for maximum impact:

1. **FileDropzone + ReportCard** - Core functionality
2. **AddPatientDialog** - Essential for data entry
3. **ReportDetail** - View analysis results
4. **BI-RADS color coding** - Visual feedback
5. **Basic analytics** - Show value of the platform

## Resources

- **Radix UI Docs**: https://www.radix-ui.com/
- **React Hook Form**: https://react-hook-form.com/
- **Recharts**: https://recharts.org/
- **TailwindCSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Playwright**: https://playwright.dev/

## Getting Help

If stuck:
1. Check backend API responses in browser DevTools
2. Check console for JavaScript errors
3. Verify MongoDB connection
4. Check OpenAI API key is valid
5. Review error logs: `pm2 logs` or check terminal

## Estimated Timeline

- Phase 1: 2-3 days (core upload feature)
- Phase 2: 2 days (patient management)
- Phase 3: 2 days (analytics)
- Phase 4: 2 days (advanced features)
- Phase 5: 2 days (testing)
- Phase 6: 1-2 days (polish)

**Total: 11-13 days for complete implementation**

Good luck! The hard part (backend and infrastructure) is done. Now it's mostly connecting the UI to the API and making it look great! 🚀
