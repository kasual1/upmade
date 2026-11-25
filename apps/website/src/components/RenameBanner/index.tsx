import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import { ArrowIcon } from "@site/src/components/Brand/Icon";
import styles from "./styles.module.css";

/** The post announcing the rename (blog/2026-11-17-kritzel-is-now-upmade.md). */
const BLOG_POST_PATH = "/blog/2026/11/17/kritzel-is-now-upmade/";

/**
 * Black notification bar announcing the rename (the names only, no logos). Rendered on every page as Docusaurus'
 * announcement bar (src/theme/AnnouncementBar, themeConfig.announcementBar).
 */
export default function RenameBanner(): ReactNode {
  return (
    <div className={styles.banner} role="status">
      <strong>Kritzel</strong> is now{" "}
      {/* as in the logo (Brand/BrandLogo): a bold "upmade", a thinner ".io" */}
      <strong className={styles.upmade}>
        upmade<span className={styles.io}>.io</span>
      </strong>
      <Link className={styles.link} to={BLOG_POST_PATH} aria-label="Read more about the rename in the blog post">
        Read more<ArrowIcon />
      </Link>
    </div>
  );
}
