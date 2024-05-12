import React, { createContext, useContext, useState, ReactNode } from "react";
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";
import Alert, { AlertProps } from "@mui/material/Alert";

type SnackbarData = {
  message: ReactNode;
  severity: AlertProps["severity"];
  action?: ReactNode;
  snackbarProps?: SnackbarProps;
  alertProps?: AlertProps;
  open: boolean;
};

type SnackbarContextType = {
  openSnackbar: (data: SnackbarData) => void;
  closeSnackbar: (index: number) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

type SnackbarProviderProps = {
  children: ReactNode;
};

const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarData[]>([]);

  const openSnackbar = (data: SnackbarData) => {
    const newSnackbar = {
      ...data,
      open: true,
    };

    setSnackbars([...snackbars, newSnackbar]);
  };

  const closeSnackbar = (index: number) => {
    const updatedSnackbars = [...snackbars];
    updatedSnackbars[index].open = false;
    setSnackbars(updatedSnackbars);
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={index}
          {...snackbar.snackbarProps}
          open={snackbar.open}
          onClose={() => closeSnackbar(index)}
        >
          <Alert severity={snackbar.severity} {...snackbar.alertProps}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
