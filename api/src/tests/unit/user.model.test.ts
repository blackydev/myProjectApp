import config from "config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, validate } from "../../models/user.js";
import { IUserDocument } from "../../types/user.js";
import server from "../../app.js";

describe("user's model", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });
  afterAll(() => server.close());
  it("new user should return correct object", async () => {
    const email = "user@example.com";
    const name = "user";
    const user = new User({ email, name });
    expect(user).toHaveProperty("_id");
    expect(user).toHaveProperty("email", email);
    expect(user).toHaveProperty("name", name);
    expect(user).toHaveProperty("followed");
    expect(Array.isArray(user.followed)).toBeTruthy();
    expect(user).toHaveProperty("followersCount", 0);
    expect(user).toHaveProperty("followers");
    expect(Array.isArray(user.followers)).toBeTruthy();
    expect(user).toHaveProperty("followersCount", 0);
  });

  describe("followed property validation", () => {
    it("Should return exception if followed array has 1001 followers", async () => {
      const email = "user@example.com";
      const name = "user";
      const followed = [];
      for (let i = 1; i < 1001; i++)
        followed.push(mongoose.Types.ObjectId.generate());
      const user = new User({ email, name, followed });
      try {
        await user.save();
      } catch (ex) {
        expect(true).toBeFalsy();
      }
      await User.deleteMany({});
    });
    it("Should return exception if followed array has more than 1001 followers", async () => {
      const email = "user@example.com";
      const name = "user";
      const followed = [];
      for (let i = 0; i < 1001; i++)
        followed.push(mongoose.Types.ObjectId.generate());
      const user = new User({ email, name, followed });
      try {
        await user.save();
        expect(true).toBeFalsy();
      } catch (ex) {}
      await User.deleteMany({});
    });
  });

  describe("validate()", () => {
    let email: string, name: string, password: string;

    beforeEach(() => {
      email = "user@example.com";
      name = "user";
      password = "Password123";
    });

    const exec = () => validate({ email, name, password });
    it("should not return error", async () => {
      const result = exec();
      expect(result).toHaveProperty("value");
      expect(result).not.toHaveProperty("error");
    });

    describe("email property", () => {
      it("should return error if email is empty", async () => {
        email = "";
        const result = exec();
        expect(result).toHaveProperty("error");
      });

      it("should return error if email is less than 3 characters", async () => {
        email = "a@a";
        const result = exec();
        expect(result).toHaveProperty("error");
      });

      it("should return error if email is more than 320 characters", async () => {
        email = "a@".padEnd(321, "a");
        const result = exec();
        expect(result).toHaveProperty("error");
      });

      it("should return error if email is not valid", async () => {
        email = "incorrectemail";
        const result = exec();
        expect(result).toHaveProperty("error");
      });
    });

    describe("name property", () => {
      it("should return error if name is empty", async () => {
        name = "";
        const result = exec();
        expect(result).toHaveProperty("error");
      });

      it("should return error if name is too short", async () => {
        name = "a";
        const result = exec();
        expect(result).toHaveProperty("error");
      });

      it("should return error if name is too long", async () => {
        name = "a".repeat(65);
        const result = exec();
        expect(result).toHaveProperty("error");
      });
    });

    describe("password property", () => {
      it("should return error if password is empty", async () => {
        password = "";
        const result = exec();
        expect(result).toHaveProperty("error");
      });
    });
  });

  describe("comparePassword method", () => {
    let user: IUserDocument;

    beforeEach(async () => {
      const tmp = new User({
        email: "user@example.com",
        name: "User",
      });
      await tmp.save();
      user = (await User.setPassword(
        tmp._id,
        "Password12345"
      )) as IUserDocument;
    });

    it("should return true if password is correct", async () => {
      const result = await user.comparePassword("Password12345");
      expect(result).toBe(true);
    });

    it("should return false if password is incorrect", async () => {
      const result = await user.comparePassword("password");
      expect(result).toBe(false);
    });
  });

  describe("toJSON", () => {
    let user = new User({
      email: "user@example.com",
      name: "User",
      password: "Password123",
    });

    it("should delete password", () => {
      const result = JSON.stringify(user);
      expect(result.search("password") < 0).toBeTruthy();
      expect(result.search("email") >= 0).toBeTruthy();
    });

    it("should user object has password field", () => {
      expect(user).toHaveProperty("password");
    });
  });

  describe("generateAuthToken", () => {
    let user = new User({
      email: "user@example.com",
      name: "User",
      password: "Password123",
    });

    it("should generate auth token", () => {
      const token = user.generateAuthToken();
      expect(token).toBeTruthy();
    });

    it("should token be valid", () => {
      const token = user.generateAuthToken();
      const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
      expect(decoded).toHaveProperty("_id");
      expect(decoded).toHaveProperty("email");
      expect(decoded).toHaveProperty("name");
    });
  });

  describe("static methods", () => {
    describe("SetPassword", () => {
      let userId: string;

      beforeEach(async () => {
        const user = new User({
          email: "user@example.com",
          name: "User",
        });
        await user.save();
        userId = user._id;
      });

      it("should set the password for a valid password", async () => {
        const password = "ValidPassword123";
        const user = await User.setPassword(userId, password);
        expect(user).toHaveProperty("password");
      });

      it("should throw an error for a password that is too short", async () => {
        const password = "Short1";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });

      it("should throw an error for a password that is too long", async () => {
        const password =
          "ThisIsAReallyReallyReallyReallyReallyReallyReallyReallyLongPassword123";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });

      it("should throw an error for a password without an uppercase letter", async () => {
        const password = "passwordwithoutupper123";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });

      it("should throw an error for a password without a lowercase letter", async () => {
        const password = "PASSWORDWITHOUTLOWER123";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });

      it("should throw an error for a password without a digit", async () => {
        const password = "Passwordwithoutdigit";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });

      it("should throw an error for a password with spaces", async () => {
        const password = "Password with spaces 123";
        const error = await User.setPassword(userId, password);
        expect(error).toBeTruthy();
      });
    });

    describe("follow", () => {
      let follower: IUserDocument, followed: IUserDocument;

      beforeEach(async () => {
        follower = new User({
          email: "follower@example.com",
          name: "follower",
        });
        await follower.save();

        followed = new User({
          email: "followed@example.com",
          name: "followed",
        });
        await followed.save();
      });

      it("should follow user", async () => {
        let user = await User.follow(follower._id, followed._id);
        user = await User.follow(follower._id, followed._id);
        expect(user).toHaveProperty("_id", follower._id);
        expect(user?.followed.length).toBe(1);
        expect(user?.followed[0].toString()).toBe(followed._id.toString());

        user = await User.findById(follower._id);
        expect(user).toBeTruthy();
        expect(user?.followed.length).toBe(1);
        expect(user?.followed[0].toString()).toBe(followed._id.toString());

        user = await User.findById(followed._id);
        expect(user).toBeTruthy();
        expect(user?.followers.length).toBe(1);
        expect(user?.followers[0].toString()).toBe(follower._id.toString());
      });

      it("should do not follow user if follower does not exist", async () => {
        await User.findByIdAndDelete(follower._id);
        let user = await User.follow(follower._id, followed._id);
        expect(user).toBe(null);

        user = await User.findById(followed._id);
        expect(user).toBeTruthy();
        expect(user?.followers.length).toBe(0);
      });

      it("should do not follow user if followed user does not exist", async () => {
        await User.findByIdAndDelete(followed._id);
        let user = await User.follow(follower._id, followed._id);
        expect(user).toBe(null);

        user = await User.findById(follower._id);
        expect(user).toBeTruthy();
        expect(user?.followed.length).toBe(0);
      });
    });
  });
});
