import { Request, Response, NextFunction } from "express";
import "express-async-errors";
import logger from "../utils/logger.js";

const exceptionHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);
  return res.status(500).send("Sorry, an unexpected server error occurred.");
};

export default exceptionHandler;
