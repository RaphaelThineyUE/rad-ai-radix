import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import RadiologyReport from '../models/RadiologyReport.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { extractPDFText, analyzeReport } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      (cb as (error: Error | null, acceptFile: boolean) => void)(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes are protected
router.use(authMiddleware);

// Upload PDF file
router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      filename: req.file.originalname,
      file_url: fileUrl,
      file_size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Create report record
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { patient_id, filename, file_url, file_size } = req.body;

    if (!patient_id || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate filename for this patient
    const existingReport = await RadiologyReport.findOne({
      patient_id,
      filename
    });

    if (existingReport) {
      return res.status(400).json({ error: 'A report with this filename already exists for this patient' });
    }

    const report = new RadiologyReport({
      created_by: req.user?.email,
      patient_id,
      filename,
      file_url,
      file_size,
      status: 'pending'
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process report (extract text and analyze)
router.post('/process', async (req: AuthRequest, res) => {
  try {
    const { report_id } = req.body;

    if (!report_id) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    const report = await RadiologyReport.findOne({
      _id: report_id,
      created_by: req.user?.email
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update status to processing
    report.status = 'processing';
    await report.save();

    const startTime = Date.now();

    // Extract PDF text
    const filePath = path.join(__dirname, '..', report.file_url);
    const pdfText = await extractPDFText(filePath);
    
    if (!pdfText) {
      report.status = 'failed';
      await report.save();
      return res.status(400).json({ error: 'Failed to extract text from PDF' });
    }

    // Analyze with AI
    const analysis = await analyzeReport(pdfText);
    
    // Update report with analysis
    report.raw_text = pdfText;
    report.summary = analysis.summary;
    report.birads = analysis.birads;
    report.breast_density = analysis.breast_density;
    report.exam = analysis.exam;
    report.comparison = analysis.comparison;
    report.findings = analysis.findings;
    report.recommendations = analysis.recommendations;
    report.red_flags = analysis.red_flags;
    report.processing_time_ms = Date.now() - startTime;
    report.status = 'completed';

    await report.save();
    res.json(report);
  } catch (error) {
    console.error('Process report error:', error);
    
    // Try to update report status to failed
    if (req.body.report_id) {
      try {
        await RadiologyReport.findByIdAndUpdate(req.body.report_id, {
          status: 'failed'
        });
      } catch (updateError) {
        console.error('Failed to update report status:', updateError);
      }
    }
    
    res.status(500).json({ error: 'Server error during processing' });
  }
});

// Get all reports with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { patient_id, status } = req.query;
    
    const filter: Record<string, unknown> = { created_by: req.user?.email };
    
    if (patient_id) filter.patient_id = String(patient_id);
    if (status) filter.status = String(status);

    const reports = await RadiologyReport.find(filter)
      .populate('patient_id', 'full_name')
      .sort({ created_date: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const report = await RadiologyReport.findOne({
      _id: req.params.id,
      created_by: req.user?.email
    }).populate('patient_id', 'full_name');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update report
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const allowedUpdates = ['summary', 'birads', 'findings', 'recommendations', 'red_flags'];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const report = await RadiologyReport.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user?.email },
      updates,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete report
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const report = await RadiologyReport.findOne({
      _id: req.params.id,
      created_by: req.user?.email
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete the file if it exists
    if (report.file_url) {
      try {
        const filePath = path.join(__dirname, '..', report.file_url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    await RadiologyReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
