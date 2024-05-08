import { isRouteErrorResponse } from "react-router-dom";

export function errorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    return error.message;
  } else if (error && Object.prototype.hasOwnProperty.call(error, "message")) {
    try {
      return (error as any).message;
    } catch (error) {
      return "Unknown error";
    }
  } else if (typeof error === "string") {
    return error;
  } else {
    console.error(error);
    return "Unknown error";
  }
}
