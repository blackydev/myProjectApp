import config from "config";
import mongoose, { Types } from "mongoose";
import { Post, validate } from "../../models/post.js";
import server from "../../app.js";
import { User } from "../../models/user.js";
import { IPostDocument } from "../../types/post.js";

describe("post's model", () => {
  afterAll(() => server.close());
  describe("validate()", () => {
    let content: string, parent: string;

    const exec = () => validate({ content });
    it("should not return error", async () => {
      content = "aa";
      let result = exec();
      expect(result).toHaveProperty("value");
      expect(result).not.toHaveProperty("error");

      content = "".padEnd(1000, "a");
      result = exec();
      expect(result).toHaveProperty("value");
      expect(result).not.toHaveProperty("error");
    });

    it("should not return error if parent is defined", async () => {
      content = "aa";
      parent = new mongoose.Types.ObjectId().toString();
      const result = validate({ content, parent });
      expect(result).toHaveProperty("value");
      expect(result).not.toHaveProperty("error");
    });

    it("should return error if parent is invalid", async () => {
      content = "aa";
      parent = "123";
      const result = validate({ content, parent });
      expect(result).toHaveProperty("error");
    });

    it("should return error if content is less than 2 letters", async () => {
      content = "a";
      const result = exec();
      expect(result).toHaveProperty("error");
    });

    it("should return error if content is more than 1000 letters", async () => {
      content = "".padEnd(1001, "a");

      const result = exec();
      expect(result).toHaveProperty("error");
    });

    it("should return error if content is empty string", async () => {
      content = "";

      const result = exec();
      expect(result).toHaveProperty("error");
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("static methods", () => {
    let postId: Types.ObjectId, userId: Types.ObjectId;

    describe("addLike()", () => {
      beforeEach(async () => {
        const post = new Post({
          author: new mongoose.Types.ObjectId(),
          content: "Hello world!",
        });
        await post.save();
        postId = post._id;

        const user = new User({
          email: "user@example.com",
          name: "user",
        });
        await user.save();

        userId = user._id;
      });

      const exec = async () =>
        await Post.addLike(postId.toString(), userId.toString());

      it("should add like", async () => {
        let post = await exec();
        expect(post.likes.length).toBe(1);
        expect(post.likesCount).toBe(1);
      });

      it("should don't change anything if answer is already in array", async () => {
        await exec();
        let post = await exec();
        expect(post).toBe(null);
        post = (await Post.findById(postId)) as IPostDocument;
        expect(post.likes.length).toBe(1);
        expect(post.likesCount).toBe(1);
      });
    });

    describe("deleteLike()", () => {
      beforeEach(async () => {
        const user = new User({
          email: "user@example.com",
          name: "user",
        });
        await user.save();

        userId = user._id;

        const post = new Post({
          author: new mongoose.Types.ObjectId(),
          content: "Hello world!",
          likes: [user._id],
          likesCount: 1,
        });
        await post.save();
        postId = post._id;
      });
      const exec = async () =>
        await Post.deleteLike(postId.toString(), userId.toString());

      it("should remove answer", async () => {
        const post = await exec();
        expect(post.likes.length).toBe(0);
        expect(post.likesCount).toBe(0);
      });

      it("should don't change anything if id is invalid", async () => {
        userId = new mongoose.Types.ObjectId();
        let post = await exec();
        expect(post).toBe(null);
        post = (await Post.findById(postId)) as IPostDocument;
        expect(post.likes.length).toBe(1);
        expect(post.likesCount).toBe(1);
      });
    });
  });
});
