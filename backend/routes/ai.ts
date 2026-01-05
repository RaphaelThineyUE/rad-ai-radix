import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { analyzeReport, generateSummary, consolidateReports, compareTreatments } from '../services/aiService.js';
import RadiologyReport from '../models/RadiologyReport.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Analyze report
router.post('/analyze-report',
  [body('pdf_text').notEmpty()],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pdf_text } = req.body;
      const analysis = await analyzeReport(pdf_text);
      
      res.json(analysis);
    } catch (error) {
      console.error('Analyze report error:', error);
      res.status(500).json({ error: 'Server error during analysis' });
    }
  }
);

// Generate summary
router.post('/generate-summary',
  [body('extracted_data').notEmpty()],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { extracted_data } = req.body;
      const summary = await generateSummary(extracted_data);
      
      res.json({ summary });
    } catch (error) {
      console.error('Generate summary error:', error);
      res.status(500).json({ error: 'Server error generating summary' });
    }
  }
);

// Consolidate reports
router.post('/consolidate-reports',
  [body('patient_id').notEmpty()],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patient_id } = req.body;

      // Get all completed reports for this patient
      const reports = await RadiologyReport.find({
        patient_id,
        created_by: req.user?.email,
        status: 'completed'
      }).sort({ created_date: 1 });

      if (reports.length < 2) {
        return res.status(400).json({ error: 'At least 2 completed reports are required' });
      }

      const consolidation = await consolidateReports(reports);
      
      res.json({
        ...consolidation,
        report_count: reports.length,
        date_range: {
          first: reports[0].created_date,
          last: reports[reports.length - 1].created_date
        }
      });
    } catch (error) {
      console.error('Consolidate reports error:', error);
      res.status(500).json({ error: 'Server error during consolidation' });
    }
  }
);

// Compare treatments
router.post('/compare-treatments',
  [
    body('patient_id').notEmpty(),
    body('treatment_options').isArray({ min: 1, max: 5 })
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { patient_id, treatment_options } = req.body;

      // Get patient data
      const patient = await Patient.findOne({
        _id: patient_id,
        created_by: req.user?.email
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      const patientData = {
        cancer_stage: patient.cancer_stage,
        cancer_type: patient.cancer_type,
        er_status: patient.er_status,
        pr_status: patient.pr_status,
        her2_status: patient.her2_status,
        tumor_size_cm: patient.tumor_size_cm,
        lymph_node_positive: patient.lymph_node_positive,
        menopausal_status: patient.menopausal_status,
        age: Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      };

      const comparison = await compareTreatments(patientData, treatment_options);
      
      res.json(comparison);
    } catch (error) {
      console.error('Compare treatments error:', error);
      res.status(500).json({ error: 'Server error during treatment comparison' });
    }
  }
);

export default router;
