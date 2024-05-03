import { isRouteErrorResponse } from "react-router-dom";
import "./error-page.css";

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
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Something went wrong.</p>
      <p>
        <i>{errorMessage(error)}</i>
      </p>
    </div>
  );
}
