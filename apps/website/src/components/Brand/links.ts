// The project's outside addresses, in one place: the repository, the agent skill and the social profiles. Used by
// the landing pages, the docs footnote, the navbar and the site footer (docusaurus.config.ts imports this file, so
// keep it free of React and browser APIs).

/** The GitHub account that owns the repository. */
export const GITHUB_OWNER = "kasual1";

/** The repository as `owner/name`. */
export const REPO_SLUG = `${GITHUB_OWNER}/upmade`;

export const REPO_URL = `https://github.com/${REPO_SLUG}`;

export const SPONSORS_URL = `https://github.com/sponsors/${GITHUB_OWNER}`;

/** The maintainer's GitHub profile (the docs footnote's copyright line). */
export const AUTHOR_URL = `https://github.com/${GITHUB_OWNER}`;

/** The repository the agent skill is installed from (`npx skills add <SKILL_REPO>`). */
export const SKILL_REPO = REPO_SLUG;

export const SKILL_INSTALL_COMMAND = `npx skills add ${SKILL_REPO}`;

export const NPM_URL = "https://www.npmjs.com/package/@upmade/core";

export const X_URL = "https://x.com/upmade_io";
export const LINKEDIN_URL = "https://www.linkedin.com/in/upmade-io-26721b40b";
export const MASTODON_URL = "https://mastodon.social/@upmade";
export const BLUESKY_URL = "https://bsky.app/profile/upmade.bsky.social";

export interface SocialLink {
  label: string;
  href: string;
  /** the link's `rel`; Mastodon adds `me` to verify the profile link */
  rel: string;
}

/** The site footer's Community column, in its order. */
export const SOCIAL_LINKS: ReadonlyArray<SocialLink> = [
  { label: "X", href: X_URL, rel: "noopener noreferrer" },
  { label: "LinkedIn", href: LINKEDIN_URL, rel: "noopener noreferrer" },
  { label: "Mastodon", href: MASTODON_URL, rel: "me noopener noreferrer" },
  { label: "Bluesky", href: BLUESKY_URL, rel: "noopener noreferrer" },
  { label: "GitHub", href: REPO_URL, rel: "noopener noreferrer" },
  { label: "NPM", href: NPM_URL, rel: "noopener noreferrer" },
];
