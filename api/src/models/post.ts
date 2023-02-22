import mongoose, { Schema, isValidObjectId } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IPostDocument, IPostModel } from "../types/post.js";

const PostSchema = new Schema<IPostDocument>({
  author: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },

  media: [
    {
      type: Buffer,
    },
  ],

  parent: {
    type: Schema.Types.ObjectId,
    ref: "post",
  },

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],

  likesCount: {
    type: Number,
    min: 0,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.statics = {
  addLike: async function (
    postId: string,
    userId: string
  ): Promise<IPostDocument> {
    return this.findOneAndUpdate(
      { _id: postId, likes: { $nin: userId } },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );
  },

  deleteLike: function (
    postId: string,
    userId: string
  ): Promise<IPostDocument> {
    return this.findOneAndUpdate(
      { _id: postId, likes: { $in: userId } },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );
  },
};

export const Post = mongoose.model<IPostDocument, IPostModel>(
  "post",
  PostSchema
);

export const validate = (data: {
  content: string;
  parent?: string;
}): ValidationResult =>
  Joi.object({
    content: Joi.string().min(2).max(1000).required(),
    parent: Joi.string().custom((value, helpers) => {
      const isValid = isValidObjectId(value);
      if (isValid) return value;
      else throw new Error("Parent is invalid");
    }),
  }).validate(data);
