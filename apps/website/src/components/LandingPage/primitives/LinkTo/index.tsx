import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "@docusaurus/Link";
import { useResolveLink } from "../../hooks/useResolveLink";
import type { LinkRef } from "../../types";

export interface LinkToProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** the config link (types.ts LinkRef), resolved with useResolveLink */
  link: LinkRef;
  /** open in a new tab (with rel="noopener noreferrer"); links to other sites already do by default */
  newTab?: boolean;
  children?: ReactNode;
}

/** A Docusaurus <Link> to a config `LinkRef`: internal pages route client-side, other sites open in a new tab. */
export default function LinkTo({ link, newTab, children, ...rest }: LinkToProps): ReactNode {
  const { href } = useResolveLink(link);
  const tab = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link href={href} {...tab} {...rest}>
      {children}
    </Link>
  );
}
