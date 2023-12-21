import mongoose, { Query } from "mongoose";
import { MODEL_NAME } from "@core/utils";
import INotification from "./notification.interface";

const NotificationSchema = new mongoose.Schema({
  sender: {
    id: {
      type: mongoose.Schema.ObjectId,
      ref: MODEL_NAME.user,
    },
    avatar: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
  },
  type: {
    type: String,
    default: null,
  },
  message: {
    type: String,
    default: null,
  },
  targetType : {
    type: String,
    default: null,
  },
  contextUrl: {
    type: String,
    default: null,
  },
  receiverId: {
    type: mongoose.Schema.ObjectId,
    ref: MODEL_NAME.user,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isTrash: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NotificationSchema.pre(/^find/, async function (next) {
  if (this instanceof Query) {
    const Notification = this;
    Notification.find({ isActive: { $ne: false } }).select("-__v");
  }
  next();
});

export default mongoose.model<INotification & mongoose.Document>(
  MODEL_NAME.notification,
  NotificationSchema
);
