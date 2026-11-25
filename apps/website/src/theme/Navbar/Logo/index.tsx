import React, { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import BrandLogo from '@site/src/components/Brand/BrandLogo';
import styles from './styles.module.css';

/**
 * The navbar's logo: the new logo of the landing pages (the pink agent with "upmade.io", BrandLogo) on every page that
 * has the Docusaurus navbar: the floating one on the landing pages, the docs, and the mobile menu's header. (The blog
 * has its own header, BlogHeader, with the same logo.) `navbar__brand` keeps Infima's navbar layout and the rules in
 * css/navbar.css.
 *
 * On the landing pages the navbar floats in once the hero has scrolled away (useHeroNavObserver), and its agent then
 * pops out of a puff of cloud (CloudPop), each time it floats in.
 */
export default function NavbarLogo(): ReactNode {
  const { pathname } = useLocation();
  const landing = /^\/(agentic\/?)?$/.test(pathname);
  const floatedIn = useFloatingNavShown(landing);
  return (
    <BrandLogo
      size={38}
      className={`navbar__brand ${styles.landingBrand}`}
      popIn={landing ? floatedIn : undefined}
    />
  );
}

/**
 * Whether the landing pages' floating navbar is sliding in: `html.landing-nav-visible` with its transition on
 * (`data-landing-nav-animated`), both set by useHeroNavObserver. False off the landing pages.
 */
function useFloatingNavShown(landing: boolean): boolean {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!landing) return;
    const root = document.documentElement;
    const read = () =>
      setShown(root.classList.contains('landing-nav-visible') && root.hasAttribute('data-landing-nav-animated'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-landing-nav-animated'] });
    return () => observer.disconnect();
  }, [landing]);
  return shown;
}
