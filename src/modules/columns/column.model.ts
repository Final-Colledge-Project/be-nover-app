import mongoose from 'mongoose';
import {SCHEMA_TYPE} from '@core/utils'

import IColumn from './column.interface'

const ColumnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [2, 'Title must be at least 2 characters long'],
    maxlength: [20, 'Title must be at most 20 characters long'],
    trim: true,
  },
  boardId: {
    type: SCHEMA_TYPE,
    ref: 'Board',
  },
  cardOrderIds: [
    {
      type: SCHEMA_TYPE,
      ref: 'Card',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});
export default mongoose.model<IColumn & mongoose.Document>('Column', ColumnSchema);
