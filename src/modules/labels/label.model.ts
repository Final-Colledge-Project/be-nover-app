import mongoose, { Query } from 'mongoose';

import ILabel from './label.interface';

const LabelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [20, 'Name must be at most 20 characters long'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    pattern: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/],
    trim: true,
  },
  boardId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Board'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  }
})

LabelSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const label = this
    label.find({ isActive: { $ne: false } }).select('-__v')
  }
  next();
});

export default mongoose.model<ILabel & mongoose.Document>('Label', LabelSchema);
