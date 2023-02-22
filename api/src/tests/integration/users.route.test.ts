import mongoose, { ObjectId } from "mongoose";
import request from "supertest";
import fs from "fs";
import config from "config";
import jwt from "jsonwebtoken";
import server from "../../app.js";
import { User } from "../../models/user.js";
import path from "path";
import Permissions from "../../utils/permisions.js";
import { Post } from "../../models/post.js";

const endpoint: string = "/api/users/";

const createExampleUser = async () => {
  const user = new User({
    email: "user@example.com",
    name: "user",
  });
  await user.save();
  await User.setPassword(user._id, "Password123");

  for (let i = 0; i < 17; i++) {
    const post = new Post({
      author: user._id,
      content: "hello world",
      parent: new mongoose.Types.ObjectId(),
      likes: [new mongoose.Types.ObjectId()],
      likesCount: 1,
    });
    await post.save();
  }

  return user;
};

const createExampleAdmin = async () => {
  const user = new User({
    email: "admin@example.com",
    name: "user",
    permissions: Permissions.users,
  });
  await user.save();
  await User.setPassword(user._id, "Password123");
  return user;
};

describe("users' route", () => {
  afterAll(async () => {
    server.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  describe("GET /:id", () => {
    let token: string, userId: ObjectId | string;

    beforeEach(async () => {
      const buffer = await fs.readFileSync("./src/tests/files/img.webp");
      let user = new User({
        email: "test@example.com",
        name: "test",
        avatar: buffer,
      });
      await user.save();
      await User.setPassword(user._id, "Password123");
      userId = user._id;

      user = await createExampleUser();
      token = user.generateAuthToken();
    });

    const exec = () =>
      request(server)
        .get(path.join(endpoint, userId.toString()))
        .set("x-auth-token", token);

    it("should return 200 and user", async () => {
      const { status, body } = await exec();
      expect(status).toBe(200);
      expect(body).toHaveProperty("_id");
      expect(body).toHaveProperty("name");
      expect(body).not.toHaveProperty("password");
      expect(body).not.toHaveProperty("posts");
      expect(body).not.toHaveProperty("avatar");
      expect(body).not.toHaveProperty("permissions");
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("should return 404 if user does not exist", async () => {
      await User.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("GET /:id/posts", () => {
    let userId: ObjectId | string, page: Number | string;

    beforeEach(async () => {
      const user = await createExampleUser();
      userId = user._id;
      page = 0;
    });

    const exec = () =>
      request(server)
        .get(path.join(endpoint, userId.toString(), "/posts/"))
        .query({ page });

    it("should return 200 and 10 user's posts", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(10);
      expect(res.body[0]).toHaveProperty("_id");
      expect(res.body[0]).toHaveProperty("content");
      expect(res.body[0]).toHaveProperty("parent");
      expect(res.body[0]).toHaveProperty("likesCount");
      expect(res.body[0].likesCount).toBe(1);
      expect(res.body[0]).toHaveProperty("createdAt");
      expect(res.body[0]).not.toHaveProperty("media");
      expect(res.body[0]).not.toHaveProperty("likes");
    });

    it("should return 200 and posts if other than first page is choosen", async () => {
      page = 1;
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(7);
    });

    it("should return 404 and empty page if page is out of bound", async () => {
      page = 2;
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("should return 404 if user does not have posts", async () => {
      await Post.deleteMany({});
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("should return 404 if page is not a number", async () => {
      page = "a";
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("should return 404 if page is an negative number", async () => {
      page = -1;
      const { status } = await exec();
      expect(status).toBe(404);
    });
  });

  describe("POST /", () => {
    let data: { email: string; name: string; password: string };
    beforeEach(() => {
      data = {
        email: "user@example.com",
        name: "user",
        password: "Password123",
      };
    });
    const exec = () => request(server).post(endpoint).send(data);

    describe("correct requests", () => {
      it("Should return 200 status", async () => {
        const { status } = await exec();
        expect(status).toBe(200);
      });

      it("Should return valid token", async () => {
        const { text } = await exec();
        const decoded = jwt.verify(text, config.get("jwtPrivateKey"));
        expect(decoded).toHaveProperty("_id");
        expect(decoded).toHaveProperty("email", "user@example.com");
      });

      it("User should be saved in database", async () => {
        await exec();
        const saved = await User.findOne({ email: data.email });
        expect(saved).toBeTruthy();
      });
    });

    describe("incorrect requests", () => {
      it("Should return 400 status if required fields are missing", async () => {
        data.email = "";
        const { status } = await exec();
        expect(status).toBe(400);
      });

      it("Should return 400 status and error message if email is invalid", async () => {
        data.email = "invalidemail";
        const { status, text } = await exec();
        expect(status).toBe(400);
        expect(text).toBe('"email" must be a valid email');
      });

      it("Should return 400 status if user already exists", async () => {
        await exec();
        const { status, text } = await exec();
        expect(status).toBe(400);
      });
    });
  });

  describe("PATCH /:id", () => {
    let token: string,
      data: { email: string; name: string },
      userId: ObjectId | string;

    beforeEach(async () => {
      const user = await createExampleUser();
      token = user.generateAuthToken();

      userId = user._id;
      data = {
        email: "other@example.com",
        name: "new user",
      };
    });

    const exec = async () =>
      request(server)
        .patch(path.join(endpoint, userId.toString()))
        .set("x-auth-token", token)
        .send(data);

    describe("correct request", () => {
      it("Should return 200 status and valid token", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        const decoded = jwt.verify(res.text, config.get("jwtPrivateKey"));
        expect(decoded).toHaveProperty("_id");
        expect(decoded).toHaveProperty("email", data.email);
      });

      it("Should return 204 status and no token if admin changes it", async () => {
        const user = await createExampleAdmin();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(204);
        expect(res.text).toBeFalsy();
      });

      it("User should be updated in database", async () => {
        await exec();
        const updated = await User.findOne({ email: data.email });
        expect(updated).toBeTruthy();
      });
    });

    it("should return 400 if invalid email is provided", async () => {
      data.email = "invalidEmail";
      const { status } = await exec();

      expect(status).toBe(400);
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });
    it("should return 401 if user wants to change other user without permissions", async () => {
      const user = await createExampleAdmin();
      await user.save();
      userId = user._id;

      const { status } = await exec();
      expect(status).toBe(401);
    });

    it("should return 404 if user does not exists", async () => {
      await User.deleteMany({});
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("should return 401 if not token is provided", async () => {
      token = "";
      const { status } = await exec();
      expect(status).toBe(401);
    });
  });

  describe("PATCH /:id/password", () => {
    let token: string, newPassword: string, userId: ObjectId | string;

    beforeEach(async () => {
      const user = await createExampleUser();
      userId = user._id;
      token = user.generateAuthToken();
      newPassword = "newPassword123";
    });

    const exec = () =>
      request(server)
        .patch(path.join(endpoint, userId.toString(), "password"))
        .set("x-auth-token", token)
        .send({ password: newPassword });

    it("should return 204 and change password", async () => {
      const { status } = await exec();
      expect(status).toBe(204);
      const user: any = await User.findOne({ email: "user@example.com" });
      expect(user.password).not.toBe("Password123");
    });

    it("should return 401 if admin wants to change other account's password", async () => {
      const admin = await createExampleAdmin();
      token = admin.generateAuthToken();

      const { status } = await exec();
      expect(status).toBe(401);
      const user: any = await User.findOne({ email: "user@example.com" });
      expect(user.password).not.toBe("Password123");
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });
    it("should return 404 if user does not exists", async () => {
      await User.deleteMany({});
      const { status } = await exec();
      expect(status).toBe(404);
    });

    it("Should return 400 if no password is provided", async () => {
      newPassword = "";
      const { status } = await exec();
      expect(status).toBe(400);
    });

    it("should return 400 if new password is invalid", async () => {
      newPassword = "pass";
      const { status } = await exec();
      expect(status).toBe(400);
    });

    it("should return 401 if token is no provided", async () => {
      token = "";
      const { status } = await exec();
      expect(status).toBe(401);
    });
  });

  describe("GET /:id/avatar", () => {
    let userId: ObjectId | string;

    beforeEach(async () => {
      const buffer = await fs.readFileSync("./src/tests/files/img.webp");
      const user = new User({
        email: "user@example.com",
        name: "user",
        avatar: buffer,
      });
      await user.save();
      await User.setPassword(user._id, "Password123");
      userId = user._id;
    });

    const exec = () =>
      request(server).get(path.join(endpoint, userId.toString(), "avatar/"));

    it("should return 200 and avatar buffer", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      const isBuffer = Buffer.isBuffer(res.body);
      expect(isBuffer).toBeTruthy();
    });

    it("should return 204 if user does not have avatar", async () => {
      await User.deleteMany({});
      const user = await createExampleUser();
      userId = user._id;
      const res = await exec();
      expect(res.status).toBe(204);
      expect(res.text).toBeFalsy();
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });
    it("should return 400 if user does not exist", async () => {
      await User.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /:id/avatar", () => {
    let token: string, filename: string, userId: ObjectId | string;

    beforeEach(async () => {
      const user = await createExampleUser();

      await user.save();
      token = user.generateAuthToken();
      filename = "img.webp";
      userId = user._id;
    });

    const exec = () =>
      request(server)
        .patch(path.join(endpoint, userId.toString(), "avatar/"))
        .set("x-auth-token", token)
        .attach("avatar", "./src/tests/files/" + filename);

    const testAvatarSetup = async (filename_: string) => {
      filename = filename_;

      const { status } = await exec();
      expect(status).toBe(204);
      const user: any = await User.findOne({ email: "user@example.com" });
      const isBuffer = Buffer.isBuffer(user.avatar);
      expect(isBuffer).toBeTruthy();
    };

    it("should return 204 and set/change avatar", async () => {
      await testAvatarSetup("img.webp");
      await testAvatarSetup("img.png");
      await testAvatarSetup("img.jpg");
    });

    it("should return 401 if token is no provided", async () => {
      token = "";
      const { status } = await exec();
      expect(status).toBe(401);
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });
    it("should return 400 if no file is provided", async () => {
      const { status } = await request(server)
        .patch(path.join(endpoint, userId.toString(), "avatar/"))
        .set("x-auth-token", token);
      expect(status).toBe(400);
    });

    it("should return 404 if user does not exists", async () => {
      await User.deleteMany({});
      const { status } = await exec();
      expect(status).toBe(404);
    });
  });

  describe("DELETE /:id/avatar", () => {
    let userId: ObjectId | string, token: string;

    beforeEach(async () => {
      const buffer = await fs.readFileSync("./src/tests/files/img.webp");
      const user = new User({
        email: "test@example.com",
        name: "test",
        avatar: buffer,
      });
      await user.save();
      await User.setPassword(user._id, "Password123");
      userId = user._id;
      token = user.generateAuthToken();
    });

    const exec = () =>
      request(server)
        .delete(path.join(endpoint, userId.toString(), "avatar/"))
        .set("x-auth-token", token);

    it("should return 204 and delete avatar", async () => {
      const { status } = await exec();
      expect(status).toBe(204);
      const user: any = await User.findById(userId);
      expect(user.avatar).toBe(undefined);
    });

    it("should return 204 and delete avatar if request is from other user with perms", async () => {
      const admin = await createExampleAdmin();
      token = admin.generateAuthToken();
      const { status } = await exec();
      expect(status).toBe(204);
      const user: any = await User.findById(userId);
      expect(user.avatar).toBe(undefined);
    });

    it("should return 401 if user does not have perms", async () => {
      const user = await createExampleUser();
      token = user.generateAuthToken();
      const { status } = await exec();
      expect(status).toBe(401);
    });

    it("should return 404 if ID is invalid", async () => {
      userId = "123";
      const { status } = await exec();
      expect(status).toBe(404);
    });
    it("should return 404 if user does not exist", async () => {
      await User.deleteMany({});
      const { status } = await exec();
      expect(status).toBe(404);
    });
  });
});
