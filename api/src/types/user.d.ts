import mongoose, { Document, Model } from "mongoose";
import Permissions from "../utils/permisions.ts";
import { IChatModel } from "./chat.js";
export interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  avatar: Buffer;
  permissions: Permissions;
  chats: [IChatModel | mongoose.ObjectId];
  followed: [IUserModel | mongoose.ObjectId];

  followedCount: number;
  followersCount: number;

  toJSON(): any;
  comparePassword(password: string): Promise<boolean & void>;
  generateAuthToken: () => string;
}
export interface IUserModel extends Model<IUserDocument> {
  setPassword(
    userId: string | mongoose.Types.ObjectId,
    password: string
  ): Promise<IUserDocument | Error>;
}
