import mongoose from "mongoose";
import ICard from "./card.interface";
import { PRIORITY, SCHEMA_TYPE } from "@core/utils";

const CardSchema = new mongoose.Schema({
  boardId: {
    type: SCHEMA_TYPE,
    ref: 'Board',
  },
  columnId: {
    type: SCHEMA_TYPE,
    ref: 'Column',
  },
  cardId: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    minlength: [2, "Title must be at least 2 characters long"],
    maxlength: [20, "Title must be at most 20 characters long"],
    trim: true,
  },
  description: {
    type: String,
    minlength: [2, "Description must be at least 2 characters long"],
    maxlength: [200, "Description must be at most 200 characters long"],
    trim: true,
  },
  cover: {
    type: String,
    default: null,
  },
  startDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null
  },
  memberIds: [
    {
      type: SCHEMA_TYPE,
      ref: 'User',
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      email: {
        type: String,
        default: null
      },
      avatar: {
        type: String,
        default: null
      },
      displayName: {
        type: String,
        default: null
      },
      content: {
        type: String,
        minlength: [2, "Content must be at least 2 characters long"],
        maxlength: [200, "Content must be at most 200 characters long"],
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  checkList:[
    {
      item: {
        type: String,
        minlength: [2, "Name task must be at least 2 characters long"],
        maxlength: [100, "Name task must be at most 100 characters long"],
      },
      isDone: {
        type: Boolean,
        default: false,
      },
      assignedTo: {
        type: SCHEMA_TYPE,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      dueDate: {
        type: Date,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  attachments: [{
    fileName: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    createAt: {
      type: Date,
      default: Date.now,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  reporterId: {
    type: SCHEMA_TYPE,
    ref: 'User',
  },
  labelId: {
    type: SCHEMA_TYPE,
    ref: 'Label'
  },
  priority: {
    type: String,
    enum: [PRIORITY.lowest, PRIORITY.low, PRIORITY.medium, PRIORITY.high, PRIORITY.highest],
    default: PRIORITY.medium
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  }
});
export default mongoose.model<ICard & mongoose.Document>("Card", CardSchema);