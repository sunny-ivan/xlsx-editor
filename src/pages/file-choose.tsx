import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FileChoose() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    pca.initialize().then(() => {
      if (pca.getAllAccounts().length <= 0) {
        navigate("/login");
      }
    });
  });
  return <div>FileChoose</div>;
}

export default FileChoose;
