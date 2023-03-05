import http from "./http";
import joinURL from "url-join";
const endpoint = "users/";

const signup = (data: { email: string; name: string; password: string }) =>
  http.post(endpoint, data);

const get = (userId: string) =>
  http.get<{
    _id: string;
    name: string;
    followedCount: number;
    followersCount: number;
  }>(joinURL(endpoint, userId));

const getPosts = (userId: string, page: number) =>
  http.get<{
    _id: string;
    content: string;
    parent: string;
    likesCount: string;
    createdAt: string;
  }>(joinURL(endpoint, userId, "/posts"), {
    params: {
      page,
    },
  });

const change = (
  userId: string,
  data: {
    email: string;
    name: string;
  },
) => http.patch<string>(joinURL(endpoint, userId), data); // returns token if request is correct

const changePassword = (userId: string, newPassword: string) =>
  http.patch(joinURL(endpoint, userId, "/password"), { password: newPassword });

const changeAvatar = (userId: string, file: File) => {
  const data = new FormData();
  data.append("avatar", file);
  return http.patch(joinURL(endpoint, userId, "/avatar"), data);
};

const deleteAvatar = (userId: string) =>
  http.delete(joinURL(endpoint, userId, "/avatar"));

const follow = (userId: string) =>
  http.patch(joinURL(endpoint, userId, "follow"));

const unfollow = (userId: string) =>
  http.patch(joinURL(endpoint, userId, "unfollow"));

const getAvatarURL = (userId?: string) => {
  return userId ? joinURL(http.apiEndpoint, endpoint, userId, "/avatar") : "";
};

const userService = {
  signup,

  get,
  getPosts,
  getAvatarURL,

  change,
  changePassword,
  changeAvatar,
  deleteAvatar,

  follow,
  unfollow,
};

export default userService;
