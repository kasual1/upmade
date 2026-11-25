import React, { type ReactNode } from 'react';
import type { Props } from '@theme/BlogPostItem/Container';

/**
 * A post's <article>. Docusaurus gives the posts of the blog list `margin-bottom--xl`, an Infima utility that is
 * `!important` inside a cascade layer, so no stylesheet can take it back; the blog list lays its posts out as a grid
 * with its own gaps (src/css/blog.css), so the class is left out here.
 */
export default function BlogPostItemContainer({ children, className }: Props): ReactNode {
  const kept = className?.split(/\s+/).filter((c) => c && c !== 'margin-bottom--xl').join(' ');
  return <article className={kept || undefined}>{children}</article>;
}
