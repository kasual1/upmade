import React, { type ReactNode } from 'react';
import UpmadeBrand from '@site/src/components/UpmadeBrand';
import BrandLogo from '@site/src/components/Brand/BrandLogo';
import { useLandingPage } from '@site/src/components/LandingPage/context';
import styles from './styles.module.css';

/**
 * The docs navbar shows the same logo + name as the landing, agentic and blog headers (instead of Docusaurus'
 * <img> logo and title). `navbar__brand` keeps Infima's navbar layout and the rules in css/navbar.css.
 *
 * Pages built with the LandingPage kit (the new landing page) show their own logo instead, the pink agent with
 * "upmade.io", the same as in their hero header and footer. This covers the floating navbar that appears after
 * scrolling past the hero and the mobile menu's header. Every other page keeps UpmadeBrand.
 */
export default function NavbarLogo(): ReactNode {
  const landing = useLandingPage();
  if (landing) return <BrandLogo size={38} className={`navbar__brand ${styles.landingBrand}`} />;
  return <UpmadeBrand className="navbar__brand" />;
}
