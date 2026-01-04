import mongoose from 'mongoose';

const treatmentRecordSchema = new mongoose.Schema({
  created_by: {
    type: String,
    required: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
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
  this.updated_date = Date.now();
  next();
});

const TreatmentRecord = mongoose.model('TreatmentRecord', treatmentRecordSchema);

export default TreatmentRecord;
