import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import { HtmlClassNameProvider, PageMetadata, ThemeClassNames } from '@docusaurus/theme-common';
import { useDateTimeFormat } from '@docusaurus/theme-common/internal';
import Layout from '@theme/Layout';
import type { Props } from '@theme/BlogArchivePage';
import styles from './styles.module.css';

type Post = Props['archive']['blogPosts'][number];

/** The posts by year, newest year and newest post first. */
function byYear(posts: readonly Post[]): Array<{ year: string; posts: Post[] }> {
  const years = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.metadata.date.split('-')[0];
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return Array.from(years, ([year, list]) => ({
    year,
    posts: list.sort((a, b) => b.metadata.date.localeCompare(a.metadata.date)),
  })).sort((a, b) => b.year.localeCompare(a.year));
}

/**
 * The blog archive (Docusaurus' BlogArchivePage) in the landing pages' style: the blog's intro, then every post by
 * year as a list of rows (date and title), instead of Infima's hero and bulleted columns.
 */
export default function BlogArchive({ archive }: Props): ReactNode {
  const title = translate({ id: 'theme.blog.archive.title', message: 'Archive', description: 'The page & hero title of the blog archive page' });
  const description = 'Every post on the Upmade blog, newest first.';
  const format = useDateTimeFormat({ day: 'numeric', month: 'long', timeZone: 'UTC' });
  return (
    <HtmlClassNameProvider className={ThemeClassNames.wrapper.blogPages}>
      <PageMetadata title={title} description={description} />
      <Layout>
        <main className={styles.page}>
          <header className={styles.intro}>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {byYear(archive.blogPosts).map(({ year, posts }) => (
            <section key={year} className={styles.year} aria-labelledby={`archive-${year}`}>
              <h2 id={`archive-${year}`}>{year}</h2>
              <ul>
                {posts.map((post) => (
                  <li key={post.metadata.permalink}>
                    <Link to={post.metadata.permalink} className={styles.row}>
                      <time dateTime={post.metadata.date}>{format.format(new Date(post.metadata.date))}</time>
                      <span className={styles.title}>{post.metadata.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      </Layout>
    </HtmlClassNameProvider>
  );
}
