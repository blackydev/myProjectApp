import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_IP + "/api/";

const http = axios.create({
  baseURL: apiEndpoint,
});

http.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) console.log("An unexpected error occurred"); // should implement logger

  return Promise.reject(error);
});

const setJwt = (jwt: string | null) =>
  (http.defaults.headers.common["x-auth-token"] = jwt);

const httpService = {
  get: http.get,
  post: http.post,
  put: http.put,
  delete: http.delete,
  patch: http.patch,
  setJwt,
  apiEndpoint,
};

export default httpService;
