import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const validateObjectId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid ID.");
  return next();
};

export default validateObjectId;
