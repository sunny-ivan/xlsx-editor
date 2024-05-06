import { useMsal } from "@azure/msal-react";
import { Person } from "@microsoft/mgt-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./error-page";
import { Box, Container } from "@mui/material";

function ChooseWorksheet() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const { fileId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as Error | null);

  useEffect(() => {
    pca.initialize().then(() => {
      if (pca.getAllAccounts().length <= 0) {
        navigate("/login");
      } else {
        // return initAppFolder();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // To run the effect only once, set the array empty

  return (
    <Container maxWidth="sm">
      <Person personQuery="me" view="twolines" personCardInteraction="click" />
      <br />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <ErrorPage error={error} />
      ) : (
        <Box>{fileId}</Box>
      )}
    </Container>
  );
}

export default ChooseWorksheet;
