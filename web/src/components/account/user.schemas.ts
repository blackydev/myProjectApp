import * as Yup from "yup";

export default {
  email: Yup.string().email().min(3).max(320).required(),
  name: Yup.string().min(3).max(64).required(),
  password: Yup.string().min(8).max(56).required(),
};
