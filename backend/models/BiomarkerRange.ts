import mongoose, { Document, Schema } from 'mongoose';

export interface IBiomarkerRange extends Document {
  biomarker_type: 'glucose' | 'ldl' | 'hemoglobin' | 'vitaminD';
  label: string;
  unit: string;
  low: number;
  high: number;
  demographics?: {
    age_min?: number;
    age_max?: number;
    sex?: 'Male' | 'Female' | 'Other';
  };
  source?: string;
  created_date: Date;
  updated_date: Date;
}

const biomarkerRangeSchema = new Schema<IBiomarkerRange>({
  biomarker_type: {
    type: String,
    enum: ['glucose', 'ldl', 'hemoglobin', 'vitaminD'],
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  low: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  demographics: {
    age_min: {
      type: Number,
      min: 0
    },
    age_max: {
      type: Number,
      min: 0
    },
    sex: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    }
  },
  source: {
    type: String,
    trim: true
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

biomarkerRangeSchema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

const BiomarkerRange = mongoose.model<IBiomarkerRange>('BiomarkerRange', biomarkerRangeSchema);

export default BiomarkerRange;
