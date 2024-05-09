import { useMsal } from "@azure/msal-react";
import { Typography, Button, Grid, Paper } from "@mui/material";
import { EndSessionRequest } from "@azure/msal-browser";
import { useEffect } from "react";
import { ReactComponent as MicrosoftSvg } from "../assets/microsoft.svg";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const logOutRequest: EndSessionRequest = {
        account: pca.getAllAccounts()[0],
        postLogoutRedirectUri: window.location.href,
        logoutHint: pca.getAllAccounts()[0].username,
      };

      pca.logoutRedirect(logOutRequest);
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  useEffect(() => {
    pca
      .initialize()
      .then(() => {
        return pca.handleRedirectPromise();
      })
      .then(() => {
        if (pca.getAllAccounts().length <= 0) {
          navigate("/login");
        }
      });
  });

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ height: "100vh" }}
    >
      <Grid item xs={11} sm={8} md={6}>
        <Paper elevation={3} style={{ padding: 20 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign out your{" "}
            <MicrosoftSvg
              style={{ marginLeft: 10, height: 40, marginBottom: -10 }}
            />{" "}
            account
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignOut}
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            Sign out
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Logout;
