import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse as parseEnv } from 'dotenv';

const INTERNAL_COMPONENTS = [
  'upmade-active-users',
  'upmade-avatar',
  'upmade-back-to-content',
  'upmade-brush-style',
  'upmade-button',
  'upmade-color',
  'upmade-color-palette',
  'upmade-context-menu',
  'upmade-current-user',
  'upmade-current-user-dialog',
  'upmade-awareness-cursors',
  'upmade-agentic-cursors',
  'upmade-object-titlebar-layer',
  'upmade-dialog',
  'upmade-dropdown',
  'upmade-cursor-trail',
  'upmade-export',
  'upmade-font',
  'upmade-font-family',
  'upmade-font-size',
  'upmade-icon',
  'upmade-input',
  'upmade-line-endings',
  'upmade-login-dialog',
  'upmade-master-detail',
  'upmade-menu',
  'upmade-menu-item',
  'upmade-more-menu',
  'upmade-notification-card',
  'upmade-numeric-input',
  'upmade-opacity-slider',
  'upmade-pill-tabs',
  'upmade-portal',
  'upmade-slide-toggle',
  'upmade-titlebar-menu',
  'upmade-tool-config',
  'upmade-toolbar',
  'upmade-tooltip',
  'upmade-utility-panel',
  'upmade-watermark',
  'upmade-workspace-manager',
  'upmade-zoom-panel',
  'upmade-engine',
];

const isDev = process.argv.includes('--dev') || process.argv.includes('--serve');

/**
 * TEMP: a variable from the env files at the repository root (later files win), and only from there, never from the
 * shell environment. Used by the dev-only Gemini chat (src/dev/); delete with it.
 */
function readRootEnv(name: string): string {
  let value = '';
  for (const file of ['.env', '.env.local']) {
    try {
      const parsed = parseEnv(readFileSync(resolve(__dirname, '../../..', file), 'utf8'));
      if (name in parsed) value = parsed[name];
    } catch {
      // No such file.
    }
  }
  return value;
}

export const config: Config = {
  namespace: 'upmade-editor',
  minifyJs: false,
  ...(isDev
    ? {
        // TEMP: the dev page's chat talks to Gemini straight from the browser (src/dev/). The key is inlined into the
        // dev bundle only (.stencil/www, gitignored); production builds have neither the script nor the key.
        globalScript: 'src/dev/dev-chat.ts',
        env: {
          GEMINI_API_KEY: readRootEnv('GEMINI_API_KEY'),
          GEMINI_MODEL: readRootEnv('GEMINI_MODEL'),
          GEMINI_FALLBACK_MODELS: readRootEnv('GEMINI_FALLBACK_MODELS'),
        },
        // Rebuild when `npm run dev -w libs/core` writes new output
        watchExternalDirs: [resolve(process.cwd(), '../../core/dist')],
      }
    : {
        rollupConfig: {
          inputOptions: {
            // The engine's components are compiled into this bundle from its Stencil collection
            // (see the `import "@upmade/engine"` in upmade-editor.tsx). They and the editor import
            // every class from @upmade/core, so keep it external: the editor, the compiled engine
            // components and @upmade/engine then share one copy of each class.
            // Keep yjs and its companions external (as the engine build does), otherwise the
            // editor ships its own copy next to the one @upmade/engine imports and Yjs warns
            // "Yjs was already imported", breaking its constructor checks.
            external: [
              /^@upmade\/core(\/.*)?$/,
              '@upmade/engine',
              '@upmade/engine/loader',
              '@upmade/engine/dist/components',
              /^(yjs|y-websocket|y-indexeddb|lib0)(\/.*)?$/,
            ],
          },
        },
      }),
  outputTargets: isDev
    ? [{ type: 'www', dir: '.stencil/www', serviceWorker: null }]
    : [
        { type: 'dist', esmLoaderPath: '../loader' },
        { type: 'docs-readme' },
        { type: 'docs-json', file: '.stencil/docs.json' },
        { type: 'dist-custom-elements', externalRuntime: false, customElementsExportBehavior: 'single-export-module' },
        angularOutputTarget({
          componentCorePackage: '@upmade/editor',
          directivesProxyFile: '../angular/projects/lib/src/lib/proxy.ts',
          directivesArrayFile: '../angular/projects/lib/src/lib/index.ts',
          outputType: 'standalone',
          customElementsDir: 'dist/components',
          excludeComponents: INTERNAL_COMPONENTS,
        }),
        reactOutputTarget({
          outDir: '../react/lib/components/stencil-generated/',
          stencilPackageName: '@upmade/editor',
          excludeComponents: INTERNAL_COMPONENTS,
        }),
        vueOutputTarget({
          componentCorePackage: '@upmade/editor',
          proxiesFile: '../vue/lib/components.ts',
          includeImportCustomElements: true,
          customElementsDir: 'dist/components',
          excludeComponents: INTERNAL_COMPONENTS,
        }),
      ],
  testing: {
    browserHeadless: 'shell',
    transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }] },
    // Specs run against @upmade/core's source, so they don't need a core build.
    moduleNameMapper: {
      '^@upmade/core$': '<rootDir>/../../core/src/index.ts',
    },
    testPathIgnorePatterns: ['/node_modules/'],
    testRegex: ['(/__tests__/.*|(\\.|/)(spec|e2e))\\.(tsx?|ts?)$'],
  },
  extras: {
    enableImportInjection: true,
  },
};
