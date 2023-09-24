import  mongoose  from "mongoose"
import IUser from "./user.interface"
import validator from 'validator'

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    minlength: [2, 'First name must be at least 3 characters long'],
    maxlength: [20, 'First name must be at most 20 characters long'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    minlength: [2, 'Last name must be at least 3 characters long'],
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
  },
  phone: {
    type: Number,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true,
    max: [9999999999, 'Phone number must be at most 10 digits long'],
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
  avatar: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model<IUser & mongoose.Document>('User', UserSchema)