import { redirect } from "react-router-dom";
import authService from "../service/auth";

export const signLoader = async () => {
    const user = authService.getUser();
    if(user) return redirect("/");
    return null;
};