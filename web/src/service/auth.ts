import http from "./http";
import jwtDecode from "jwt-decode";
import { AxiosError } from "axios";
const endpoint = "auth/";
const tokenKey = "token";

const login = async (data: {
  email: string;
  password: string;
}): Promise<AxiosError | void> => {
  const { data: jwt } = await http.post<string>(endpoint, data);
  localStorage.setItem(tokenKey, jwt);
};

const getJwt = () => localStorage.getItem(tokenKey);
const setJwt = (token: string) => localStorage.setItem(tokenKey, token);
const logout = () => localStorage.removeItem(tokenKey);

const getUser = () => {
  try {
    const jwt: any = localStorage.getItem(tokenKey);
    return jwtDecode(jwt) as {
      _id: string;
      email: string;
      name: string;
      permissions: number;
    };
  } catch (ex) {
    logout();
    return null;
  }
};

http.setJwt(getJwt());

const authService = {
  setJwt,
  getJwt,
  login,
  logout,
  getUser,
};

export default authService;
