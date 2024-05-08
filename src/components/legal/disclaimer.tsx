import { Typography, Link } from "@mui/material";

interface IProp {
  xname: string;
  yname: string;
  xurl: string;
  yurl: string;
}

export default function Disclaimer(props: IProp) {
  const X = () => (
    <Link href={props.xurl} color="primary" children={props.xname} />
  );
  const Y = () => (
    <Link href={props.yurl} color="primary" children={props.yname} />
  );

  return (
    <Typography variant="body1">
      Disclaimer: The entity referred to as <X /> in this context is completely
      independent and not in any way associated, affiliated, or endorsed by the
      entity known as <Y />. There are no official partnerships, sponsorships,
      collaborations, or endorsements between <X /> and <Y />. Any similarities
      or connections perceived between <X /> and <Y /> are purely coincidental.{" "}
      <X /> operates autonomously and does not represent the views, opinions, or
      actions of <Y />.
    </Typography>
  );
}
