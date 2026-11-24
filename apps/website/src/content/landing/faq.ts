/** The "/" FAQ: today's questions and answers (Landing/Sections.tsx FAQ_ITEMS), word for word. */
import type { FaqSection } from "../../components/LandingPage/types";

export const FAQ_ITEMS = [
  {
    q: "Which frameworks does Upmade support?",
    a: "Upmade works seamlessly with React, Vue, Angular, and Vanilla JavaScript. Built on native Web Components with first-class TypeScript support, it provides dedicated framework wrappers so you can use native props and event handlers in your stack.",
  },
  {
    q: "Can Upmade handle large, complex boards?",
    a: "Yes. Upmade is designed to handle large, complex boards. Using spatial indexing and viewport optimizations under the hood, it keeps panning and zooming responsive as your canvas grows.",
  },
  {
    q: "Is Upmade an alternative to tldraw or Excalidraw?",
    a: "Yes. Upmade is a lightweight alternative to tldraw and Excalidraw, giving you a core canvas experience without the bloat of heavier engines.",
  },
  {
    q: "Does Upmade support mobile devices, tablets, and trackpads?",
    a: "Yes. Upmade includes native gesture handling out of the box. It smoothly manages trackpad pinch-to-zoom, touch gestures on mobile/tablet screens, and traditional mouse wheel inputs across all major browsers.",
  },
  {
    q: "Is Upmade free to use?",
    a: "Yes. Upmade is open source under the MIT License, so you can use it for free in personal and commercial projects. The editor shows a small upmade.io badge by default; keeping it helps the project grow, but you can hide it with the isWatermarkVisible prop.",
  },
] as const satisfies FaqSection["items"];
