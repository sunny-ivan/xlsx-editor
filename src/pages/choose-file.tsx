import { useMsal } from "@azure/msal-react";
import { FileList, Person } from "@microsoft/mgt-react";
import { createRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAppFolder, getItemId, getItemUrl } from "../services/drive";
import ErrorPage from "./error-page";
import { appdataDirectory } from "../config";
import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { DriveItem } from "@microsoft/microsoft-graph-types";
import CustomHistory from "../utils/history";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CreateFileDialog from "../components/dialogs/create-file-dialog";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useConfirm } from "material-ui-confirm";
import { getAccount } from "../services/auth/utils";
import RefreshIcon from "@mui/icons-material/Refresh";

const history = new CustomHistory();

function ChooseFile() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as Error | null);
  const [directoryId, setDirectoryId] = useState("");
  const [allowBack, setAllowBack] = useState(false);

  const [openBackdrop, setOpenBackdrop] = useState(false);

  const filelistRef = createRef();

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
            <IconButton
              aria-label="back"
              disabled={!allowBack}
              onClick={handleBack}
            >
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
            <IconButton
              aria-label="refresh"
              onClick={() => {
                // TODO: implement reloading
              }}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              aria-label="open in new tab"
              onClick={() => {
                let username = "";
                setOpenBackdrop(true);
                new Promise<void>((resolve, _reject) => {
                  getAccount()
                    .then((account) => {
                      username = account.username || "this account";
                      resolve();
                    })
                    .catch(() => {
                      username = "this account";
                      resolve();
                    });
                })
                  .then(() => {
                    return getItemUrl(directoryId);
                  })
                  .then((response) => {
                    return response && typeof response.value === "string"
                      ? response.value
                      : // eslint-disable-next-line no-script-url
                        "javascript:void(0);";
                  })
                  .then((url: string) => {
                    setOpenBackdrop(false);
                    return confirm({
                      title: "",
                      confirmationButtonProps: {
                        style: {
                          display: "none",
                        },
                      },
                      cancellationText: "Close",
                      content: (
                        <Box style={{ margin: "10px 0px" }}>
                          <Typography>
                            <Link
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Click here
                            </Link>{" "}
                            to open the folder in a new tab? You need to be
                            logged in as{" "}
                            <Box
                              component="strong"
                              display="inline"
                              children={username}
                            ></Box>{" "}
                            to access this folder.
                          </Typography>
                        </Box>
                      ),
                    });
                  })
                  .then(() => {
                    // openned successfully
                  })
                  .catch((error) => {
                    setOpenBackdrop(false);
                    if (error === undefined) {
                      // user closed
                      return;
                    }
                  });
              }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Stack>
          <FileList
            key={directoryId}
            itemId={directoryId}
            enableFileUpload={false}
            disableOpenOnClick={true}
            fileExtensions={["xlsx", ""]}
            itemClick={handleItemClick}
            ref={filelistRef}
          />
          {/* // TODO: implement loading and no-data template correctly */}
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

      <Backdrop open={openBackdrop} style={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}

export default ChooseFile;
