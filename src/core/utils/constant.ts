import mongoose from "mongoose";
export const MODE_ACCESS = {
  public: 'public',
  private: 'private'
}
export const OBJECT_ID = mongoose.Types.ObjectId;
export const SCHEMA_TYPE = mongoose.Schema.ObjectId;
export const PRIORITY = {
  lowest: 'lowest',
  low: 'low',
  medium: 'medium',
  high: 'high',
  highest: 'highest'
}