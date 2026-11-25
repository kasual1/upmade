/** The /agentic FAQ: the "Agentic" design's questions and answers, word for word. */
import type { FaqSection } from "../../components/LandingPage/types";

export const AGENTIC_FAQ_ITEMS = [
  {
    q: "What makes a canvas agentic?",
    a: "An agentic canvas lets your application give an AI agent control of the board. With Upmade, your app can create, move, and delete objects, control the viewport, and respond to canvas changes through code.",
  },
  {
    q: "Can people see what an AI agent is doing?",
    a: "Yes. Each agent is an UpmadeAgent with its own name, color, status message, and avatar. Its cursor flies to what it works on and animates every change, so people can watch it select, draw, and edit. Collaborators see your agents too: they are shared through presence, with their cursor, selection, and avatar.",
  },
  {
    q: "Can people and agents work on the same canvas?",
    a: "Yes. People can interact with the board while your application and agents make changes through Upmade's API, so both can work with the same canvas objects.",
  },
  {
    q: "Which frameworks can I use to build an agentic canvas?",
    a: "Upmade supports React, Vue, Angular, and Vanilla JavaScript. Its Web Component-based engine and framework wrappers let you integrate an agentic canvas into your existing app.",
  },
  {
    q: "Is Upmade free to use?",
    a: "Yes. Upmade is open source under the MIT License, including its agentic features, so you can build agentic canvases for free in personal and commercial projects. The upmade.io badge can be hidden with the `isWatermarkVisible` prop.",
  },
] as const satisfies FaqSection["items"];
