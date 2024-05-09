import { Typography } from "@mui/material";
import Link from "./link";

interface IProp {
  xname: string;
  xurl: string;
}

export default function TrademarkDisclaimer(props: IProp) {
  const X = () => <Link href={props.xurl} children={props.xname} />;

  return (
    <Typography variant="body1">
      <X /> is an independent website and is not affiliated with, sponsored by,
      or endorsed by any of the trademarks mentioned on this site. All
      trademarks and logos are the property of their respective owners.
    </Typography>
  );
}
