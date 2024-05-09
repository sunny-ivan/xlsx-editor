import { Box } from "@mui/material";
import { appName, redirectUri } from "../../config";
import Disclaimer from "./disclaimer";
import PrivacyStatement from "./privacy-statement";
import TrademarkDisclaimer from "./trademark-disclaimer";

export default function LegalText() {
  return (
    <Box>
      <Disclaimer
        xname={appName}
        xurl={redirectUri}
        yname="Microsoft"
        yurl="https://www.microsoft.com/"
      />
      <TrademarkDisclaimer xname={appName} xurl={redirectUri} />
      <PrivacyStatement />
    </Box>
  );
}
