import { isRouteErrorResponse } from "react-router-dom";

function errorMessageBase(error: unknown): string {
  if (error === null) {
    return "null";
  } else if (isRouteErrorResponse(error)) {
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

function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "";
  }

  if (Object.prototype.hasOwnProperty.call(error, "code")) {
    return (error as { code: any }).code;
  }

  // if error has errorEscaped
  return Object.prototype.hasOwnProperty.call(error, "errorEscaped") &&
    (error as { errorEscaped: any }).errorEscaped.code
    ? (error as any).errorEscaped.code
    : "";
}

export function errorMessage(error: unknown): string {
  const code = errorCode(error);
  return errorMessageBase(error) + (code ? " (" + code + ")" : "");
}
