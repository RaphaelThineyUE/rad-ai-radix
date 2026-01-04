# RadReport AI

A full-stack breast cancer radiology analysis platform with AI-powered insights.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- OpenAI API Integration
- PDF Processing (pdf-parse)
- OCR Support (Tesseract.js + pdf2pic) for scanned PDFs
- Multer for file uploads

### Frontend
- React 19 + Vite
- TailwindCSS for styling
- RadixUI components
- TanStack React Query
- React Router DOM
- Framer Motion animations
- Recharts for analytics

## Project Structure

```
rad-ai-radix/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── services/        # AI service integration
│   ├── uploads/         # PDF upload directory
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   ├── lib/         # API client
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/radreport-ai
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
UPLOAD_DIR=./uploads
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt

### Patient Management
- Create, read, update, and delete patients
- Track diagnosis date, cancer type, stage, and biomarkers
- Filter and sort patients

### Report Analysis
- Upload PDF radiology reports
- Automatic OCR for scanned PDFs using Tesseract.js
- Intelligent fallback: standard text extraction first, OCR if needed
- AI-powered extraction of:
  - BI-RADS assessment
  - Breast density
  - Findings and recommendations
  - Red flags
- Patient-friendly summaries
- Duplicate prevention

### Treatment Tracking
- Record treatment plans
- Track outcomes and side effects
- AI-powered treatment comparison

### Analytics
- Patient demographics
- Treatment outcomes
- Biomarker distributions

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update current user

### Patients (Protected)
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Reports (Protected)
- `POST /api/reports/upload` - Upload PDF file
- `POST /api/reports` - Create report record
- `POST /api/reports/process` - Process report with AI
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `PATCH /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Treatments (Protected)
- `GET /api/treatments` - List treatments
- `POST /api/treatments` - Create treatment
- `GET /api/treatments/:id` - Get treatment details
- `PATCH /api/treatments/:id` - Update treatment
- `DELETE /api/treatments/:id` - Delete treatment

### AI (Protected)
- `POST /api/ai/analyze-report` - Analyze report text
- `POST /api/ai/generate-summary` - Generate patient summary
- `POST /api/ai/consolidate-reports` - Consolidate multiple reports
- `POST /api/ai/compare-treatments` - Compare treatment options

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend E2E Tests
```bash
cd frontend
npm run test:e2e
```

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Input validation on all endpoints
- File upload validation (PDF only, 10MB limit)
- Protected routes with authentication middleware

## Medical Disclaimer

This tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding any medical concerns.

## License

MIT
