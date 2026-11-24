import type { AgentAnimation } from "../types";

/**
 * Swaps hats, for the squircle agent: lifts its hat off, swings it over its head and down behind its back, where
 * it swaps it for the next one, then brings that one up and over and puts it on.
 * Props: `worn` (on the head) and `held` (in the right hand). Events: `swap` (behind its back, show the next hat
 * in `held`) and `putOn` (the new hat is on: show it in `worn`, change the theme...).
 */
export const hatSwap: AgentAnimation = {
  duration: 2600,
  rest: 0,
  body: {
    lean: [[0, 0], [950, 0], [1200, 3], [1500, 3], [1750, 0]],
    lift: [[0, 0], [2050, 0], [2130, -2, "out"], [2230, 0]],
  },
  eyes: {
    look: [[0, [0, 0]], [350, [0, 0]], [550, [1, -2]], [950, [1, -2]], [1150, [2.2, 0.4]], [1550, [2.2, 0.4]], [1750, [1, -2]], [2100, [1, -2]], [2300, [0, 0]]],
    blinks: [2320],
  },
  hands: {
    R: {
      // to the hat, up off the head, down behind the back (switching layers only above the head), and back
      path: [[0, [54.8, 43]], [300, [54.8, 43]], [550, [47, 15.6]], [650, [47, 15.6]], [880, [47, -3]], [1150, [40, 40]],
        [1550, [40, 40]], [1820, [47, -3]], [2050, [47, 15.6]], [2150, [47, 15.6]], [2450, [54.8, 43]]],
      behind: [[900, 1800]],
    },
  },
  props: {
    worn: { attach: "head", rotate: [[0, -5]], scale: [[0, 1.25]], visible: [[0, 650], [2050, 2600]] },
    held: {
      attach: "R",
      offset: [[0, [-15, 0]], [880, [-15, 0]], [1150, [-12, 0]], [1550, [-12, 0]], [1820, [-15, 0]]],
      rotate: [[0, -5], [650, -5], [880, -12], [1150, 0], [1550, 0], [1820, -12], [2050, -5]],
      // a touch smaller behind the back, so no part of it pokes out
      scale: [[0, 1.25], [880, 1.25], [1150, 1], [1550, 1], [1820, 1.25]],
      visible: [[650, 2050]],
      behind: [[900, 1800]],
    },
  },
  events: [[1350, "swap"], [2050, "putOn"]],
};
