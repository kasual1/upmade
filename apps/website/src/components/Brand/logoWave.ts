import type { AgentAnimation } from "../Agents";

/**
 * The logo agent's hello, played once as the landing pages' floating navbar slides in (CloudPop): timed from the
 * moment the agent starts growing out of its cloud, it raises its left hand (the one away from the "upmade.io" text)
 * up beside its body while still growing, waves it three times with happy eyes, and lowers it again. `waved` fires at the end, when BrandLogo goes back to the idle animation, so the wave never loops.
 * Positions are for the squircle (the logo's agent), whose left hand rests at (9.2 43).
 */
const REST = [9.2, 43] as const;
const UP_OUT = [4.5, 24.5] as const;
const UP_IN = [8.5, 21.5] as const;

export const logoWave: AgentAnimation = {
  duration: 1450,
  rest: 0,
  body: { breathe: 0.012 },
  eyes: { happy: [[450, 1100]] },
  hands: {
    L: {
      path: [
        [0, REST],
        [200, REST],
        [400, UP_OUT, "out"],
        [510, UP_IN],
        [620, UP_OUT],
        [730, UP_IN],
        [840, UP_OUT],
        [950, UP_IN],
        [1050, UP_OUT],
        [1300, REST],
      ],
    },
  },
  events: [[1350, "waved"]],
};
