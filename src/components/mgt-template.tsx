import { MgtTemplateProps } from "@microsoft/mgt-react";

interface IProps extends MgtTemplateProps {
  children: React.ReactNode;
}

function MgtTemplate(props: IProps) {
  return <template>{props.children}</template>;
}

export default MgtTemplate;
