import { useMsal } from "@azure/msal-react";
import { FileList, Person } from "@microsoft/mgt-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAppFolder, getItemId } from "../services/drive";
import ErrorPage from "./error-page";
import { appdataDirectory } from "../config";
import MgtTemplate from "../components/mgt-template";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { DriveItem } from "@microsoft/microsoft-graph-types";
import CustomHistory from "../utils/history";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CreateFileDialog from "../components/create-file-dialog";

const history = new CustomHistory();

function ChooseFile() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as Error | null);
  const [directoryId, setDirectoryId] = useState("");
  const [allowBack, setAllowBack] = useState(false);

  const [openCreateFile, setOpenCreateFile] = useState(false);

  // item-path: item-id
  // const dirStorage: { [key: string]: string } = {};

  const updateAllowBack = () => {
    setAllowBack(history.hasPreviousPage);
  };

  const loadFolder = async (directoryId: string) => {
    history.addPage(directoryId);
    setDirectoryId(history.getCurrentPage());
    updateAllowBack();
  };

  const initAppFolder = async () => {
    try {
      setLoading(true);
      await createAppFolder();

      const getItemResponse = await getItemId(appdataDirectory);
      const appdirId = getItemResponse.id;
      loadFolder(appdirId);

      setError(null);
      setLoading(false);
    } catch (error: any) {
      setError(error);
      setLoading(false);
      console.error("Error create app folder:", error);
    }
  };

  useEffect(() => {
    pca.initialize().then(() => {
      if (pca.getAllAccounts().length <= 0) {
        navigate("/login");
      } else {
        return initAppFolder();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // To run the effect only once, set the array empty

  const handleBack = () => {
    history.goToPreviousPage();
    setDirectoryId(history.getCurrentPage());
    updateAllowBack();
  };

  // Fired when the user selects a file.
  const handleItemClick = (event: CustomEvent<DriveItem>): void => {
    const item = event.detail;

    if (item.folder) {
      if (!item.id) {
        throw new Error("item.id is not a valid string");
      }
      loadFolder(item.id);
      return;
    }

    if (
      item.file &&
      item.name?.endsWith(".xlsx") &&
      item.file.mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      navigate("/choose/" + item.parentReference?.driveId + "/" + item.id);
      return;
    }

    console.log(item);
  };

  return (
    <Container maxWidth="sm">
      <Person personQuery="me" view="twolines" personCardInteraction="click" />
      <br />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <ErrorPage error={error} />
      ) : (
        <Box>
          <Stack spacing={2} direction="row" style={{ marginBottom: 15 }}>
            <IconButton disabled={!allowBack} onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              aria-label="create"
              onClick={() => {
                setOpenCreateFile(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Stack>
          <FileList
            key={directoryId}
            itemId={directoryId}
            enableFileUpload={false}
            disableOpenOnClick={true}
            fileExtensions={["xlsx", ""]}
            itemClick={handleItemClick}
          >
            <MgtTemplate template="loading">
              <Typography variant="subtitle1">Loading your files...</Typography>
            </MgtTemplate>
            <MgtTemplate template="no-data">
              <Typography variant="subtitle1">No files found</Typography>
            </MgtTemplate>
          </FileList>
        </Box>
      )}

      <CreateFileDialog
        open={openCreateFile}
        onClose={(created) => {
          setOpenCreateFile(false);
          if (created) {
            initAppFolder();
          }
        }}
        folderid={directoryId}
        default="Book"
        extension="xlsx"
      />
    </Container>
  );
}

export default ChooseFile;
