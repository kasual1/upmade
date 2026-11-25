import React, { type ReactNode } from 'react';
import BrandLogo from '@site/src/components/Brand/BrandLogo';
import styles from './styles.module.css';

/**
 * The navbar's logo: the new logo of the landing pages (the pink agent with "upmade.io", BrandLogo) on every page that
 * has the Docusaurus navbar: the floating one on the landing pages, the docs, and the mobile menu's header. (The blog
 * has its own header, BlogHeader, with the same logo.) `navbar__brand` keeps Infima's navbar layout and the rules in
 * css/navbar.css.
 */
export default function NavbarLogo(): ReactNode {
  return <BrandLogo size={38} className={`navbar__brand ${styles.landingBrand}`} />;
}
