import mongoose, { Query } from 'mongoose';
import validator from 'validator'
import {AVATAR_DEFAULT} from '@core/utils'

import IUser from './user.interface'

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [20, 'First name must be at most 20 characters long'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [20, 'Last name must be at most 20 characters long'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Email is invalid']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true,
    length: [10, 'Phone must be at least 10 characters long'],
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  avatar: {
    type: String,
    default: AVATAR_DEFAULT
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    select: false
  },
  verify: {
    type: Boolean,
    default: false,
    select: false
  },
  refreshToken: {
    type: [String],
    select: false
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
})

UserSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const user = this
    user.find({ active: { $ne: false } }).select('-__v')
  }
  next();
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    return next()
  }
  this.passwordChangedAt = new Date(Date.now() - 1000)
  next();
});

export default mongoose.model<IUser & mongoose.Document>('User', UserSchema);
