import { ReactNode, useEffect } from "react";
import pca from "../services/auth/configure";
import { MsalProvider } from "@azure/msal-react";
import { ProviderState, Providers } from "@microsoft/mgt-react";
import provider from "../services/auth/mgt-provider";

type SlotProps = {
  children: ReactNode;
};

export default function AuthProvider(props: SlotProps) {
  const { children } = props;

  useEffect(() => {
    pca.initialize().then(() => {
      if (pca.getAllAccounts().length > 0) {
        Providers.globalProvider.setState(ProviderState.SignedIn);
      } else {
        Providers.globalProvider.setState(ProviderState.SignedOut);
      }
    });
  });

  Providers.globalProvider = provider;

  return <MsalProvider instance={pca} children={children} />;
}
