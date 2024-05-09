import { Link as MuiLink } from "@mui/material";
import { ReactNode } from "react";

interface IProp {
  href: string;
  children: ReactNode;
}

export default function Link(props: IProp) {
  return (
    <MuiLink
      href={props.href}
      color="primary"
      target="_blank"
      rel="noopener noreferrer"
      children={props.children}
    />
  );
}
