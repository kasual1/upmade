import React, { type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarContent from '@theme/Navbar/Content';
import BlogHeader from '@site/src/components/BlogChrome/BlogHeader';

/** Blog pages get the landing pages' header (BlogHeader) instead of the Docusaurus navbar. */
export default function Navbar(): ReactNode {
  const { pathname } = useLocation();
  const blogPath = useBaseUrl('/blog');
  const isBlogPage = pathname === blogPath || pathname.startsWith(`${blogPath}/`);
  if (isBlogPage) {
    return (
      <>
        {/* Docusaurus measures `.navbar` (the table of contents' scroll offset), and crashes without one. Nothing
            sticks to the top on the blog, so an empty, hidden one gives the right offset: 0. */}
        <div className="navbar" style={{ display: 'none' }} aria-hidden="true" />
        <BlogHeader />
      </>
    );
  }

  return (
    <NavbarLayout>
      <NavbarContent />
    </NavbarLayout>
  );
}
