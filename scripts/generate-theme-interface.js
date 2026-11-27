/**
 * Finds the CSS variables (--upmade-*) used in the core, engine and editor sources and updates
 * libs/core/src/interfaces/theme.interface.ts so that `UpmadeTheme` has a key for each of them.
 *
 * The update is additive and keeps what was written by hand:
 * - categories and keys already in the interface are kept, with their JSDoc comments, even when no source uses
 *   them any more (they are reported, so they can be removed by hand);
 * - variables of a new category or key are added, in sorted order.
 *
 * Usage:
 *   node scripts/generate-theme-interface.js          update the interface
 *   node scripts/generate-theme-interface.js --check  exit with 1, without writing, if it is not up to date
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CORE_SOURCE_DIR = path.join(__dirname, '../libs/core/src');
const ENGINE_SOURCE_DIR = path.join(__dirname, '../libs/engine/core/src');
const EDITOR_SOURCE_DIR = path.join(__dirname, '../libs/editor/core/src');
const THEME_INTERFACE_PATH = path.join(CORE_SOURCE_DIR, 'interfaces', 'theme.interface.ts');
const SOURCE_FILE_PATTERN = /\.(css|tsx|ts)$/;
// Specs reference variables that don't exist (to test that they don't), and `.d.ts` files are generated from sources.
const EXCLUDED_FILE_PATTERN = /\.(spec|test)\.tsx?$|\.d\.ts$/;
const CSS_VARIABLE_PATTERN = /--upmade-([a-zA-Z0-9-]+)/g;

/**
 * Theme categories, in kebab-case as in the variable names (`--upmade-<category>-<key>`). A variable belongs to the
 * longest category its name starts with, so `titlebar-menu` wins over `titlebar` and `object-appear` over `object`.
 */
const KNOWN_CATEGORIES = [
  'global',
  'engine',
  'snap',
  'toolbar',
  'tooltip',
  'context-menu',
  'menu',
  'slide-toggle',
  'split-button',
  'dropdown',
  'opacity-slider',
  'stroke-size',
  'line-endings',
  'utility-panel',
  'color-palette',
  'submenu',
  'portal',
  'more-menu',
  'back-to-content',
  'numeric-input',
  'text-input',
  'pill-tabs',
  'shape-fill',
  'settings',
  'notification-card',
  'dialog',
  'export',
  'master-detail',
  'editor',
  'font-size',
  'selection',
  'checkerboard',
  'button',
  'avatar',
  'active-users',
  'share-dialog',
  'login-dialog',
  'current-user-dialog',
  'awareness',
  'watermark',
  'zoom-panel',
  'chat-box',
  'sync-indicator',
  'titlebar',
  'titlebar-menu',
  'element-highlight',
  'loading-placeholder',
  'object',
  'object-appear',
  'dynamic-object',
  'iframe',
  'image',
  'text',
];

const SORTED_CATEGORIES = [...KNOWN_CATEGORIES].sort((a, b) => b.length - a.length);

/**
 * Variables that are not theme values: the engine computes or sets them itself, for its own styles or for the
 * content of objects to read. A theme key for them would do nothing, or be overwritten.
 */
const PRIVATE_VARIABLES = new Set([
  // Set on each object's container from the theme (`object`, `iframe`, `dynamicObject`, `image`) or the object.
  '--upmade-content-border-radius',
  // Set inline on each appearing object: its position in the batch it was inserted with.
  '--upmade-object-appear-index',
  // Set inside iframe documents from `global.defaultCursor` and `global.pointerCursor`.
  '--upmade-iframe-default-cursor',
  '--upmade-iframe-pointer-cursor',
]);

/**
 * Recursively find all source files in a directory
 */
function findSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findSourceFiles(fullPath, files);
    } else if (entry.isFile() && SOURCE_FILE_PATTERN.test(entry.name) && !EXCLUDED_FILE_PATTERN.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract the CSS variable names from a file. Skips names that are only the start of a name: built in a template
 * literal or by concatenation (`--upmade-titlebar-menu-${key}`, `'--upmade-menu-' + key`) or written as a pattern
 * in a comment (`--upmade-titlebar-menu-*`).
 */
function extractVariablesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const variables = new Set();
  let match;

  // Reset regex state
  CSS_VARIABLE_PATTERN.lastIndex = 0;

  while ((match = CSS_VARIABLE_PATTERN.exec(content)) !== null) {
    const name = match[1];
    const next = content[match.index + match[0].length];

    if (name.endsWith('-') || next === '$' || next === '*' || next === '{') {
      continue;
    }

    variables.add(`--upmade-${name}`);
  }

  return Array.from(variables);
}

/**
 * Determine the category for a CSS variable, or null if its name starts with none.
 */
function getCategoryForVariable(variable) {
  const name = variable.replace('--upmade-', '');

  for (const category of SORTED_CATEGORIES) {
    if (name.startsWith(`${category}-`)) {
      return category;
    }
  }

  return null;
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to kebab-case, as `ThemeHelper.camelToKebab` does
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert a CSS variable name to the camelCase key in its category
 */
function toPropertyName(cssVariable, category) {
  return kebabToCamel(cssVariable.replace(`--upmade-${category}-`, ''));
}

/**
 * Parse the categories and keys of the current `UpmadeTheme` interface, with the JSDoc comment before each. Throws
 * on anything else than `name: ThemeName`, categories and their `string` keys, rather than dropping it.
 *
 * @returns Map of category name → { comment, keys: Map of key → { comment } }, comments as arrays of trimmed lines
 */
function parseThemeInterface(content) {
  const categories = new Map();
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => /^export interface UpmadeTheme \{\s*$/.test(line));

  if (start === -1) {
    throw new Error('Could not find `export interface UpmadeTheme {`');
  }

  let category = null;
  let comment = null;
  let inComment = false;

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const fail = (reason) => {
      throw new Error(`${reason} at line ${i + 1}: \`${lines[i]}\``);
    };

    if (inComment) {
      comment.push(line);
      inComment = !line.includes('*/');
      continue;
    }

    if (line === '') {
      comment = null;
      continue;
    }

    if (line.startsWith('/*')) {
      comment = [line];
      inComment = !line.includes('*/');
      continue;
    }

    if (category === null) {
      if (line === '}') {
        return categories;
      }
      if (/^name: ThemeName;$/.test(line)) {
        comment = null;
        continue;
      }
      const match = /^([A-Za-z_$][\w$]*)\?: \{$/.exec(line);
      if (!match) {
        fail('Unexpected line in UpmadeTheme, expected a category');
      }
      if (categories.has(match[1])) {
        fail(`Duplicate category \`${match[1]}\``);
      }
      category = { name: match[1], comment, keys: new Map() };
      categories.set(match[1], category);
      comment = null;
      continue;
    }

    if (/^\};?$/.test(line)) {
      category = null;
      comment = null;
      continue;
    }

    const match = /^([A-Za-z_$][\w$]*)\?: string;$/.exec(line);
    if (!match) {
      fail(`Unexpected line in category \`${category.name}\`, expected an optional string key`);
    }
    if (!category.keys.has(match[1])) {
      category.keys.set(match[1], { comment });
    }
    comment = null;
  }

  throw new Error('UpmadeTheme is not closed');
}

/**
 * Emit a comment, re-indented
 */
function pushComment(lines, comment, indent) {
  comment.forEach((line, index) => {
    lines.push(index === 0 ? `${indent}${line}` : `${indent} ${line}`);
  });
}

/**
 * Generate the TypeScript theme interface content
 *
 * @param categories - Map of category name → { comment, keys: Map of key → { comment } }
 */
function generateThemeInterface(categories) {
  const lines = [];

  // Type definition for theme name
  lines.push('/**');
  lines.push(' * Theme name type for available themes');
  lines.push(' */');
  lines.push("export type ThemeName = 'light' | 'dark' | (string & NonNullable<unknown>);");
  lines.push('');

  // Main interface
  lines.push('/**');
  lines.push(' * Complete theme definition with all CSS variable values grouped by category');
  lines.push(' */');
  lines.push('export interface UpmadeTheme {');
  lines.push('  /** Theme identifier */');
  lines.push('  name: ThemeName;');

  for (const name of sortCategories(categories.keys())) {
    const category = categories.get(name);
    const label = camelToKebab(name).replace(/-/g, ' ');

    lines.push('');
    pushComment(lines, category.comment ?? [`/** ${label.charAt(0).toUpperCase() + label.slice(1)} variables */`], '  ');
    lines.push(`  ${name}?: {`);

    for (const key of sortKeys(category.keys.keys())) {
      const { comment } = category.keys.get(key);
      if (comment) {
        pushComment(lines, comment, '    ');
      }
      lines.push(`    ${key}?: string;`);
    }

    lines.push('  };');
  }

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

/**
 * Sort category names: global first, then alphabetically
 */
function sortCategories(names) {
  return Array.from(names).sort((a, b) => {
    if (a === 'global') return -1;
    if (b === 'global') return 1;
    return camelToKebab(a).localeCompare(camelToKebab(b));
  });
}

/**
 * Sort keys by their name in CSS
 */
function sortKeys(keys) {
  return Array.from(keys).sort((a, b) => {
    const kebabA = camelToKebab(a);
    const kebabB = camelToKebab(b);
    return kebabA < kebabB ? -1 : kebabA > kebabB ? 1 : 0;
  });
}

/**
 * Main execution
 */
function main() {
  const check = process.argv.includes('--check');

  console.log('🔍 Scanning source files for CSS variables...\n');

  const sourceFiles = [
    ...findSourceFiles(CORE_SOURCE_DIR),
    ...findSourceFiles(ENGINE_SOURCE_DIR),
    ...findSourceFiles(EDITOR_SOURCE_DIR),
  ];
  console.log(`Found ${sourceFiles.length} source files\n`);

  // Collect all unique variables
  const allVariables = new Set();

  for (const file of sourceFiles) {
    for (const variable of extractVariablesFromFile(file)) {
      allVariables.add(variable);
    }
  }

  console.log(`Found ${allVariables.size} unique CSS variables\n`);

  const current = fs.existsSync(THEME_INTERFACE_PATH) ? fs.readFileSync(THEME_INTERFACE_PATH, 'utf-8') : null;
  const categories = current ? parseThemeInterface(current) : new Map();

  // Keys of the current interface that a source still uses, to report the others
  const usedKeys = new Set();
  const added = [];
  const skipped = [];
  const uncategorized = [];

  for (const variable of Array.from(allVariables).sort()) {
    if (PRIVATE_VARIABLES.has(variable)) {
      skipped.push(variable);
      continue;
    }

    const category = getCategoryForVariable(variable);
    if (!category) {
      // A component's own override with the theme value as its fallback, e.g.
      // `var(--upmade-cursor-trail-color, var(--upmade-global-cursor-trail-color, …))`, has the global key.
      if (!allVariables.has(variable.replace('--upmade-', '--upmade-global-'))) {
        uncategorized.push(variable);
      }
      continue;
    }

    const categoryName = kebabToCamel(category);
    const key = toPropertyName(variable, category);
    usedKeys.add(`${categoryName}.${key}`);

    if (!categories.has(categoryName)) {
      categories.set(categoryName, { name: categoryName, comment: null, keys: new Map() });
    }
    const keys = categories.get(categoryName).keys;
    if (!keys.has(key)) {
      keys.set(key, { comment: null });
      added.push(`${categoryName}.${key}  (${variable})`);
    }
  }

  const unused = [];
  for (const [categoryName, category] of categories) {
    for (const key of category.keys.keys()) {
      if (!usedKeys.has(`${categoryName}.${key}`)) {
        unused.push(`${categoryName}.${key}  (--upmade-${camelToKebab(categoryName)}-${camelToKebab(key)})`);
      }
    }
  }

  const report = (title, items) => {
    if (items.length === 0) return;
    console.log(`${title} (${items.length}):`);
    for (const item of items) console.log(`  ${item}`);
    console.log('');
  };

  report('➕ New keys', added);
  report('🔒 Skipped private variables', skipped);
  report(
    '⚠️  Variables of no known category, not added: a theme sets --upmade-<category>-<key>, so it cannot set them ' +
      '(read the --upmade-global-* variable, or add the category to KNOWN_CATEGORIES)',
    uncategorized
  );
  report('⚠️  Kept keys that no source uses (remove them by hand if they are obsolete)', unused);

  const interfaceContent = generateThemeInterface(categories);
  const relativePath = path.relative(process.cwd(), THEME_INTERFACE_PATH);
  const keyCount = Array.from(categories.values()).reduce((count, category) => count + category.keys.size, 0);

  if (interfaceContent === current) {
    console.log(`✅ ${relativePath} is up to date (${categories.size} categories, ${keyCount} keys)`);
    return;
  }

  if (check) {
    console.error(`❌ ${relativePath} is not up to date: run node scripts/generate-theme-interface.js`);
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(THEME_INTERFACE_PATH, interfaceContent, 'utf-8');
  console.log(`✅ Updated ${relativePath} (${categories.size} categories, ${keyCount} keys)`);
}

main();
