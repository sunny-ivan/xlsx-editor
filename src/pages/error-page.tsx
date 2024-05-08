import { isRouteErrorResponse } from "react-router-dom";
import "./error-page.css";
import { Typography } from "@mui/material";

function errorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    console.error(error);
    return "Unknown error";
  }
}

interface ChildProps {
  error: Error;
}

export default function ChildComponent(props: ChildProps) {
  const error = props.error;
  console.error(
    "An error has occurred. The program has invoked the error page."
  );
  console.error(error);

  return (
    <div id="error-page">
      <Typography variant="h4" color="error">
        Oops! Something went wrong.
      </Typography>
      <Typography variant="body1">
        <i>{errorMessage(error)}</i>
      </Typography>
    </div>
  );
}
