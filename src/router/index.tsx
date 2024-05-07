import { Navigate, createBrowserRouter } from "react-router-dom";
import ChooseFile from "../pages/choose-file";
import ViewSheet from "../pages/view-sheet";
import Login from "../pages/login";
import RouteError from "../pages/route-error";
import Logout from "../pages/logout";
import ChooseWorksheet from "../pages/choose-worksheet";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
    errorElement: <RouteError />,
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/choose", element: <ChooseFile /> },
  { path: "/choose/:driveId/:itemId", element: <ChooseWorksheet /> },
  { path: "/view", element: <ViewSheet /> },
]);

export default router;
