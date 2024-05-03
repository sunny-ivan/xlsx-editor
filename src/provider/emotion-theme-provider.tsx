import { Global, ThemeProvider, css } from "@emotion/react";
import { useTheme } from "@mui/material";
import { ReactNode } from "react";

type SlotProps = {
  children: ReactNode;
};

export default function EmotionThemeProvider(props: SlotProps) {
  const { children } = props;

  return (
    <ThemeProvider theme={useTheme()}>
      <Global
        styles={css`
          body {
            background-color: ${useTheme().palette.background.default};
            color: ${useTheme().palette.text.primary};
          }
        `}
      />
      {children}
    </ThemeProvider>
  );
}
