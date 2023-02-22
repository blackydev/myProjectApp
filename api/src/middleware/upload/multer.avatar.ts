import { Request } from "express";
import multer from "multer";

const maxSize = 1024 * 1024 * 20;

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  let size = 0;
  const contentLength = req.headers["content-length"];
  if (typeof contentLength === "string") size = parseInt(contentLength);

  const validExt = ["image/jpeg", "image/png", "image/webp"];
  if (!validExt.includes(file.mimetype)) return cb(new Error("415"));

  if (maxSize < size) return cb(new Error("413"));

  return cb(null, true);
};

const avatarMulter = multer({
  storage,
  fileFilter,
});

export default avatarMulter;
