import express, { Request, Response } from "express";
import { User } from "../models/user.js";
import validateAuth from "../models/user/auth.validation.js";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as { email: string; password: string };

  const { error } = validateAuth(body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const compare = await user.comparePassword(body.password);
  if (!compare) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

export default router;
