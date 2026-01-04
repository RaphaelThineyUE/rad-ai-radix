import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  created_by: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  date_of_birth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  ethnicity: {
    type: String,
    trim: true
  },
  diagnosis_date: {
    type: Date,
    required: true
  },
  cancer_type: {
    type: String,
    required: true,
    trim: true
  },
  cancer_stage: {
    type: String,
    enum: ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Unknown'],
    default: 'Unknown'
  },
  tumor_size_cm: {
    type: Number,
    min: 0
  },
  lymph_node_positive: {
    type: Boolean,
    default: false
  },
  er_status: {
    type: String,
    enum: ['Positive', 'Negative', 'Unknown'],
    default: 'Unknown'
  },
  pr_status: {
    type: String,
    enum: ['Positive', 'Negative', 'Unknown'],
    default: 'Unknown'
  },
  her2_status: {
    type: String,
    enum: ['Positive', 'Negative', 'Unknown'],
    default: 'Unknown'
  },
  menopausal_status: {
    type: String,
    trim: true
  },
  initial_treatment_plan: {
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

patientSchema.pre('save', function(next) {
  this.updated_date = Date.now();
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
