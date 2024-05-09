import { Link as MuiLink } from "@mui/material";

interface IProp {
  href: string;
  children: JSX.Element | string;
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
