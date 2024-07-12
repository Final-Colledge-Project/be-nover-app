import mongoose from "mongoose";
import ICard from "./card.interface";
import { MODEL_NAME, PRIORITY, SCHEMA_TYPE, SUBTASK_STATUS } from "@core/utils";
import { Query } from "mongoose";

const CardSchema = new mongoose.Schema(
  {
    boardId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.board,
    },
    columnId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.column,
    },
    cardId: {
      //key
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [100, "Title must be at most 100 characters long"],
      trim: true,
    },
    description: {
      type: String,
      maxLength: [2000, "Description must be at most 2000 characters long"],
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
      default: null,
    },
    memberIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
        default: [],
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: MODEL_NAME.user,
        },
        content: {
          type: String,
          minlength: [2, "Content must be at least 2 characters long"],
          maxlength: [10000, "Content must be at most 10000 characters long"],
          trim: true,
        },
        icon: {
          type: String,
          default: null,
        },
        edited: {
          type: Boolean,
          default: false,
        },
        likeIds: [
          {
            type: SCHEMA_TYPE,
            ref: MODEL_NAME.user,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    subCardIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.subCard,
      },
    ],
    attachments: [
      {
        fileName: {
          type: String,
          default: null,
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
        },
      },
    ],
    reporterId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.user,
    },
    labelId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.label,
    },
    priorityId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.priority,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    epicId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.epic,
    },
    sprintId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.sprint,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    storyPoint: {
      type: Number,
      default: null,
    },
    watcherIds: [
      {
        type: SCHEMA_TYPE,
        ref: MODEL_NAME.user,
      },
    ],
    issueTypeId: {
      type: SCHEMA_TYPE,
      ref: MODEL_NAME.issueType,
      required: [true, "IssueTypeId is required"],
    },
  },
  { timestamps: true }
);
CardSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const label = this;
    label.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});
export default mongoose.model<ICard & mongoose.Document>(
  MODEL_NAME.card,
  CardSchema
);
