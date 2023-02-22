import avatarMulter from "./upload/multer.avatar.js";
import errorHandler from "./upload/errorHandler.js";
import { convertAvatar, convertPostImgs } from "./upload/convert.js";
import postMulter from "./upload/multer.post.js";

const upload = {
  avatar: [avatarMulter.single("avatar"), errorHandler, convertAvatar],
  post: [postMulter.array("images"), errorHandler, convertPostImgs],
};

export default upload;
