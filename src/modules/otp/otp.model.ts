import  mongoose  from "mongoose"
import validator from 'validator'
import IOtp from "./otp.interface"

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Email is invalid']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model<IOtp & mongoose.Document>('Otp', OTPSchema)