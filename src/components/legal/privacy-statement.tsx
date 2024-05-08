import { Box, Typography, Link } from "@mui/material";

export default function PrivacyStatement() {
  return (
    <Box>
      <Typography variant="body1">
        <Link href="https://www.cloudflare.com/insights/">Beacons</Link> will
        collect combined data for enhancing website performance, security, and
        user experience. Read their Privacy Policy{" "}
        <Link href="https://www.cloudflare.com/privacypolicy/">here</Link>. Hosting Provider may use the data to improve their hosting.
      </Typography>
    </Box>
  );
}
