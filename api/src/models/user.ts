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
      (arr: Array<Schema.Types.ObjectId>) => arr.length <= 1001,
      "User is following too many users.",
    ],
  },

  followedCount: {
    type: Number,
    default: 0,
    min: 0,
  },

  followersCount: {
    type: Number,
    default: 0,
    min: 0,
  },

  permissions: {
    type: Number,
  },

  chats: {
    type: [Schema.Types.ObjectId],
    ref: "chat",
  },
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
