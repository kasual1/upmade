// Lets Node (which runs TypeScript directly since v24) load the site's .ts modules from scripts: their relative imports
// leave out the extension (`./tokens`), as bundlers allow, so a relative import that doesn't resolve as written is
// retried with ".ts". Use with `node --import ./scripts/ts-resolve.mjs <script>`.
import { register } from "node:module";

register(
  `data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (/^\\.{1,2}\\//.test(specifier) && !/\\.[a-z]+$/i.test(specifier)) return next(specifier + ".ts", context);
    throw error;
  }
}
`)}`,
  import.meta.url,
);
