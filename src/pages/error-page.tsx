import "./error-page.css";
import { Typography } from "@mui/material";
import { errorMessage } from "../utils/error";

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
