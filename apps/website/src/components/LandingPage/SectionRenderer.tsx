import { Component, type ErrorInfo, type ReactNode } from "react";
import { SECTIONS, type SectionComponent } from "./registry";
import type { SectionConfig } from "./types";

/**
 * Keeps one broken section from taking the whole page down: it renders nothing in place of the section and logs
 * the error. (On the server an error still fails the build, which is what we want.)
 */
export class SectionErrorBoundary extends Component<{ id: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(`Landing section "${this.props.id}" failed to render`, error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/** Renders a page's visible sections in config order, each by its type's component from SECTIONS. */
export default function SectionRenderer({ sections }: { sections: readonly SectionConfig[] }): ReactNode {
  return (
    <>
      {sections
        .filter((section) => !section.hidden)
        .map((section) => {
          const C = SECTIONS[section.type] as SectionComponent<typeof section.type>;
          return (
            <SectionErrorBoundary key={section.id} id={section.id}>
              <C config={section as never} />
            </SectionErrorBoundary>
          );
        })}
    </>
  );
}
