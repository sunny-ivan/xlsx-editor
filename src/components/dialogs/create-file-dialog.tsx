import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { errorMessage } from "../../utils/error";
import { createFile } from "../../services/drive";
import capitalize from "lodash/capitalize";

export interface IProps {
  open: boolean;
  onClose: (created: boolean, name?: string) => void;
  folderid: string;
  default?: string;
  extension?: string;
}

export default function CreateFileDialog(props: IProps) {
  const { onClose, open, ...other } = props;

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null as Error | null);

  useEffect(() => {
    if (open) {
      // reset the states
      setError(null);
      setCreating(false);
      setName(props.default ? props.default : "");
    }
  }, [open, props.default]);

  const closeDlg = (created: boolean = false, name?: string) => {
    onClose(created, name);
  };

  const handleCancel = () => {
    closeDlg();
  };

  const handleOk = () => {
    setCreating(true);
    setError(null);
    const filename = name + "." + props.extension;
    createFile(props.folderid, filename)
      .then((item) => {
        setCreating(false);
        if (item && item.name) {
          closeDlg(true, item.name);
        } else {
          closeDlg(true, filename);
        }
      })
      .catch((error) => {
        console.error(error);
        setError(error);
        setCreating(false);
      });
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      {...other}
    >
      <DialogTitle>
        Create{props.extension ? ` ${capitalize(props.extension)} ` : " "}
        File
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error">
            {errorMessage(error) +
              // if error has errorEscaped
              (Object.prototype.hasOwnProperty.call(error, "errorEscaped") &&
              (error as any).errorEscaped
                ? // get error code
                  " (" + (error as any).errorEscaped.code + ")"
                : "")}
          </Alert>
        )}
        <FormControl fullWidth style={{ marginTop: 20 }}>
          <TextField
            id="drive-fileitem-create-input"
            label="Name"
            variant="outlined"
            defaultValue={props.default}
            value={name}
            onChange={(event) => setName(event.target.value)}
            InputProps={{ readOnly: creating }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button disabled={creating} autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <LoadingButton loading={creating} onClick={handleOk} color="primary">
          <span>Ok</span>
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
