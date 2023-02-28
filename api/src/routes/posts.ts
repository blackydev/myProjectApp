import express, { Request, Response } from "express";
import _ from "lodash";
import { Post, validate } from "../models/post.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import validateObjectId from "../middleware/validateObjectId.js";
import perms from "../middleware/perms.js";
import { IPostDocument, IPostModel } from "../types/post.js";
const router = express.Router();

router.post(
  "/",
  [auth, ...upload.post],
  async (req: Request, res: Response) => {
    const body = req.body as { content: string; parent?: string };

    const { error } = validate(body);
    if (error) return res.status(400).send(error.details[0].message);

    if (body.parent) {
      const post = await Post.findById(body.parent);
      if (!post)
        return res
          .status(400)
          .send("You can not answer to post which does not exist.");
    }

    let buffers;
    if (_.isArray(req.files)) buffers = req.files.map((file) => file.buffer);

    const post = new Post({
      author: req.user._id,
      content: body.content,
      parent: body.parent,
      media: buffers,
    });
    await post.save();

    res.send(post);
  }
);

router.patch(
  "/:id/like",
  [validateObjectId, auth],
  async (req: Request, res: Response) => {
    if (!_.isBoolean(req.body.like))
      return res
        .status(400)
        .send("You have to send like property which is boolean.");

    let post: IPostDocument;

    if (req.body.like) post = await Post.addLike(req.params.id, req.user._id);
    else post = await Post.deleteLike(req.params.id, req.user._id);

    if (!post)
      return res
        .status(400)
        .send(
          "Post with given ID does not exist or user already liked this post."
        );

    res.status(204).send();
  }
);

router.delete(
  "/:id",
  [validateObjectId, auth, perms.posts],
  async (req: Request, res: Response) => {
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }
);

export default router;
