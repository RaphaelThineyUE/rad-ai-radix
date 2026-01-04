import express from 'express';
import { body, validationResult } from 'express-validator';
import Patient from '../models/Patient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all patients with filters and sorting
router.get('/', async (req, res) => {
  try {
    const { stage, cancer_type, sort_by, sort_order } = req.query;
    
    const filter = { created_by: req.user.email };
    
    if (stage) filter.cancer_stage = stage;
    if (cancer_type) filter.cancer_type = new RegExp(cancer_type, 'i');

    let query = Patient.find(filter);

    if (sort_by) {
      const order = sort_order === 'desc' ? -1 : 1;
      query = query.sort({ [sort_by]: order });
    } else {
      query = query.sort({ created_date: -1 });
    }

    const patients = await query;
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create patient
router.post('/',
  [
    body('full_name').trim().notEmpty(),
    body('date_of_birth').isISO8601(),
    body('gender').isIn(['Male', 'Female', 'Other']),
    body('diagnosis_date').isISO8601(),
    body('cancer_type').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const patient = new Patient({
        ...req.body,
        created_by: req.user.email
      });

      await patient.save();
      res.status(201).json(patient);
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      created_by: req.user.email
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update patient
router.patch('/:id', async (req, res) => {
  try {
    const allowedUpdates = [
      'full_name', 'date_of_birth', 'gender', 'ethnicity',
      'diagnosis_date', 'cancer_type', 'cancer_stage', 'tumor_size_cm',
      'lymph_node_positive', 'er_status', 'pr_status', 'her2_status',
      'menopausal_status', 'initial_treatment_plan'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user.email },
      updates,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user.email
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
