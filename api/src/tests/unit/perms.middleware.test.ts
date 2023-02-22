import express, { Express, Request, Response } from "express";
import request from "supertest";
import path from "path";
import perms from "../../middleware/perms.js";
import { User } from "../../models/user.js";
import auth from "../../middleware/auth.js";
import Permissions from "../../utils/permisions.js";
const app: Express = express();

app.use(auth);
app.get("/users/:id", perms.users, (req: Request, res: Response) => {
  res.status(204).send();
});

app.get("/onlySelf/:id", perms.onlySelf, (req: Request, res: Response) => {
  res.status(204).send();
});

const server = app.listen();

const createAdminToken = (perms: number) => {
  const admin = new User({
    email: "admin@example.com",
    name: "admin",
    permissions: perms,
  });
  return admin.generateAuthToken();
};

describe("perms middleware", () => {
  let endpoint: string, token: string, user: any;
  beforeEach(() => {
    user = new User({
      email: "user@example.com",
      name: "user",
    });
    token = user.generateAuthToken();
  });

  afterAll(() => {
    server.close();
  });

  const exec = () => request(server).get(endpoint).set("x-auth-token", token);

  describe("users", () => {
    beforeEach(() => {
      endpoint = path.join("/users/" + user._id);
    });

    it("should return 204", async () => {
      const res = await exec();
      expect(res.status).toBe(204);
    });

    it("should return 204 if token is from another user with permissions", async () => {
      token = createAdminToken(Permissions.users);
      const res = await exec();
      expect(res.status).toBe(204);
    });

    it("should return 401 if user does not have permissions", async () => {
      token = createAdminToken(Permissions.none);
      const { status } = await exec();
      expect(status).toBe(401);
    });
  });

  describe("onlySelf", () => {
    beforeEach(() => {
      endpoint = path.join("/onlySelf/" + user._id);
    });

    it("should return 204", async () => {
      const res = await exec();
      expect(res.status).toBe(204);
    });

    it("should return 401 if user does not have permissions", async () => {
      token = createAdminToken(Permissions.users);
      const { status } = await exec();
      expect(status).toBe(401);
    });
  });
});
