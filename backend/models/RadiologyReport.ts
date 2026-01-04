import mongoose, { Document, Schema } from 'mongoose';

export interface IRadiologyReport extends Document {
  created_by: string;
  patient_id: mongoose.Types.ObjectId;
  filename: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  birads?: {
    value?: number;
    confidence?: 'low' | 'medium' | 'high';
    evidence?: string[];
  };
  breast_density?: {
    value?: string;
    evidence?: string[];
  };
  exam?: {
    type?: string;
    laterality?: string;
    evidence?: string[];
  };
  comparison?: {
    prior_exam_date?: string;
    evidence?: string[];
  };
  findings?: Array<{
    laterality?: string;
    location?: string;
    description?: string;
    assessment?: string;
    evidence?: string[];
  }>;
  recommendations?: Array<{
    action?: string;
    timeframe?: string;
    evidence?: string[];
  }>;
  red_flags?: string[];
  processing_time_ms?: number;
  raw_text?: string;
  created_date: Date;
  updated_date: Date;
}

const radiologyReportSchema = new Schema<IRadiologyReport>({
  created_by: {
    type: String,
    required: true
  },
  patient_id: {
    type: Schema.Types.ObjectId,
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
  this.updated_date = new Date();
  next();
});

const RadiologyReport = mongoose.model<IRadiologyReport>('RadiologyReport', radiologyReportSchema);

export default RadiologyReport;
