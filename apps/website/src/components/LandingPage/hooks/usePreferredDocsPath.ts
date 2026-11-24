import { useEffect, useState } from "react";
import { frameworkPaths, getPreferredFramework, subscribeToPreferredFramework } from "@site/src/utils/frameworkPreference";

/**
 * The docs entry page of the visitor's preferred framework. The server (and the first client render, so hydration
 * matches) uses the React docs; the stored preference is applied after mount and followed as it changes.
 */
export function usePreferredDocsPath(): string {
  const [docsPath, setDocsPath] = useState(frameworkPaths.react);

  useEffect(() => {
    setDocsPath(frameworkPaths[getPreferredFramework()]);
    return subscribeToPreferredFramework((framework) => setDocsPath(frameworkPaths[framework]));
  }, []);

  return docsPath;
}
