import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createTablebyWorksheetId } from "../../services/workbooks/tables";
import { LoadingButton } from "@mui/lab";
import { errorMessage } from "../../utils/error";

export interface IProps {
  open: boolean;
  onClose: (created: boolean, name?: string) => void;
  driveid: string;
  itemid: string;
  worksheetid: string;
}

function rangeAddressPartMaches(value: string) {
  const res = /^[A-Z]+[1-9]+[0-9]*$/.test(value);
  console.log(value, res);
  return res;
}

export default function CreateTableDialog(props: IProps) {
  const { onClose, open, ...other } = props;

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [rangeStart, setRangeStart] = useState("A1");
  const [rangeEnd, setRangeEnd] = useState("F1");
  const [hasHeaders, sethasHeaders] = useState(true);

  const rangeStartColor = useMemo(() => {
    return rangeAddressPartMaches(rangeStart) ? undefined : "error";
  }, [rangeStart]);

  const rangeEndColor = useMemo(() => {
    return rangeAddressPartMaches(rangeEnd) ? undefined : "error";
  }, [rangeEnd]);

  useEffect(() => {
    if (open) {
      // reset the states
      setError(null);
      setCreating(false);
      sethasHeaders(false);
      setRangeStart("A1");
      setRangeEnd("D6");
    }
  }, [open]);

  const closeDlg = (created: boolean = false, name?: string) => {
    onClose(created, name);
  };

  const handleCancel = () => {
    closeDlg();
  };

  const handleOk = () => {
    setCreating(true);
    setError(null);

    if (
      !rangeAddressPartMaches(rangeStart) ||
      !rangeAddressPartMaches(rangeEnd)
    ) {
      setCreating(false);
      setError(new Error("Invalid Range address"));
      return;
    }

    createTablebyWorksheetId(props.driveid, props.itemid, props.worksheetid, {
      address: rangeStart + ":" + rangeEnd,
      hasHeaders,
    })
      .then((table) => {
        setCreating(false);
        if (table && table.id) {
          closeDlg(true, table.id);
        } else {
          closeDlg(true);
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
      <DialogTitle>Create Table</DialogTitle>
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
            id="workbook-table-create-start-input"
            label="Range address start"
            variant="outlined"
            value={rangeStart}
            color={rangeStartColor}
            onChange={(event) => {
              const value = event.target.value;
              setRangeStart(value);
              rangeAddressPartMaches(value);
            }}
            InputProps={{
              inputMode: "text",
              readOnly: creating,
            }}
          />
        </FormControl>
        <FormControl fullWidth style={{ marginTop: 20 }}>
          <TextField
            id="workbook-table-create-end-input"
            label="Range address end"
            variant="outlined"
            value={rangeEnd}
            color={rangeEndColor}
            onChange={(event) => {
              const value = event.target.value;
              setRangeEnd(value);
              rangeAddressPartMaches(value);
            }}
            InputProps={{
              inputMode: "text",
              readOnly: creating,
            }}
          />
        </FormControl>
        <FormControl fullWidth style={{ marginTop: 20 }}>
          <FormControlLabel
            control={<Checkbox />}
            label="Indicates whether the range has column labels"
            checked={hasHeaders}
            onChange={(_event, checked) => {
              sethasHeaders(checked);
            }}
            disabled={creating}
            aria-describedby="workbook-table-create-hasheaders-helper-text"
          />
          <FormHelperText id="workbook-table-create-hasheaders-helper-text">
            If the source doesn't contain headers (when this property set to
            false), Excel will automatically generate header shifting the data
            down by one row.
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
