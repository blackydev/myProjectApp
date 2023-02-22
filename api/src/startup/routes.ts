import { Express, json, urlencoded } from "express";
import users from "../routes/users.js";
import auth from "../routes/auth.js";
import posts from "../routes/posts.js";

export default (app: Express): void => {
  app.use(json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/posts", posts);
};
