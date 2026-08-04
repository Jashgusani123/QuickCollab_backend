import { Schema, model } from "mongoose";

export enum RequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum RequestType {
  FRIEND_REQUEST = "FRIEND_REQUEST"
}

export interface IRequest {
  senderId:Schema.Types.ObjectId,
  requestedId:[Schema.Types.ObjectId],
  status: RequestStatus,
  type: RequestType
}

const requestSchema = new Schema<IRequest>({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestedId: { type: [Schema.Types.ObjectId], ref: "User", required: true },
  status: { type: String, enum: Object.values(RequestStatus), required: true, default: RequestStatus.PENDING },
  type: { type: String, enum: Object.values(RequestType), required: true },
},{timestamps: true});

export const Request = model<IRequest>("Request", requestSchema);
