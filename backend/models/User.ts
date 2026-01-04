import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  full_name: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_date: Date;
  updated_date: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
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

userSchema.pre('save', function(next) {
  this.updated_date = new Date();
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
