import { Box } from "@mui/material";
import { appName, redirectUri } from "../../config";
import Disclaimer from "./disclaimer";
import PrivacyStatement from "./privacy-statement";

export default function LegalText() {
  return (
    <Box>
      <Disclaimer
        xname={appName}
        xurl={redirectUri}
        yname="Microsoft"
        yurl="https://www.microsoft.com/"
      />
      <PrivacyStatement />
    </Box>
  );
}
