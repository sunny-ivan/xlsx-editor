import { ReactNode, useEffect } from "react";
import pca from "../services/auth/configure";
import { MsalProvider } from "@azure/msal-react";

type SlotProps = {
  children: ReactNode;
};

export default function AuthProvider(props: SlotProps) {
  const { children } = props;

  useEffect(() => {
    pca.initialize();
  });

  return <MsalProvider instance={pca} children={children} />;
}
