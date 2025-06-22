import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
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
export default mongoose.model("Todo", userSchema);
