import mongoose, { Document, Model } from "mongoose";
import Permissions from "../utils/permisions.ts";
export interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  avatar: Buffer;
  permissions: Permissions;
  followed: [IUserDocument | mongoose.ObjectId];
  followedCount: Number;
  followers: [IUserDocument | mongoose.ObjectId];
  followersCount: Number;

  toJSON(): any;
  comparePassword(password: string): Promise<boolean & void>;
  generateAuthToken: () => string;
}
export interface IUserModel extends Model<IUserDocument> {
  setPassword(
    userId: string | mongoose.Types.ObjectId,
    password: string
  ): Promise<IUserDocument | Error>;

  follow(
    followerId: IUserDocument,
    followedId: IUserDocument
  ): Promise<IUserDocument | null>;

  unfollow(
    followerId: IUserDocument,
    followedId: IUserDocument
  ): Promise<IUserDocument | null>;
}
