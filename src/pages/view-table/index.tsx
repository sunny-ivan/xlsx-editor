import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hasPreferDocument } from "../../services/storage/prefer-document";
import Playground from "./playground-table";

function ViewTable() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPreferDocument()) {
      navigate("/choose");
    }

    pca.initialize().then(() => {
      if (pca.getAllAccounts().length <= 0) {
        navigate("/login");
      }
    });
  });

  return <Playground />;
}

export default ViewTable;
