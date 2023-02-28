import express, { Request, Response } from "express";
import _ from "lodash";
import { validate, User } from "../models/user.js";
import { Post } from "../models/post.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import perms from "../middleware/perms.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { IUserDocument } from "../types/user.js";
const router = express.Router();

router.get("/:id", validateObjectId, async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select(
    "name followedCount followersCount"
  );
  if (!user)
    return res.status(404).send("User with the given ID does not exist.");

  res.send(user);
});

router.get(
  "/:id/posts",
  validateObjectId,
  async (req: Request, res: Response) => {
    if (typeof req.query.page !== "string")
      return res.status(404).send("You should choose page.");

    const page = parseInt(req.query.page);
    if (page < 0 || isNaN(page))
      return res.status(404).send("Page has to be equal or larger than 0.");

    const posts = await Post.find({ author: req.params.id })
      .select("content parent likesCount createdAt") // DO NOT RETURN MEDIA!
      .skip(page * 10)
      .limit(10);

    if (!posts.length) return res.status(404).send("Posts' page is empty.");

    res.send(posts);
  }
);

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as { email: string; password: string; name: string };

  const { error } = validate(body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: body.email });
  if (user)
    return res
      .status(400)
      .send("User with the specified email address already exists.");

  user = new User({ ...body, password: undefined });
  await user.save();

  const passwordError = await User.setPassword(user._id, body.password);
  if (_.isError(passwordError)) {
    await User.findByIdAndDelete(user._id);
    return res.status(400).send(passwordError.message);
  }

  const token = user.generateAuthToken();
  res.send(token);
});

router.patch(
  "/:id",
  [validateObjectId, auth, perms.users],
  async (req: Request, res: Response) => {
    const body = req.body as { email: string; name: string };
    const { error } = validate(body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        email: body.email,
        name: body.name,
      },
      { new: true }
    );
    if (!user)
      return res
        .status(404)
        .send("User with the specified email address does not exist.");

    if (req.user._id.toString() !== req.params.id)
      return res.status(204).send();

    const token = user.generateAuthToken();
    res.send(token);
  }
);

router.patch(
  "/:id/password",
  [validateObjectId, auth, perms.onlySelf],
  async (req: Request, res: Response) => {
    const password = req.body.password as string;

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .send("User with the specified email address does not exist.");

    const error = await User.setPassword(req.user._id, password);
    if (_.isError(error)) return res.status(400).send(error.message);

    await user.save();

    res.status(204).send();
  }
);

router.get(
  "/:id/avatar",
  validateObjectId,
  async (req: Request & { user?: IUserDocument }, res: Response) => {
    const user = await User.findById(req.params.id).select("avatar");
    if (!user)
      return res.status(404).send("User with the given ID does not exist.");

    if (!user.avatar) return res.status(204).send();

    res.send(user.avatar);
  }
);

router.patch(
  "/:id/avatar",
  [validateObjectId, auth, perms.onlySelf, ...upload.avatar],
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(req.user._id, {
      avatar: req.file?.buffer,
    });
    if (!user)
      return res.status(404).send("User with the given ID does not exist.");

    res.status(204).send();
  }
);

router.delete(
  "/:id/avatar",
  [validateObjectId, auth, perms.users],
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { avatar: true },
      },
      { new: true }
    );
    if (!user)
      return res.status(404).send("User with the given ID does not exist.");

    res.status(204).send();
  }
);

router.patch(
  "/:id/follow",
  [validateObjectId, auth],
  async (req: Request, res: Response) => {
    const followerId = req.user._id;
    const followedId = req.params.id;

    const follower = await User.findOne({
      _id: followerId,
      followed: { $nin: followedId },
    });
    if (!follower) return res.status(400).send("You follow this user.");

    const followed = await User.findByIdAndUpdate(followedId, {
      $inc: { followersCount: 1 },
    });
    if (!followed)
      return res.status(404).send("User with given ID does not exist.");

    await follower.update({
      $push: { followed: followedId },
      $inc: { followedCount: 1 },
    });

    res.status(204).send();
  }
);

router.patch(
  "/:id/unfollow",
  [validateObjectId, auth],
  async (req: Request, res: Response) => {
    const followerId = req.user._id;
    const followedId = req.params.id;

    const follower = await User.findOne({
      _id: followerId,
      followed: { $in: followedId },
    });
    if (!follower) return res.status(400).send("You do not follow this user.");

    await follower.update({
      $pull: { followed: followedId },
      $inc: { followedCount: -1 },
    });

    const followed = await User.findByIdAndUpdate(followedId, {
      $inc: { followersCount: -1 },
    });
    if (!followed)
      return res.status(404).send("User with given ID does not exist.");

    res.status(204).send();
  }
);

export default router;
