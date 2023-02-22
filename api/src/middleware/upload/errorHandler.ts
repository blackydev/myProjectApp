import { Request, Response, NextFunction } from "express";

const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message === "415")
    return res
      .status(415)
      .send("Unsupported media type. Please send webp, png or jpg.");

  if (err.message === "413")
    return res
      .status(413)
      .send("File is too large. File should be smaller than 20mb.");

  if (err.message === "422") return res.status(422).send("Too many files.");

  return next();
};

export default errorHandler;
