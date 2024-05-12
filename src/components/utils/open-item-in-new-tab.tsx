import { ConfirmOptions } from "material-ui-confirm";
import { getAccount } from "../../services/auth/utils";
import { getItemUrl } from "../../services/drive";
import { Box, Link, Typography } from "@mui/material";
import { ReactNode } from "react";

export const OpenIteminNewTabConfirmOptions: ConfirmOptions = {
  title: "",
  confirmationButtonProps: {
    style: {
      display: "none",
    },
  },
  cancellationText: "Close",
};

export function OpenIteminNewTabConfirmContent(
  itemId: string
): Promise<ReactNode | void> {
  let username = "";
  return getAccount()
    .then((account) => {
      username = account.username || "this account";
    })
    .catch(() => {
      username = "this account";
    })
    .then(() => {
      return getItemUrl(itemId);
    })
    .then((response) => {
      return response && typeof response.value === "string"
        ? response.value
        : // eslint-disable-next-line no-script-url
          "javascript:void(0);";
    })
    .then((url: string) => {
      return (
        <Box style={{ margin: "10px 0px" }}>
          <Typography>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              Click here
            </Link>{" "}
            to open the item in a new tab. You need to be logged in as{" "}
            <Box component="strong" display="inline" children={username}></Box>{" "}
            to access this item.
          </Typography>
        </Box>
      );
    })
    .catch((error) => {
      if (error === undefined) {
        // user closed
        return;
      }
      throw error;
    });
}
