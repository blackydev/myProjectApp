import { Request, Response, NextFunction } from "express";
import Permissions from "../utils/permisions.js";
import { Post } from "../models/post.js";

const usersPerms = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (
    req.user._id.toString() === req.params.id ||
    req.user.permissions & Permissions.users
  )
    return next();
  return res.status(401).send("Access denied.");
};

const postsPerms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send("Post with given ID does not exist.");
  if (
    req.user._id.toString() === post?.author.toString() ||
    req.user.permissions & Permissions.posts
  )
    return next();
  return res.status(401).send("Access denied.");
};

const onlySelf = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (req.user._id.toString() === req.params.id) return next();
  return res.status(401).send("Access denied.");
};

const perms = {
  users: usersPerms,
  onlySelf: onlySelf,
  posts: postsPerms,
};

export default perms;
