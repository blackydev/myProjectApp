import http from "./http";
import joinURL from "url-join";
const endpoint = "posts/";

const getWall = () => http.get("endpoint");

const createOne = (data: {
  content: string;
  parent?: string;
  media?: Buffer[];
}) =>
  http.post<{
    _id: string;
    author: string;
    parent: string;
    content: string;
    media: Buffer[];
    likesCount: number;
    createdAt: Date;
  }>(endpoint, data);

const postService = {
  getWall,
  createOne,
};

export default postService;
