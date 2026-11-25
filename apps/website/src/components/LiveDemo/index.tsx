import { type ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { ExternalLink } from 'lucide-react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useLocation } from '@docusaurus/router';
import styles from './styles.module.css';


interface CodeFile {
  filename: string;
  code: string;
  language?: string;
}

type DemoFramework = 'angular' | 'react' | 'vue';

interface LiveDemoProps {
  children?: ReactNode;
  /**
   * GitHub repository URL pointing to the directory containing the example files.
   * Must follow the format: `https://github.com/{owner}/{repo}/tree/{branch}/{path}`
   *
   * Used to derive:
   * - Raw content URL for fetching `repoFiles`
   * - StackBlitz URL (if `stackBlitzUrl` is not explicitly provided)
   */
  repoUrl?: string;
  /** Override the auto-derived StackBlitz URL. */
  stackBlitzUrl?: string;
  height?: string;
  /** URL of the hosted example to embed in an iframe as the preview. */
  iframeUrl?: string;
  /** Route segment for the demo (e.g. `/examples/agile-retro`) resolved against `customFields.demoBaseUrls`. */
  demoPath?: string;
  /** Optional framework override. Defaults to the docs route framework (`/docs/{framework}/...`). */
  demoFramework?: DemoFramework;
  /**
   * Paths relative to `repoUrl` in the GitHub repo.
   * Files are fetched at runtime and shown in the Code tab.
   * Example: `['src/app/examples/editor.component.ts']`
   */
  repoFiles?: string[];
  code?: string; // legacy, for single file
  codeTitle?: string;
  codeLang?: string;
  codeFiles?: CodeFile[];
}

/**
 * Parses a GitHub tree URL into its components.
 * Expected format: https://github.com/{owner}/{repo}/tree/{branch}/{path}
 */
function parseGitHubUrl(url: string) {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/
  );
  if (!match) return null;
  const [, owner, repo, branch, path] = match;
  return { owner, repo, branch, path };
}

function buildRawBaseUrl(repoUrl: string): string | null {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return null;
  const { owner, repo, branch, path } = parsed;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}/`;
}

function getBranchVariants(branch: string): string[] {
  if (branch === 'main') {
    return ['main', 'master'];
  }
  if (branch === 'master') {
    return ['master', 'main'];
  }
  return [branch];
}

function buildRawBaseCandidates(repoUrl: string): string[] {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return [];
  }

  const { owner, repo, branch, path } = parsed;
  const branches = getBranchVariants(branch);
  const bases: string[] = [];

  for (const currentBranch of branches) {
    bases.push(`https://raw.githubusercontent.com/${owner}/${repo}/${currentBranch}/${path}/`);
  }

  return Array.from(new Set(bases));
}

function kebabToPascal(input: string): string {
  return input
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function buildRepoFileCandidates(file: string, framework: DemoFramework): string[] {
  const normalized = file.replace(/^\/+/, '');
  const candidates = [normalized];

  if (framework === 'angular') {
    return candidates;
  }

  const lastSlashIndex = normalized.lastIndexOf('/');
  const directory = lastSlashIndex === -1 ? '' : normalized.slice(0, lastSlashIndex);
  const filename = lastSlashIndex === -1 ? normalized : normalized.slice(lastSlashIndex + 1);
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0) {
    return candidates;
  }

  const basename = filename.slice(0, dotIndex);
  const extension = filename.slice(dotIndex + 1);
  const supportsPagePattern = (framework === 'react' && extension === 'tsx') || (framework === 'vue' && extension === 'vue');
  const isKebabCase = basename.includes('-') && basename === basename.toLowerCase();

  if (supportsPagePattern && isKebabCase) {
    const pageFilename = `${kebabToPascal(basename)}Page.${extension}`;
    const pagePath = directory ? `${directory}/${pageFilename}` : pageFilename;
    candidates.push(pagePath);
  }

  return candidates;
}

function buildStackBlitzUrl(repoUrl: string, file?: string): string {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) return repoUrl;
  const { owner, repo, branch, path } = parsed;
  const base = `https://stackblitz.com/github/${owner}/${repo}/tree/${branch}/${path}`;
  return file ? `${base}?file=${encodeURIComponent(file)}` : base;
}

function langFromFilename(filename: string): string {
  const ext = filename.split('.').pop() ?? '';
  const map: Record<string, string> = {
    ts: 'ts', tsx: 'tsx', html: 'html', css: 'css',
    scss: 'scss', json: 'json', js: 'js', jsx: 'jsx',
  };
  return map[ext] ?? 'text';
}

function getDemoBaseUrls(customFields: unknown): Partial<Record<DemoFramework, string>> {
  const fallback: Partial<Record<DemoFramework, string>> = {};
  if (!customFields || typeof customFields !== 'object') {
    return fallback;
  }

  const urls = (customFields as Record<string, unknown>).demoBaseUrls;
  if (!urls || typeof urls !== 'object') {
    return fallback;
  }

  const parsed = urls as Record<string, unknown>;
  const frameworks: DemoFramework[] = ['angular', 'react', 'vue'];
  for (const framework of frameworks) {
    const value = parsed[framework];
    if (typeof value === 'string' && value.trim().length > 0) {
      fallback[framework] = value.trim();
    }
  }

  return fallback;
}

function buildDemoUrl(demoBaseUrl: string, demoPath: string): string {
  if (/^https?:\/\//.test(demoPath)) {
    return demoPath;
  }

  const base = demoBaseUrl.replace(/\/+$/, '');
  const cleanedPath = demoPath.startsWith('#') ? demoPath.slice(1) : demoPath;
  const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`;
  return `${base}/#${normalizedPath}`;
}

function getFrameworkFromPathname(pathname: string): DemoFramework | null {
  const match = pathname.match(/\/docs\/(angular|react|vue)(\/|$)/);
  if (!match) {
    return null;
  }
  return match[1] as DemoFramework;
}


export default function LiveDemo({
  children,
  repoUrl,
  stackBlitzUrl,
  height = '560px',
  iframeUrl,
  demoPath,
  demoFramework,
  repoFiles,
  code,
  codeTitle,
  codeLang = 'ts',
  codeFiles,
}: LiveDemoProps) {
  const { siteConfig } = useDocusaurusContext();
  const { pathname } = useLocation();
  const hasCode = Boolean(children || repoFiles?.length || codeFiles?.length || code);
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [activeTab, setActiveTab] = useState(0);
  const [fetchedFiles, setFetchedFiles] = useState<CodeFile[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const demoBaseUrls = getDemoBaseUrls(siteConfig.customFields);
  const resolvedDemoFramework = demoFramework ?? getFrameworkFromPathname(pathname) ?? 'angular';
  const rawBase = repoUrl ? buildRawBaseUrl(repoUrl) : null;
  const rawBaseCandidates = repoUrl ? buildRawBaseCandidates(repoUrl) : [];
  const demoBaseUrl = demoBaseUrls[resolvedDemoFramework];
  const resolvedIframeUrl = iframeUrl ?? (demoPath && demoBaseUrl ? buildDemoUrl(demoBaseUrl, demoPath) : undefined);
  const resolvedStackBlitzUrl = stackBlitzUrl
    ?? (repoUrl ? buildStackBlitzUrl(repoUrl, repoFiles?.[0]) : undefined);

  useEffect(() => {
    if (view !== 'code' || !repoFiles?.length || !rawBase || hasFetched.current) {
      return;
    }
    hasFetched.current = true;
    setIsFetching(true);
    setFetchError(null);

    const fetchCodeFile = async (file: string): Promise<CodeFile> => {
      const fileCandidates = buildRepoFileCandidates(file, resolvedDemoFramework);

      for (const base of rawBaseCandidates) {
        for (const candidate of fileCandidates) {
          const res = await fetch(base + candidate);
          if (!res.ok) {
            continue;
          }
          return {
            filename: candidate.split('/').pop() ?? candidate,
            code: await res.text(),
            language: langFromFilename(candidate),
          };
        }
      }

      throw new Error(`404 – ${file}`);
    };

    Promise.all(
      repoFiles.map((file) => fetchCodeFile(file))
    )
      .then((files) => { setFetchedFiles(files); setActiveTab(0); })
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setIsFetching(false));
  }, [view, rawBase, rawBaseCandidates, repoFiles, resolvedDemoFramework]);

  // typography.css sets the font family sitewide with !important, so the buttons set theirs the same way
  const viewToggleRef = useCallback((node: HTMLButtonElement | null) => {
    node?.style.setProperty('font-family', 'var(--lp-font-body, var(--ifm-font-family-base))', 'important');
  }, []);
  const codeTabRef = useCallback((node: HTMLButtonElement | null) => {
    node?.style.setProperty('font-family', 'var(--lp-font-mono, var(--ifm-font-family-monospace))', 'important');
  }, []);

  const fileTabs = (files: readonly { filename: string }[]) => (
    <div role="tablist" aria-label="Files" className={styles.files}>
      {files.map((file, idx) => (
        <button
          key={file.filename}
          ref={codeTabRef}
          role="tab"
          aria-selected={activeTab === idx}
          onClick={() => setActiveTab(idx)}
          className={styles.file}
        >
          {file.filename}
        </button>
      ))}
    </div>
  );

  return (
    // data-live-demo: the docs' content rules (src/css/docs.css) leave the demo to its own styles
    <div data-live-demo="" className={styles.demo}>
      <div className={styles.bar}>
        <div role="tablist" aria-label="Live demo view" className={styles.toggle}>
          <button
            ref={viewToggleRef}
            role="tab"
            aria-selected={view === 'preview'}
            onClick={() => setView('preview')}
            className={styles.tab}
          >
            Preview
          </button>
          {hasCode && (
            <button
              ref={viewToggleRef}
              role="tab"
              aria-selected={view === 'code'}
              onClick={() => setView('code')}
              className={styles.tab}
            >
              Code
            </button>
          )}
        </div>
        {resolvedStackBlitzUrl && (
          <a
            href={resolvedStackBlitzUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.open}
            aria-label="Open in StackBlitz"
            title="Open in StackBlitz"
          >
            <ExternalLink size={15} strokeWidth={2.25} aria-hidden="true" />
          </a>
        )}
      </div>
      {view === 'preview' && (
        <div className={styles.preview} style={{ height }}>
          {resolvedIframeUrl && <iframe src={resolvedIframeUrl} title="Live demo preview" />}
        </div>
      )}
      {view === 'code' && (
        <div className={styles.code}>
          {repoFiles?.length ? (
            isFetching ? (
              <div className={styles.status}>Loading files…</div>
            ) : fetchError ? (
              <div className={styles.error}>Failed to load: {fetchError}</div>
            ) : (
              <>
                {fetchedFiles.length > 1 && fileTabs(fetchedFiles)}
                {fetchedFiles[activeTab] && (
                  <CodeBlock language={fetchedFiles[activeTab].language ?? codeLang}>
                    {fetchedFiles[activeTab].code}
                  </CodeBlock>
                )}
              </>
            )
          ) : children ? (
            children
          ) : codeFiles && codeFiles.length > 0 ? (
            <>
              {fileTabs(codeFiles)}
              <CodeBlock language={codeFiles[activeTab].language || codeLang}>
                {codeFiles[activeTab].code}
              </CodeBlock>
            </>
          ) : code ? (
            <CodeBlock language={codeLang} title={codeTitle}>
              {code}
            </CodeBlock>
          ) : null}
        </div>
      )}
    </div>
  );
}
