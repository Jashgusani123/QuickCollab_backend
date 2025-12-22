import mongoose, { Document, ObjectId } from "mongoose";

export interface IChannel extends Document {
  name: string;
  workspaceId: ObjectId
}

const channelSchema = new mongoose.Schema<IChannel>(
  {
    name: { type: String, required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChannel>("Channel", channelSchema);
