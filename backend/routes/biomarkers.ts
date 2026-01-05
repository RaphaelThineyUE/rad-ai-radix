import express from 'express';
import BiomarkerRange from '../models/BiomarkerRange.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all biomarker ranges with optional demographic filters
router.get('/ranges', authMiddleware, async (req, res) => {
  try {
    const { age, sex } = req.query;
    
    const query: any = {};
    
    // Filter by demographics if provided
    if (age) {
      const ageNum = parseInt(age as string);
      query.$or = [
        { 'demographics.age_min': { $exists: false }, 'demographics.age_max': { $exists: false } },
        { 
          $and: [
            { $or: [{ 'demographics.age_min': { $lte: ageNum } }, { 'demographics.age_min': { $exists: false } }] },
            { $or: [{ 'demographics.age_max': { $gte: ageNum } }, { 'demographics.age_max': { $exists: false } }] }
          ]
        }
      ];
    }
    
    if (sex) {
      query.$or = query.$or || [];
      if (query.$or.length > 0) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ 'demographics.sex': sex }, { 'demographics.sex': { $exists: false } }] }
        ];
        delete query.$or;
      } else {
        query.$or = [
          { 'demographics.sex': sex },
          { 'demographics.sex': { $exists: false } }
        ];
      }
    }
    
    const ranges = await BiomarkerRange.find(query);
    
    // Group ranges by biomarker_type and return the most specific match
    const rangeMap: Record<string, any> = {};
    ranges.forEach(range => {
      const key = range.biomarker_type;
      if (!rangeMap[key]) {
        rangeMap[key] = range;
      } else {
        // Prefer more specific demographic matches
        const current = rangeMap[key];
        const hasAgeCurrent = current.demographics?.age_min !== undefined || current.demographics?.age_max !== undefined;
        const hasSexCurrent = current.demographics?.sex !== undefined;
        const hasAgeNew = range.demographics?.age_min !== undefined || range.demographics?.age_max !== undefined;
        const hasSexNew = range.demographics?.sex !== undefined;
        
        const specificityScore = (hasAge: boolean, hasSex: boolean) => 
          (hasAge ? 2 : 0) + (hasSex ? 1 : 0);
        
        if (specificityScore(hasAgeNew, hasSexNew) > specificityScore(hasAgeCurrent, hasSexCurrent)) {
          rangeMap[key] = range;
        }
      }
    });
    
    res.json({ ranges: Object.values(rangeMap) });
  } catch (error) {
    console.error('Error fetching biomarker ranges:', error);
    res.status(500).json({ error: 'Failed to fetch biomarker ranges' });
  }
});

// Create a new biomarker range (admin only)
router.post('/ranges', authMiddleware, async (req, res) => {
  try {
    const range = new BiomarkerRange(req.body);
    await range.save();
    res.status(201).json({ range });
  } catch (error) {
    console.error('Error creating biomarker range:', error);
    res.status(500).json({ error: 'Failed to create biomarker range' });
  }
});

// Update a biomarker range (admin only)
router.patch('/ranges/:id', authMiddleware, async (req, res) => {
  try {
    const range = await BiomarkerRange.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_date: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!range) {
      return res.status(404).json({ error: 'Biomarker range not found' });
    }
    
    res.json({ range });
  } catch (error) {
    console.error('Error updating biomarker range:', error);
    res.status(500).json({ error: 'Failed to update biomarker range' });
  }
});

// Delete a biomarker range (admin only)
router.delete('/ranges/:id', authMiddleware, async (req, res) => {
  try {
    const range = await BiomarkerRange.findByIdAndDelete(req.params.id);
    
    if (!range) {
      return res.status(404).json({ error: 'Biomarker range not found' });
    }
    
    res.json({ message: 'Biomarker range deleted successfully' });
  } catch (error) {
    console.error('Error deleting biomarker range:', error);
    res.status(500).json({ error: 'Failed to delete biomarker range' });
  }
});

// Initialize default biomarker ranges
router.post('/ranges/init', authMiddleware, async (req, res) => {
  try {
    const count = await BiomarkerRange.countDocuments();
    
    if (count > 0) {
      return res.json({ message: 'Biomarker ranges already initialized' });
    }
    
    const defaultRanges = [
      {
        biomarker_type: 'glucose',
        label: 'Glucose (mg/dL)',
        unit: 'mg/dL',
        low: 70,
        high: 140,
        source: 'American Diabetes Association'
      },
      {
        biomarker_type: 'ldl',
        label: 'LDL Cholesterol (mg/dL)',
        unit: 'mg/dL',
        low: 0,
        high: 129,
        source: 'American Heart Association'
      },
      {
        biomarker_type: 'hemoglobin',
        label: 'Hemoglobin (g/dL)',
        unit: 'g/dL',
        low: 12,
        high: 17.5,
        demographics: {
          sex: 'Female'
        },
        source: 'WHO Guidelines'
      },
      {
        biomarker_type: 'hemoglobin',
        label: 'Hemoglobin (g/dL)',
        unit: 'g/dL',
        low: 13.5,
        high: 17.5,
        demographics: {
          sex: 'Male'
        },
        source: 'WHO Guidelines'
      },
      {
        biomarker_type: 'vitaminD',
        label: 'Vitamin D (ng/mL)',
        unit: 'ng/mL',
        low: 20,
        high: 50,
        source: 'Endocrine Society'
      }
    ];
    
    await BiomarkerRange.insertMany(defaultRanges);
    
    res.status(201).json({ message: 'Default biomarker ranges initialized successfully' });
  } catch (error) {
    console.error('Error initializing biomarker ranges:', error);
    res.status(500).json({ error: 'Failed to initialize biomarker ranges' });
  }
});

export default router;
