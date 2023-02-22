import { IUserDocument } from "./user.js";

declare global {
  namespace Express {
    interface Request {
      user: IUserDocument;
    }
  }
}
