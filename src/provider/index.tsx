import { ReactNode } from "react";
import AuthProvider from "./auth-provider";
import MuiThemeProvider from "./mui-theme-provider";
import EmotionThemeProvider from "./emotion-theme-provider";
import { ConfirmProvider } from "material-ui-confirm";
<<<<<<< HEAD
import SnackbarProvider from "./SnackbarProvider";
=======
import { SnackServiceProvider } from "@insdim-lab/mui-plugins";
>>>>>>> aaa7069e82d743ba2a1beab7200b64f9c5b219de

type SlotProps = {
  children: ReactNode;
};

export default function GlobalProvider(props: SlotProps) {
  const { children } = props;

  return (
    <MuiThemeProvider>
      <EmotionThemeProvider>
        <ConfirmProvider>
<<<<<<< HEAD
          <SnackbarProvider>
            <AuthProvider children={children} />
          </SnackbarProvider>
=======
          <SnackServiceProvider>
            <AuthProvider children={children} />
          </SnackServiceProvider>
>>>>>>> aaa7069e82d743ba2a1beab7200b64f9c5b219de
        </ConfirmProvider>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  );
}
