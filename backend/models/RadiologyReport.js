import mongoose from 'mongoose';

const radiologyReportSchema = new mongoose.Schema({
  created_by: {
    type: String,
    required: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  file_url: {
    type: String,
    trim: true
  },
  file_size: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  summary: {
    type: String
  },
  birads: {
    value: {
      type: Number,
      min: 0,
      max: 6
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    evidence: [String]
  },
  breast_density: {
    value: String,
    evidence: [String]
  },
  exam: {
    type: String,
    laterality: String,
    evidence: [String]
  },
  comparison: {
    prior_exam_date: String,
    evidence: [String]
  },
  findings: [{
    laterality: String,
    location: String,
    description: String,
    assessment: String,
    evidence: [String]
  }],
  recommendations: [{
    action: String,
    timeframe: String,
    evidence: [String]
  }],
  red_flags: [String],
  processing_time_ms: {
    type: Number,
    min: 0
  },
  raw_text: {
    type: String
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  updated_date: {
    type: Date,
    default: Date.now
  }
});

radiologyReportSchema.pre('save', function(next) {
  this.updated_date = Date.now();
  next();
});

const RadiologyReport = mongoose.model('RadiologyReport', radiologyReportSchema);

export default RadiologyReport;
