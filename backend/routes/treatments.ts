import express from 'express';
import { body, validationResult } from 'express-validator';
import TreatmentRecord from '../models/TreatmentRecord.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get all treatments with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { patient_id } = req.query;
    
    const filter: Record<string, unknown> = { created_by: req.user?.email };
    
    if (patient_id) filter.patient_id = String(patient_id);

    const treatments = await TreatmentRecord.find(filter)
      .populate('patient_id', 'full_name')
      .sort({ treatment_start_date: -1 });

    res.json(treatments);
  } catch (error) {
    console.error('Get treatments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create treatment
router.post('/',
  [
    body('patient_id').notEmpty(),
    body('treatment_type').isIn(['Surgery', 'Chemotherapy', 'Radiation', 'Hormone Therapy', 'Targeted Therapy', 'Immunotherapy', 'Other']),
    body('treatment_start_date').isISO8601()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const treatment = new TreatmentRecord({
        ...req.body,
        created_by: req.user?.email
      });

      await treatment.save();
      
      const populatedTreatment = await TreatmentRecord.findById(treatment._id)
        .populate('patient_id', 'full_name');
      
      res.status(201).json(populatedTreatment);
    } catch (error) {
      console.error('Create treatment error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get single treatment
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const treatment = await TreatmentRecord.findOne({
      _id: req.params.id,
      created_by: req.user?.email
    }).populate('patient_id', 'full_name');

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json(treatment);
  } catch (error) {
    console.error('Get treatment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update treatment
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const allowedUpdates = [
      'treatment_type', 'treatment_start_date', 'treatment_end_date',
      'medication_details', 'treatment_outcome', 'side_effects', 'follow_up_date'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const treatment = await TreatmentRecord.findOneAndUpdate(
      { _id: req.params.id, created_by: req.user?.email },
      updates,
      { new: true, runValidators: true }
    ).populate('patient_id', 'full_name');

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json(treatment);
  } catch (error) {
    console.error('Update treatment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete treatment
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const treatment = await TreatmentRecord.findOneAndDelete({
      _id: req.params.id,
      created_by: req.user?.email
    });

    if (!treatment) {
      return res.status(404).json({ error: 'Treatment not found' });
    }

    res.json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    console.error('Delete treatment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
