import React, { useState, useEffect, type ReactNode } from 'react';
import Links from '@theme-original/Footer/Links';
import type LinksType from '@theme/Footer/Links';
import type {WrapperProps} from '@docusaurus/types';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { UPMADE_LOGO_MARKUP, UPMADE_LOGO_VIEWBOX } from '@site/src/components/Brand/logoAgent';
import {
  getPreferredFramework,
  subscribeToPreferredFramework,
  type Framework,
} from "@site/src/utils/frameworkPreference";
import { toDocusaurusFooterItem } from "@site/src/components/LandingPage/chrome/LandingFooter/links";

type Props = WrapperProps<typeof LinksType>;

function replaceFrameworkInPath(path: string, framework: Framework): string {
  return path.replace(/\/docs\/(angular|react|vue)\//, `/docs/${framework}/`);
}

export default function LinksWrapper(props: Props): ReactNode {
  const [framework, setFramework] = useState<Framework>(getPreferredFramework);
  const homeUrl = useBaseUrl('/');
  // The logo (the pink agent) is drawn inline from generated markup (Brand/logoAgent.ts, `npm run icons:generate`),
  // so the footer can't show an older logo than the rest of the site: a separate /img/logo.svg request could be
  // served stale.
  const logoSvg =
    `<svg class="upmade-footer-brand__logo" viewBox="${UPMADE_LOGO_VIEWBOX}" aria-hidden="true">${UPMADE_LOGO_MARKUP}</svg>`;

  useEffect(() => {
    return subscribeToPreferredFramework(setFramework);
  }, []);

  const brandSection = {
    title: '',
    items: [
      {
        html: `<div class="upmade-footer-brand"><a href="${homeUrl}" class="upmade-footer-brand__logo-badge" aria-label="Go to Upmade home page">${logoSvg}</a><p class="upmade-footer-brand__description">Build infinite canvas experiences in minutes.</p></div>`,
      },
    ],
  };

  const patchedProps = {
    ...props,
    links: [
      brandSection,
      ...props.links.map((section: any) => {
        // The Community column's external {label, href, rel?} items open in a new tab with their own rel, as the raw
        // HTML the config used to hold. Other columns keep Docusaurus' own rendering (external-link icon, default rel).
        if (section.title === 'Community' && Array.isArray(section.items)) {
          return { ...section, items: section.items.map(toDocusaurusFooterItem) };
        }
        if (section.title !== 'Documentation') return section;
        return {
          ...section,
          items: section.items.map((item: any) => {
            if (!item.to || !item.to.match(/\/docs\/(angular|react|vue)\//)) return item;
            return { ...item, to: replaceFrameworkInPath(item.to, framework) };
          }),
        };
      }),
    ],
  };

  return (
    <>
      <Links {...patchedProps} />
    </>
  );
}
