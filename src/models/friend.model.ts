import { Schema, model } from "mongoose";

export interface IFriend {
  ownerId:Schema.Types.ObjectId,
  friendIds:[Schema.Types.ObjectId],
}

const friendSchema = new Schema<IFriend>({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  friendIds: { type: [Schema.Types.ObjectId], ref: "User", required: true },
},{timestamps: true});

export const Friend = model<IFriend>("Friend", friendSchema);
