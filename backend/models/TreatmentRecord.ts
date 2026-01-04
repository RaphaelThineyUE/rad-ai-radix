import mongoose, { Document, Schema } from 'mongoose';

export interface ITreatmentRecord extends Document {
  created_by: string;
  patient_id: mongoose.Types.ObjectId;
  treatment_type: 'Surgery' | 'Chemotherapy' | 'Radiation' | 'Hormone Therapy' | 'Targeted Therapy' | 'Immunotherapy' | 'Other';
  treatment_start_date: Date;
  treatment_end_date?: Date;
  medication_details?: string;
  treatment_outcome?: 'Complete Response' | 'Partial Response' | 'Stable Disease' | 'Progressive Disease' | 'Recurrence' | 'Remission' | 'Other';
  side_effects?: string;
  follow_up_date?: Date;
  created_date: Date;
  updated_date: Date;
}

const treatmentRecordSchema = new Schema<ITreatmentRecord>({
  created_by: {
    type: String,
    required: true
  },
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  treatment_type: {
    type: String,
    enum: ['Surgery', 'Chemotherapy', 'Radiation', 'Hormone Therapy', 'Targeted Therapy', 'Immunotherapy', 'Other'],
    required: true
  },
  treatment_start_date: {
    type: Date,
    required: true
  },
  treatment_end_date: {
    type: Date
  },
  medication_details: {
    type: String,
    trim: true
  },
  treatment_outcome: {
    type: String,
    enum: ['Complete Response', 'Partial Response', 'Stable Disease', 'Progressive Disease', 'Recurrence', 'Remission', 'Other']
  },
  side_effects: {
    type: String,
    trim: true
  },
  follow_up_date: {
    type: Date
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

treatmentRecordSchema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

const TreatmentRecord = mongoose.model<ITreatmentRecord>('TreatmentRecord', treatmentRecordSchema);

export default TreatmentRecord;
