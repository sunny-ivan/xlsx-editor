import { ReactNode } from "react";
import AuthProvider from "./auth-provider";
import MuiThemeProvider from "./mui-theme-provider";
import EmotionThemeProvider from "./emotion-theme-provider";
import { ConfirmProvider } from "material-ui-confirm";
import SnackbarProvider from "./snackbar-provider";

type SlotProps = {
  children: ReactNode;
};

export default function GlobalProvider(props: SlotProps) {
  const { children } = props;

  return (
    <MuiThemeProvider>
      <EmotionThemeProvider>
        <ConfirmProvider>
          <SnackbarProvider>
            <AuthProvider children={children} />
          </SnackbarProvider>
        </ConfirmProvider>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  );
}
