import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  host_id: { type: Schema.Types.ObjectId, ref: "User" },
  meetingCode: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 21600 // 6 hours in seconds (6 * 60 * 60)
  }
});

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };