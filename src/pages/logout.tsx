import { useMsal } from "@azure/msal-react";
import { Typography, Button, Grid, Paper, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { ReactComponent as MicrosoftSvg } from "../assets/microsoft.svg";
import { useNavigate } from "react-router-dom";
import { Providers, ProviderState } from "@microsoft/mgt-react";
import { logout } from "../services/auth/utils";

function Logout() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      Providers.globalProvider.setState(ProviderState.SignedOut);
      logout();
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
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              style={{ marginLeft: 10, height: 30, marginBottom: -5 }}
            />{" "}
            account
          </Typography>
          <Stack spacing={1} direction="column" style={{ marginTop: 20 }}>
            <Button
              disabled={loading}
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSignOut}
            >
              {loading ? "Signing you out" : "Sign out"}
            </Button>
            <Button color="primary" fullWidth onClick={() => navigate(-1)}>
              Back
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Logout;
