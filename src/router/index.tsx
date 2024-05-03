import { Navigate, createBrowserRouter } from "react-router-dom";
import FileChoose from "../pages/file-choose";
import FileView from "../pages/file-view";
import Login from "../pages/login";
import RouteError from "../pages/route-error";
import Logout from "../pages/logout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
    errorElement: <RouteError />,
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/choose", element: <FileChoose /> },
  { path: "/view", element: <FileView /> },
]);

export default router;
