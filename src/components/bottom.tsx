import { useTheme } from "@mui/material";
import { applyTheme } from "@microsoft/mgt-react";
import { useEffect } from "react";

export default function Bottom() {
  const theme = useTheme();

  useEffect(() => {
    applyTheme(theme.palette.mode);
  }, [theme]);

  return <template />;
}
