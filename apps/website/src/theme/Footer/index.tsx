import React from "react";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { Wordmark } from "@site/src/components/Landing/Sections";
import { useLandingPage } from "@site/src/components/LandingPage/context";
import LandingFooter from "@site/src/components/LandingPage/chrome/LandingFooter";
import Footer from "@theme-original/Footer";

export default function FooterWrapper(props: React.ComponentProps<typeof Footer>) {
  const { pathname } = useLocation();
  const landingPage = useLandingPage();
  const blogPath = useBaseUrl("/blog").replace(/\/+$/, "");
  const docsPath = useBaseUrl("/docs").replace(/\/+$/, "");
  const isBlogPage = pathname === blogPath || pathname.startsWith(`${blogPath}/`);
  const isDocsPage = pathname === docsPath || pathname.startsWith(`${docsPath}/`);

  // Config-driven landing pages (LandingPage) that ask for the design's footer get it instead of Docusaurus'.
  if (landingPage?.config.footer === "landing") {
    return <LandingFooter />;
  }

  // Docs pages render their own footnote inside the content column (see DocItem/Paginator).
  if (isDocsPage) {
    return null;
  }

  return (
    <>
      {isBlogPage && (
        <div className="blog-footer-wordmark">
          <Wordmark />
        </div>
      )}
      <Footer {...props} />
    </>
  );
}
