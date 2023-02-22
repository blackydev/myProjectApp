import { Request, Response, NextFunction } from "express";
import config from "config";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = new User(decoded);
  } catch (ex) {
    return res.status(400).send("Invalid token.");
  }
  return next();
};

export default auth;
