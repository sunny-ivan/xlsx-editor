import { useRouteError } from "react-router-dom";
import ErrorPage from "./error-page";

export default function RouteError() {
  const error = useRouteError();
  return <ErrorPage error={error as Error} />;
}
