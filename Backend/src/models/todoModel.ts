import mongoose, { Document, Schema } from "mongoose";

export interface Iuser extends Document {
  todo_id: string;
  todo_name: string;
  created_at?: Date;
}

const userSchema = new Schema<Iuser>({
  todo_id: {
    type: String,
    required: true,
  },
  todo_name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date().toISOString(),
  },
});

export default mongoose.model<Iuser>("Todo", userSchema);
