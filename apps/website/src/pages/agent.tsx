import { useEffect, useState, type ReactNode } from "react";
import Layout from "@theme/Layout";
import type { DemoEntry } from "@site/src/components/Agents/demos/types";
import styles from "@site/src/components/Agents/preview.module.css";

/** Every file in components/Agents/demos shows up here (see demos/types.ts). `?only=<key>` shows just one. */
const context = (require as unknown as { context: (dir: string, deep: boolean, re: RegExp) => { keys(): string[]; (k: string): Record<string, unknown> } })
  .context("../components/Agents/demos", false, /^\.\/(?!types)[\w-]+\.tsx$/);

const DEMOS: DemoEntry[] = context
  .keys()
  .filter((file) => file.startsWith("./"))
  .flatMap((file) => {
    const mod = context(file) as { demos?: DemoEntry[]; default?: DemoEntry["Demo"]; label?: string; order?: number };
    const key = file.replace(/^\.\/|\.tsx$/g, "");
    if (mod.demos) return mod.demos;
    return mod.default ? [{ key, label: mod.label ?? key, order: mod.order ?? 1000, Demo: mod.default }] : [];
  })
  .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

export default function AgentPage(): ReactNode {
  const [only, setOnly] = useState<string | null>(null);
  useEffect(() => setOnly(new URLSearchParams(window.location.search).get("only")), []);
  const shown = only ? DEMOS.filter((d) => d.key === only) : DEMOS;
  return (
    <Layout title="Agents" description="The Upmade agent family and their animations.">
      <main className={styles.page}>
        <h1>Agents</h1>
        <div className={styles.grid}>
          {shown.map(({ key, label, Demo }) => (
            <figure key={key} className={styles.item} data-demo={key}>
              <Demo className={styles.agent} />
              <figcaption className={styles.label}>{label}</figcaption>
            </figure>
          ))}
        </div>
      </main>
    </Layout>
  );
}
