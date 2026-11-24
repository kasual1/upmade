import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { usePreferredFramework } from "@site/src/utils/frameworkPreference";
import { useAppUrl } from "@site/src/utils/siteUrls";
import { resolveLink, type ResolvedLink } from "../links";
import type { LinkRef } from "../types";

/**
 * Resolves a config link for rendering (see links.ts `resolveLink`). Docs links use the React docs on the server
 * and the first client render, then the visitor's preferred framework after mount (as usePreferredDocsPath does).
 */
export function useResolveLink(link: LinkRef): ResolvedLink {
  const framework = usePreferredFramework();
  const appUrl = useAppUrl();
  const { withBaseUrl } = useBaseUrlUtils();
  return resolveLink(link, { framework, appUrl, withBaseUrl });
}
