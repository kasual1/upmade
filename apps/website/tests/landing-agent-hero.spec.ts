import { describe, expect, it } from "vitest";
import {
  ARROW,
  FREE_SLOTS,
  RUNNERS,
  WELCOME_MS,
  arrowTargets,
  describeCommand,
  esc,
  firstFreeSlot,
  linkPaths,
  matchRing,
  parseCommand,
  runFrames,
  signedArea2,
  slotPos,
  strokeDurations,
  unionBox,
  type Vec,
} from "../src/components/LandingPage/sections/AgentHero/logic";
import { agenticPage } from "../src/content/landing/agentic";

describe("agent hero: parseCommand", () => {
  it("understands the design's commands", () => {
    expect(parseCommand("clear")).toEqual({ kind: "clear" });
    expect(parseCommand("Remove all")).toEqual({ kind: "clear" });
    expect(parseCommand('Add a path that says "Welcome"')).toEqual({ kind: "welcome" });
    expect(parseCommand("draw a hand-drawn hi")).toEqual({ kind: "welcome" });
    expect(parseCommand("connect them")).toEqual({ kind: "arrow" });
    expect(parseCommand("add a frame called Login")).toEqual({ kind: "frame", title: "Login" });
    expect(parseCommand("add a box")).toEqual({ kind: "frame", title: "New frame" });
    expect(parseCommand("star us")).toEqual({ kind: "github" });
    expect(parseCommand('Add a text that says: "This is upmade.io"')).toEqual({ kind: "text", text: "This is upmade.io" });
    expect(parseCommand("text saying Made by agents")).toEqual({ kind: "text", text: "Made by agents" });
    expect(parseCommand("add a green note: Ship it")).toEqual({ kind: "note", text: "Ship it", colour: "green" });
    expect(parseCommand("Buy milk")).toEqual({ kind: "note", text: "Buy milk", colour: undefined });
  });

  it("sends a GitHub card prompt to the card, not to a frame (the design's demo ran it directly)", () => {
    expect(parseCommand("Generate a card to star or share upmade on GitHub")).toEqual({ kind: "github" });
  });

  it("maps each /agentic demo prompt to the design's step, in order", () => {
    const hero = agenticPage.sections.find((s) => s.type === "agentHero");
    expect(hero?.type).toBe("agentHero");
    if (hero?.type !== "agentHero") return;
    expect(hero.chat.demo.map((p) => parseCommand(p).kind)).toEqual(["welcome", "text", "github"]);
  });

  it("describes what the agent did for the live region", () => {
    expect(describeCommand({ kind: "note", text: "Hi" })).toContain("yellow note");
    expect(describeCommand({ kind: "frame", title: "Login" })).toContain("Login");
  });
});

describe("agent hero: board layout", () => {
  const agent = { x: 600, y: 500, w: 200, h: 200 };

  it("puts the slots beside the copy on wide heroes and around the agent on narrow ones, inside the hero", () => {
    expect(slotPos("hi", 1440, agent)).toEqual({ x: 1440 * 0.07 + 10, y: 350 });
    for (const W of [320, 390, 960]) {
      const a = { x: W / 2 - 66, y: 400, w: 132, h: 132 };
      for (const s of FREE_SLOTS) {
        const p = slotPos(s, W, a);
        expect(p.x).toBeGreaterThanOrEqual(8);
        expect(p.x + 112).toBeLessThanOrEqual(W - 8 + 1e-9);
      }
    }
  });

  it("hands out free slots in order", () => {
    expect(firstFreeSlot([])).toBe("hi");
    expect(firstFreeSlot(["hi", "n1", "title"])).toBe("n2");
    expect(firstFreeSlot([...FREE_SLOTS])).toBeNull();
  });

  it("boxes and links", () => {
    expect(unionBox([{ x: 10, y: 10, w: 10, h: 10 }, { x: 30, y: 0, w: 10, h: 40 }], 2)).toEqual({ x: 8, y: -2, w: 34, h: 44 });
    const l = linkPaths({ x: 0, y: 0, w: 20, h: 20 }, { x: 100, y: 100, w: 20, h: 20 });
    expect(l.d).toBe("M10 26 Q30 59 110 92");
    expect(l.head).toBe("M104 85 L110 92 L116 85");
  });
});

describe("agent hero: the morph's point matching", () => {
  const square = (n: number, ccw = false): Vec[] => {
    // a 40x40 square sampled clockwise on screen, starting mid-right
    const pts: Vec[] = [];
    const corners: Vec[] = [
      [40, 40],
      [0, 40],
      [0, 0],
      [40, 0],
    ];
    const path: Vec[] = [[40, 20], ...corners, [40, 20]];
    // walk the perimeter at equal steps
    const segs = path.slice(1).map((p, i) => [path[i], p] as [Vec, Vec]);
    const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
    const total = lens.reduce((s, l) => s + l, 0);
    for (let k = 0; k < n; k++) {
      let d = (total * k) / n;
      let i = 0;
      while (d > lens[i]) d -= lens[i++];
      const [a, b] = segs[i];
      const t = d / lens[i];
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return ccw ? pts.reverse() : pts;
  };

  it("starts at the top-left corner, runs clockwise and finds the corners in order", () => {
    for (const ccw of [false, true]) {
      const { ring, cn } = matchRing(square(160, ccw));
      expect(ring).toHaveLength(160);
      expect(signedArea2(ring)).toBeGreaterThan(0);
      expect(ring[0]).toEqual([0, 0]);
      expect(ring[cn[1]]).toEqual([40, 0]);
      expect(ring[cn[2]]).toEqual([40, 40]);
      expect(ring[cn[3]]).toEqual([0, 40]);
      expect(cn[4]).toBe(160);
    }
  });

  it("sends every point to the arrow, corners to corners", () => {
    const { cn } = matchRing(square(160));
    const to = arrowTargets(cn);
    expect(to).toHaveLength(160);
    expect(to[0]).toEqual(ARROW[0]);
    expect(to[cn[1]]).toEqual(ARROW[1]);
    expect(to[cn[2]]).toEqual(ARROW[2]);
    expect(to[cn[3]]).toEqual(ARROW[3]);
    expect(signedArea2([...ARROW])).toBeGreaterThan(0);
  });
});

describe("agent hero: crew and lettering", () => {
  it("runs each crew member off its own side, fading out", () => {
    for (const r of RUNNERS) {
      const f = runFrames(r, 1440, 160);
      expect(f).toHaveLength(37);
      expect(f[0].opacity).toBe(1);
      expect(f[f.length - 1].opacity).toBe(0);
      const x = Number(/translate\((-?[\d.]+)px/.exec(f[f.length - 1].transform)?.[1]);
      expect(Math.sign(x)).toBe(r.dx);
      expect(Math.abs(x)).toBeCloseTo(1440 * 0.62, 0);
    }
  });

  it("splits the Welcome time by stroke length", () => {
    expect(strokeDurations([100, 300])).toEqual([WELCOME_MS / 4, (3 * WELCOME_MS) / 4]);
  });

  it("escapes text for the board's objects", () => {
    expect(esc('<b>"x" & y</b>')).toBe("&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;");
  });
});
