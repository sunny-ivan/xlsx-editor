import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createWorksheet } from "../services/workbooks/worksheets";
import { LoadingButton } from "@mui/lab";
import { errorMessage } from "../utils/error";

export interface IProps {
  open: boolean;
  onClose: () => void;
  driveid: string;
  itemid: string;
}

export default function CreateWorksheetDialog(props: IProps) {
  const { onClose: closeDlg, open, ...other } = props;

  useEffect(() => {});

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null as Error | null);

  const handleCancel = () => {
    closeDlg();
  };

  const handleOk = () => {
    setCreating(true);
    setError(null);
    createWorksheet(props.driveid, props.itemid, { name })
      .then(() => {
        setCreating(false);
        closeDlg();
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
      <DialogTitle>Create Worksheet</DialogTitle>
      <DialogContent dividers>
        {error ? (
          <Alert severity="error">
            {errorMessage(error) +
              // if error has errorEscaped
              (Object.prototype.hasOwnProperty.call(error, "errorEscaped") &&
              (error as any).errorEscaped
                ? // get error code
                  " (" + (error as any).errorEscaped.code + ")"
                : "")}
          </Alert>
        ) : null}
        <FormControl fullWidth style={{ marginTop: 20 }}>
          <TextField
            id="workbook-worksheet-create-input"
            label="Name"
            variant="outlined"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-describedby="workbook-worksheet-create-helper-text"
          />
          <FormHelperText id="workbook-worksheet-create-helper-text">
            Optional. The name of the worksheet to be added. If specified, name
            should be unique. If not specified, Excel determines the name of the
            new worksheet.
          </FormHelperText>
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
