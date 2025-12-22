import mongoose, { Document, ObjectId } from "mongoose";

export interface IMember extends Document {
  workspaceId: ObjectId;
  userId: ObjectId;
  role: "admin" | "member";
  // _id:ObjectId
}

const MemberSchema = new mongoose.Schema<IMember>(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
      required: true,
    },
  },
  { timestamps: true }
);

MemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IMember>("Member", MemberSchema);