import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import validateUser from "./user/user.validation.js";
import validatePassword from "./user/password.validation.js";
import { IUserDocument, IUserModel } from "../types/user.js";

const UserSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 320,
  },

  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 64,
    trim: true,
  },

  password: {
    type: String,
    maxlength: 64,
  },

  avatar: {
    type: Buffer,
  },

  followed: {
    type: [Schema.Types.ObjectId],
    ref: "user",
    validate: [
      (val: Array<Schema.Types.ObjectId>) => val.length <= 1001,
      "User following too many users.",
    ],
  },

  followers: [
    {
      ref: "user",
      type: Schema.Types.ObjectId,
    },
  ],

  permissions: {
    type: Number,
  },
});

UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("followedCount").get(function () {
  return this.followed.length | 0;
});

UserSchema.virtual("followersCount").get(function () {
  return this.followers.length | 0;
});

UserSchema.statics = {
  setPassword: async function (
    userId: string | mongoose.Types.ObjectId,
    password: string
  ): Promise<IUserDocument | Error> {
    const errors = validatePassword(password);
    if (Array.isArray(errors) && errors.length > 0)
      return new Error(errors[0].message);

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    return await this.findByIdAndUpdate(
      userId,
      { password: hashed },
      { new: true }
    );
  },

  follow: async function (
    followerId: IUserDocument,
    followedId: IUserDocument
  ): Promise<IUserDocument | null> {
    const followed = await this.findByIdAndUpdate(
      followedId,
      {
        $addToSet: { followers: followerId },
      },
      { new: true }
    );
    if (!followed) return null;

    const follower = await this.findByIdAndUpdate(
      followerId,
      {
        $addToSet: { followed: followedId },
      },
      { new: true }
    );
    if (!follower) {
      await this.findByIdAndUpdate(followedId, {
        $pull: { followers: followerId },
      });
      return null;
    }

    return follower;
  },

  unfollow: async function (
    followerId: IUserDocument,
    followedId: IUserDocument
  ): Promise<IUserDocument | null> {
    await this.findByIdAndUpdate(
      followedId,
      {
        $pull: { followers: followerId },
      },
      { new: true }
    );

    const follower = await this.findByIdAndUpdate(
      followerId,
      {
        $pull: { followed: followerId },
      },
      { new: true }
    );

    return follower;
  },
};

UserSchema.methods = {
  toJSON: function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
  },

  comparePassword: async function (password: string) {
    return await bcrypt.compare(password, this.password as string);
  },

  generateAuthToken: function (): string {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        name: this.name,
        permissions: this.permissions,
      },
      config.get("jwtPrivateKey")
    );
  },
};

export const User = mongoose.model<IUserDocument, IUserModel>(
  "user",
  UserSchema
);

export const validate = validateUser;
