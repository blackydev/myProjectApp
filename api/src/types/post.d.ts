import mongoose, { Document, Model } from "mongoose";
import { IUserDocument } from "./user.js";

export interface IPostDocument extends Document {
  author: IUserDocument | mongoose.ObjectId;
  content: string;
  likes: [IUserDocument | mongoose.ObjectId];
  likesCount: Number;
  createdAt: Date;
  media?: [Buffer];
  parent: IUserDocument | mongoose.ObjectId;
}

export interface IPostModel extends Model<IPostDocument> {
  addLike(postId: string, userId: string): Promise<IPostDocument>;
  deleteLike(postId: string, userId: string): Promise<IPostDocument>;
}
