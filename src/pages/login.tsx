import { useMsal } from "@azure/msal-react";
import { Typography, Button, Grid, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { ReactComponent as MicrosoftSvg } from "../assets/microsoft.svg";
import { useNavigate } from "react-router-dom";
import { Providers, ProviderState } from "@microsoft/mgt-react";
import { login } from "../services/auth/utils";
import LegalText from "../components/legal";

function Login() {
  const { instance: pca } = useMsal();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      Providers.globalProvider.setState(ProviderState.Loading);
      login();
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  useEffect(() => {
    pca
      .initialize()
      .then(() => {
        return pca.handleRedirectPromise();
      })
      .then(() => {
        setLoading(false);
        if (pca.getAllAccounts().length > 0) {
          Providers.globalProvider.setState(ProviderState.SignedIn);
          navigate("/");
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
            Sign in
          </Typography>
          <LegalText />
          <Typography variant="subtitle1" fontWeight="bold">
            By signing in, you are accepting the terms and conditions. Upon
            selecting your account type during login, corresponding terms of
            use, privacy agreements, and service agreements will be applicable.
          </Typography>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignIn}
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            {loading ? "Communicating with " : " Sign in with"}
            <MicrosoftSvg style={{ height: "1.5rem", marginLeft: 10 }} />
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Login;
