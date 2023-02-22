import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

export const convertAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) return res.status(400).send("File is required.");

  req.file.buffer = await sharp(req.file.buffer)
    .resize({ width: 350, height: 350 })
    .webp()
    .toBuffer();

  return next();
};

export const convertPostImgs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files;
  if (!files) return next();

  if (Array.isArray(files))
    for (let i = 0; i < files.length; i++) {
      const image = await sharp(files[i].buffer);

      files[i].buffer = await image
        .resize(1080, 720, { withoutEnlargement: true, fit: "inside" })
        .webp()
        .toBuffer();
    }

  return next();
};
