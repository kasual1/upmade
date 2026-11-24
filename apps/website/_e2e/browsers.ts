// Finds a Chromium build to run the suite with.
//
// Playwright expects the browser build that matches its own version (for example chromium-1255 for 1.65).
// Some machines (CI images, sandboxes) ship a browser cache whose build is older than the installed
// Playwright and forbid `playwright install`. When the matching build is missing, these helpers fall back
// to the newest build of the same kind under PLAYWRIGHT_BROWSERS_PATH (or ~/.cache/ms-playwright), so the
// suite still runs. When the matching build exists they return undefined and Playwright's default is used.
//
// WEBSITE_E2E_CHROMIUM / WEBSITE_E2E_HEADLESS_SHELL override the lookup with an explicit path.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from '@playwright/test';

type Kind = 'chromium' | 'headless-shell';

const LAYOUT: Record<Kind, { prefix: string; binary: string[] }> = {
  // Full Chromium ("new headless"). It reads the profile's Preferences, see minFont.ts.
  chromium: { prefix: 'chromium-', binary: ['chrome-linux64/chrome', 'chrome-linux/chrome'] },
  // chrome-headless-shell, what Playwright launches by default for headless Chromium.
  'headless-shell': {
    prefix: 'chromium_headless_shell-',
    binary: ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/headless_shell'],
  },
};

function browsersRoot(): string {
  const configured = process.env.PLAYWRIGHT_BROWSERS_PATH;
  return configured && configured !== '0' ? configured : path.join(os.homedir(), '.cache', 'ms-playwright');
}

function expectedPath(kind: Kind): string {
  const full = chromium.executablePath();
  if (kind === 'chromium') return full;
  const root = browsersRoot();
  const build = /chromium-(\d+)/.exec(full)?.[1];
  return build ? path.join(root, `${LAYOUT[kind].prefix}${build}`, LAYOUT[kind].binary[0]) : '';
}

function newestInstalled(kind: Kind): string | undefined {
  const root = browsersRoot();
  const { prefix, binary } = LAYOUT[kind];
  let entries: string[];
  try {
    entries = fs.readdirSync(root);
  } catch {
    return undefined;
  }
  const builds = entries
    .filter((name) => name.startsWith(prefix) && /^\d+$/.test(name.slice(prefix.length)))
    .sort((a, b) => Number(b.slice(prefix.length)) - Number(a.slice(prefix.length)));
  for (const dir of builds) {
    for (const rel of binary) {
      const candidate = path.join(root, dir, rel);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return undefined;
}

/** An executablePath for `kind`, or undefined when Playwright's own build is installed. */
export function chromiumExecutable(kind: Kind): string | undefined {
  const override = kind === 'chromium' ? process.env.WEBSITE_E2E_CHROMIUM : process.env.WEBSITE_E2E_HEADLESS_SHELL;
  if (override) return override;
  const expected = expectedPath(kind);
  if (fs.existsSync(expected)) return undefined;
  const fallback = newestInstalled(kind);
  // Warn once per run: the config is loaded by the runner and again by every worker, and workers inherit
  // the runner's environment, so the marker set here silences the repeats.
  const marker = `WEBSITE_E2E_WARNED_${kind === 'chromium' ? 'CHROMIUM' : 'HEADLESS_SHELL'}`;
  if (fallback && !process.env[marker]) {
    process.env[marker] = '1';
    console.warn(
      `[website e2e] Playwright's ${kind} build (${expected || 'unknown'}) is not installed; ` +
        `falling back to ${fallback}. Screenshots may differ from a run with the matching build.`,
    );
  }
  return fallback;
}
