import request from "supertest";
import config from "config";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import { User } from "../../models/user.js";

const endpoint = "/api/auth/";

describe("auth's route", () => {
  beforeAll(async () => {
    const user = new User({
      email: "auth@example.com",
      name: "user",
    });
    await user.save();
    await User.setPassword(user._id, "Password123");
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    app.close();
  });

  describe("POST /", () => {
    let auth: { email: string; password: string };
    beforeEach(() => {
      auth = {
        email: "auth@example.com",
        password: "Password123",
      };
    });

    const exec = () => request(app).post(endpoint).send(auth);

    it("should return 200 and valid token", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      const decoded = jwt.verify(res.text, config.get("jwtPrivateKey"));
      expect(decoded).toHaveProperty("_id");
      expect(decoded).toHaveProperty("email", "auth@example.com");
    });

    it("should return 400 if invalid email is provided", async () => {
      auth.email = "invalid_email";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid password is provided", async () => {
      auth.password = "";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if the email is not found in the database", async () => {
      auth.email = "not_found@example.com";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid password is provided for the given email", async () => {
      auth.password = "InvalidPassword123";
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});
