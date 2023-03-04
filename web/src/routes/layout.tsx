import { Outlet, ScrollRestoration } from "react-router-dom";
import MenuBar from '../components/menuBar';

const Layout = () => {
  return (
    <>
      <div>
        <MenuBar />
        <ScrollRestoration />
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
