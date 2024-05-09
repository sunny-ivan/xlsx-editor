import { Navigate, createBrowserRouter } from "react-router-dom";
import ChooseFile from "../pages/choose-file";
import ViewTable from "../pages/view-table";
import Login from "../pages/login";
import RouteError from "../pages/route-error";
import Logout from "../pages/logout";
import ChooseWorksheet from "../pages/choose-worksheet";
import ChooseTable from "../pages/choose-table";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/view" />,
    errorElement: <RouteError />,
  },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },
  { path: "/choose", element: <ChooseFile /> },
  { path: "/choose/:driveId/:itemId", element: <ChooseWorksheet /> },
  { path: "/choose/:driveId/:itemId/:worksheetId", element: <ChooseTable /> },
  { path: "/view", element: <ViewTable /> },
]);

export default router;
