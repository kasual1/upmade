/**
 * Where a config `LinkRef` points (types.ts). This file is the PURE resolver, free of React and Docusaurus so the
 * unit tests can call it; components use the hook `useResolveLink` (hooks/useResolveLink.ts), which feeds it the
 * visitor's preferred framework, the app URL and the site's baseUrl.
 */
import { docsPath, frameworkPaths, type Framework } from "../../utils/frameworkPreference";
import type { LinkRef } from "./types";

export type { LinkRef } from "./types";

export interface LinkContext {
  /** the docs framework to link to (the visitor's preferred one; React on the server) */
  framework: Framework;
  /** the hosted app's origin (customFields.appUrl) */
  appUrl: string;
  /** prefixes a site path with the baseUrl (Docusaurus' withBaseUrl); identity when left out */
  withBaseUrl?: (path: string) => string;
}

export interface ResolvedLink {
  href: string;
  /** an absolute URL to another site (the app, GitHub...), as opposed to a page of this site */
  external: boolean;
}

const trimSlashes = (path: string) => path.replace(/^\/+|\/+$/g, "");

/**
 * - `docs` → `/docs/<framework>/<path>`, or the framework's quick start without a path
 * - `app` → the app URL, plus `path`
 * - `route` → the site path, prefixed with the baseUrl
 * - `external` → `href` as it is
 */
export function resolveLink(link: LinkRef, { framework, appUrl, withBaseUrl = (p) => p }: LinkContext): ResolvedLink {
  switch (link.kind) {
    case "docs": {
      const path = link.path ? docsPath(framework, trimSlashes(link.path)) : frameworkPaths[framework];
      return { href: withBaseUrl(path), external: false };
    }
    case "app": {
      const base = appUrl.replace(/\/+$/, "");
      const path = link.path ? `/${trimSlashes(link.path)}` : "";
      return { href: `${base}${path}`, external: true };
    }
    case "route":
      return { href: withBaseUrl(link.to.startsWith("/") ? link.to : `/${link.to}`), external: false };
    case "external":
      return { href: link.href, external: true };
  }
}
