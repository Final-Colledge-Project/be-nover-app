import { MODEL_NAME, SCHEMA_TYPE, SUBTASK_STATUS } from "@core/utils";
import mongoose from "mongoose";
import ISubCard from "./subCard.interface";
const SubCardSchema = new mongoose.Schema({
  cardId: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.card,
    required: [true, "CardId is required"],
  },
  subCardId: { 
    type: String,
    default: null
  },
  name: {
    type: String,
    minlength: [2, "Name task must be at least 2 characters long"],
    maxlength: [100, "Name task must be at most 100 characters long"],
    required: [true, "Name task is required"],
  },
  status: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.column,
    enum: [SUBTASK_STATUS.todo, SUBTASK_STATUS.inprogress, SUBTASK_STATUS.completed, SUBTASK_STATUS.cancel],
  },
  assignedTo: {
    type: SCHEMA_TYPE,
    ref: MODEL_NAME.user,
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
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
export default mongoose.model<ISubCard & mongoose.Document>(MODEL_NAME.subCard, SubCardSchema);