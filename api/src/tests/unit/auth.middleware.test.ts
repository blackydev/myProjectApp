import express, { Express, Request, Response } from "express";
import request from "supertest";
import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
const app: Express = express();
app.get("/", auth, (req: Request, res: Response) => {
  res.send(req.user);
});
const server = app.listen();

describe("auth middleware", () => {
  let token: string;
  beforeEach(() => {
    const user = new User({
      email: "user@example.com",
      name: "user",
    });
    token = user.generateAuthToken();
  });

  afterAll(() => {
    server.close();
  });

  const exec = () => request(server).get("/").set("x-auth-token", token);

  it("should return 200 with valid user", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("email", "user@example.com");
    expect(res.body).toHaveProperty("name", "user");
  });

  it("should return 401 if no token is provided", async () => {
    token = "";
    const { status } = await exec();
    expect(status).toBe(401);
  });

  it("should return 400 if invalid token is provided", async () => {
    token = "123";
    const { status } = await exec();
    expect(status).toBe(400);
  });
});
