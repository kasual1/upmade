import type { ReactNode } from "react";
import BrandLogo from "../../../Brand/BrandLogo";
import styles from "./styles.module.css";

export interface LandingFooterProps {
  /** the line under the logo */
  tagline?: string;
}

/**
 * STUB (M3; M8 owns it): the landing pages' footer from the design (.foot): the logo with the pink agent, a tagline,
 * the link columns and the meta line. Not rendered anywhere yet. M8 implements it (columns from
 * themeConfig.footer.links) and has the swizzled theme/Footer render it on pages whose LandingPageContext says
 * `footer: "landing"` (useLandingPage()).
 */
export default function LandingFooter({ tagline = "Build infinite canvas experiences in minutes." }: LandingFooterProps): ReactNode {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <BrandLogo size={52} />
          <p className={styles.tagline}>{tagline}</p>
        </div>
      </div>
      <div className={styles.meta}>
        <span>Copyright © {new Date().getFullYear()} Upmade</span>
        <span>Open source under the MIT License</span>
      </div>
    </footer>
  );
}
