import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useRef } from "react";
import ErrorPage from "../../pages/error-page";

export interface IProps {
  open: boolean;
  onClose: () => void;
  error: Error | any;
}

export default function CreateWorksheetDialog(props: IProps) {
  const { onClose, open, ...other } = props;
  const radioGroupRef = useRef<HTMLElement>(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleOk = () => {
    onClose();
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>Error</DialogTitle>
      <DialogContent dividers>
        <ErrorPage error={props.error} />
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleOk}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}
