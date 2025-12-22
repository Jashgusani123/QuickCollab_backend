import mongoose, { Document, ObjectId } from "mongoose";


export interface IWorkspace extends Document {
  name: string;
  userId: ObjectId;
  joinCode:string;
}

const workspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    joinCode: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkspace>("Workspace", workspaceSchema);
