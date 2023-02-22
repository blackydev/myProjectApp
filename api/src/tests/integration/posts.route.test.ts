import request from "supertest";
import { Types } from "mongoose";
import _ from "lodash";
import path from "path";
import app from "../../app.js";
import { User } from "../../models/user.js";
import { Post } from "../../models/post.js";
import Permissions from "../../utils/permisions.js";
import { IUserDocument } from "../../types/user.js";

const endpoint = "/api/posts/";

describe("posts' route", () => {
  let user: IUserDocument, token: string;
  const dirPath = "./src/tests/files/";

  beforeEach(async () => {
    user = new User({
      email: "auth@example.com",
      name: "user",
    });
    await user.save();
    await User.setPassword(user._id, "Password123");
    token = user.generateAuthToken();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  afterAll(async () => app.close());

  describe("POST /", () => {
    let content: string;
    beforeEach(() => (content = "Hello world!"));

    const exec = () =>
      request(app)
        .post(endpoint)
        .set("x-auth-token", token)
        .field("content", content);

    describe("correct requests", () => {
      it("Should return 200 and saved post", async () => {
        const { body } = await exec().expect(200);
        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("author", user._id.toString());
        expect(body).toHaveProperty("content", content);
        expect(body).toHaveProperty("media");
        expect(body.media.length).toBe(0);

        const post = await Post.findById(body._id);
        expect(post).toBeTruthy();
      });

      it("Should return 200 and saved post with uploaded images", async () => {
        const { body } = await exec()
          .attach("images", dirPath + "img.webp")
          .attach("images", dirPath + "img.jpg")
          .expect(200);

        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("author", user._id.toString());
        expect(body).toHaveProperty("content", content);
        expect(body).toHaveProperty("media");
        expect(_.isArray(body.media)).toBeTruthy();
        expect(body.media.length).toBe(2);

        const post = await Post.findById(body._id);
        expect(post).toBeTruthy();
      });

      it("Should return 200 and saved post if parent is defined", async () => {
        const res = await exec();
        const parentId = res.body._id;
        const { body } = await exec().field("parent", parentId);

        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("author", user._id.toString());
        expect(body).toHaveProperty("content", content);
        expect(body).toHaveProperty("media");
        expect(body).toHaveProperty("parent", parentId);
        expect(_.isArray(body.media)).toBeTruthy();
        expect(body.media.length).toBe(0);

        const post = await Post.findById(body._id);
        expect(post).toBeTruthy();
      });
    });

    describe("incorrect requests", () => {
      it("Should return 401 if no token is provided", async () => {
        token = "";
        await exec().expect(401);
      });

      it("Should return 400 if content is too short", async () => {
        content = "A";
        await exec().expect(400);
      });

      it("Should return 400 if content is not provided", async () => {
        await request(app)
          .post(endpoint)
          .set("x-auth-token", token)
          .expect(400);
      });

      it("Should return 400 if parent ID is invalid", async () => {
        const parentId = new Types.ObjectId().toString();
        await exec().field("parent", parentId).expect(400);
      });
    });
  });

  describe("PATH /:id/like", () => {
    let postId: string, like: boolean | undefined;
    beforeEach(async () => {
      like = true;
    });

    const setPost = async (likes: IUserDocument[]) => {
      const post = new Post({
        author: new Types.ObjectId(),
        content: "Hi!",
        likes: likes,
        likesCount: likes.length,
      });
      await post.save();
      postId = post._id.toString();
    };

    const exec = () =>
      request(app)
        .patch(path.join(endpoint, postId, "/like"))
        .set("x-auth-token", token)
        .send({ like });

    it("should return 204 and update post", async () => {
      await setPost([]);
      await exec().expect(204);
      const post = await Post.findById(postId);
      expect(post?.likes.length).toBe(1);
      expect(post?.likesCount).toBe(1);
    });

    it("should return 400 and not update post if user liked a post before", async () => {
      await setPost([user._id]);
      await exec().expect(400);
      const post = await Post.findById(postId);
      expect(post?.likes.length).toBe(1);
      expect(post?.likesCount).toBe(1);
    });

    it("should return 204 and update post if user unlike the post", async () => {
      await setPost([user._id]);
      like = false;
      await exec().expect(204);
      const post = await Post.findById(postId);
      expect(post?.likes.length).toBe(0);
      expect(post?.likesCount).toBe(0);
    });

    it("should return 400 and not update post if user unlike the post which had not like before", async () => {
      await setPost([]);
      like = false;
      await exec().expect(400);
      const post = await Post.findById(postId);
      expect(post?.likes.length).toBe(0);
      expect(post?.likesCount).toBe(0);
    });

    it("should return 400 if like is not boolean", async () => {
      await setPost([]);
      like = undefined;
      await exec().expect(400);
    });

    it("should return 401 if token is not provided", async () => {
      token = "";
      await setPost([]);
      await exec().expect(401);
    });
  });

  describe("DELETE /:id", () => {
    let postId: string;
    beforeEach(async () => {
      const post = new Post({ author: user._id, content: "Hi!" });
      await post.save();
      postId = post._id.toString();
    });

    const exec = () =>
      request(app)
        .delete(path.join(endpoint, postId))
        .set("x-auth-token", token)
        .send();

    it("should return 204 and delete post", async () => {
      await exec().expect(204);
      const post = await Post.findById(postId);
      expect(post).toBeFalsy();
    });

    it("should return 204 and delete post if user has admin permission", async () => {
      const user = new User({ permissions: Permissions.posts });
      token = user.generateAuthToken();
      await exec().expect(204);
      const post = await Post.findById(postId);
      expect(post).toBeFalsy();
    });

    it("should return 404 if post with given ID does not exist", async () => {
      await Post.remove({});
      await exec().expect(404);
    });

    it("should return 401 if user does not have permissions", async () => {
      const user = new User({});
      token = user.generateAuthToken();
      await exec().expect(401);
      const post = await Post.findById(postId);
      expect(post).toBeTruthy();
    });
  });
});
