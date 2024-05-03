import { ThemeProvider, createTheme } from "@mui/material";
import { ReactNode } from "react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

type SlotProps = {
  children: ReactNode;
};

export default function MuiThemeProvider(props: SlotProps) {
  const { children } = props;

  return <ThemeProvider theme={darkTheme} children={children} />;
}
