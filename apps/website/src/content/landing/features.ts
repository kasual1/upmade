/**
 * The feature grid's six features: today's copy (Landing/Sections.tsx FEATURES), each acted out by an agent
 * (the design's order, L427-437: a golden key for open source, a hand-off for collaboration, shape-shifting for
 * framework agnostic, a control panel for customizable, devices for cross-platform, a speed-read book for AI ready).
 */
import type { FeatureGridSection } from "../../components/LandingPage/types";

export const FEATURES = [
  {
    title: "Open Source",
    body: "Upmade is 100% open source and meant for everyone to use, modify, and build upon. Contributions, feedback, and new ideas are always welcome!",
    agent: { key: "key" },
  },
  {
    title: "Realtime Collaboration",
    body: "Enable users to collaborate in real-time, making it easy for teams to work together on projects, share ideas, and see changes instantly.",
    agent: { key: "handoff" },
  },
  {
    title: "Framework Agnostic",
    body: "Upmade integrates seamlessly with any modern JavaScript framework like React, Vue or Angular. Focus on creativity, not compatibility.",
    agent: { key: "shapeShift" },
  },
  {
    title: "Customizable",
    body: "Tailor Upmade to your needs with a wide range of customizable tools, brushes, and settings.",
    agent: { key: "controlPanel" },
  },
  {
    title: "Cross-Platform",
    body: "Upmade features native support for desktop, tablet, and mobile devices. Build once and deliver a responsive canvas experience across all platforms.",
    agent: { key: "devices" },
  },
  {
    title: "AI Ready",
    body: "Enhance your agentic coding workflow with ready made skills and a dedicated MCP server.",
    agent: { key: "book" },
  },
] as const satisfies FeatureGridSection["items"];
