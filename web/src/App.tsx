import { createBrowserRouter,redirect } from "react-router-dom";
import Home, {loader as homeLoader}  from './routes/home';
import Layout from './routes/layout';
import Account from './routes/account';
import { signLoader } from "./routes/sign";
import SignupForm from "./components/accountForms/signupForm";
import LoginForm from "./components/accountForms/loginForm";
import Profile from "./routes/profile";

const router = createBrowserRouter([
      {
      path: "/",
      element: <Layout />,
      loader: homeLoader,
      children:
        [{
          path: "/",
          element: <Home />,
        },
        {
          path: "/account/",
          element: <Account/>
        },
        {
          path: "/users/:id",
          element: <Profile/>
        }
      ]
      },
      {
        path: "/sign-up",
        element: <SignupForm />,
        loader: signLoader
      },
      {
        path: "/login",
        element: <LoginForm/>,
        loader: signLoader
      }, 
]);

export default router;
