import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  image?:string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String , default:""},
});

export const User = model<IUser>("User", userSchema);
