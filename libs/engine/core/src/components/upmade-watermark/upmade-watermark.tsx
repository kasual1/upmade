import { Component, Host, Prop, h } from '@stencil/core';
import { UpmadeCore, UPMADE_WEBSITE_URL } from '@upmade/core';
import { UPMADE_LOGO_HEIGHT, UPMADE_LOGO_MARKUP, UPMADE_LOGO_VIEWBOX, UPMADE_LOGO_WIDTH } from './upmade-logo';

/**
 * The badge's text: the website's address without the protocol, e.g. "upmade.io", split before its last dot so it can
 * be set like the website's logo: the name bold, ".io" thinner.
 */
const WATERMARK_HOST = new URL(UPMADE_WEBSITE_URL).host;
const DOT = WATERMARK_HOST.lastIndexOf('.');
const WATERMARK_NAME = DOT > 0 ? WATERMARK_HOST.slice(0, DOT) : WATERMARK_HOST;
const WATERMARK_TLD = DOT > 0 ? WATERMARK_HOST.slice(DOT) : '';

/**
 * The agent's idle life. Every IDLE_GAP ms or so (each wait randomised) it has a moment: a glance (its eyes dart to a
 * spot, rest there and dart back, often blinking on the way back), a double glance (one side, then the other), a blink
 * or two, or now and then a little hop. When the pointer comes onto the badge it greets it like the website navbar's
 * agent: a hop and a glance towards the pointer, then a wave of its left hand with a smile. Each move is a short CSS
 * transition or animation (upmade-watermark.css) set
 * off by a timer or by that hover, so nothing runs between moments: no animation frames and no listeners on the page.
 */
const IDLE_GAP: [number, number] = [2200, 6500];
const LOOK_HOLD: [number, number] = [600, 1500];
/** how far the eyes turn (in the agent's drawing units) */
const LOOK_RANGE = { x: 2.2, y: 1.4 };
/** how long a dart of the eyes takes, and a blink's closed moment (see the stylesheet's transitions) */
const DART = 150;
const BLINK_SHUT = 100;
/** the hop's and the wave's lengths (the stylesheet's `hop` and `wave` animations) */
const HOP = 460;
const WAVE = 1150;

const between = ([min, max]: [number, number]) => min + Math.random() * (max - min);
const chance = (p: number) => Math.random() < p;

/** A moment as steps: wait this many ms, then do this. */
type Step = [wait: number, act: () => void];

/**
 * Watermark shown in the bottom-right corner of the engine: the Upmade logo (the pink agent) and "upmade.io".
 *
 * Now and then the agent glances around, blinks or hops, and it notices the pointer coming onto the badge; with
 * reduced motion it stands still. Rendered inside the engine's Shadow DOM unless the engine's `isWatermarkVisible`
 * prop is set to false. The badge links to the Upmade website, and screen readers announce it as "Powered by Upmade" in the
 * active locale.
 *
 * @part watermark - The badge (a link to the Upmade website)
 * @part watermark-logo - The Upmade logo (the pink agent) inside the badge
 */
@Component({
  tag: 'upmade-watermark',
  styleUrl: 'upmade-watermark.css',
  shadow: true,
})
export class UpmadeWatermark {
  /** The core instance used to resolve localized terms. */
  @Prop() core!: UpmadeCore;

  /**
   * Resolved "Powered by Upmade" label, the badge's accessible name (no tooltip). Passed in
   * by the engine so the badge re-renders when the active locale changes. Falls
   * back to resolving the term from the core when not provided.
   */
  @Prop() label?: string;

  private logo?: SVGSVGElement;
  /** the groups around the agent's eyes (upmade-logo.ts): `gaze` turns them, `lids` blinks them */
  private gaze?: SVGGElement | null;
  private lids?: SVGGElement | null;
  private timer?: ReturnType<typeof setTimeout>;
  private still = true;

  connectedCallback() {
    this.still = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.still) this.waitForNext();
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  /**
   * Draws the logo (the pink agent) into the badge's <svg>, once, and finds the groups that move its eyes. Filled in
   * once the <svg> exists: inside SVG, Stencil would write an `innerHTML` prop as a plain attribute. The <svg> has no
   * children of its own here, so later renders leave the drawing in place.
   */
  private readonly setLogo = (svg?: SVGSVGElement) => {
    this.logo = svg;
    if (!svg) return;
    if (svg.innerHTML !== UPMADE_LOGO_MARKUP) svg.innerHTML = UPMADE_LOGO_MARKUP;
    this.gaze = svg.querySelector<SVGGElement>('.gaze');
    this.lids = svg.querySelector<SVGGElement>('.lids');
  };

  // ---- playing moments ----

  /** Plays the steps one after another (each waits, then acts), then waits for the next idle moment. */
  private play(steps: Step[]) {
    const [first, ...rest] = steps;
    if (!first) {
      this.waitForNext();
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      first[1]();
      this.play(rest);
    }, first[0]);
  }

  private waitForNext() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.play(this.idleMoment()), between(IDLE_GAP));
  }

  /** A random idle moment. */
  private idleMoment(): Step[] {
    const r = Math.random();
    if (r < 0.42) return this.glance(this.side());
    if (r < 0.62) {
      const side = this.side();
      return [...this.glance(side, false), ...this.glance(-side as 1 | -1)];
    }
    if (r < 0.9) return chance(0.3) ? [...this.blink(), [140, () => {}], ...this.blink()] : this.blink();
    return [...this.hop(), ...this.blink(80)];
  }

  private side(): 1 | -1 {
    return chance(0.5) ? -1 : 1;
  }

  // ---- the moves ----

  /** Eyes dart to a spot on `side` (-1 left, 1 right), rest there, and (unless `back` is false) dart back ahead,
   *  often blinking as they come back. */
  private glance(side: 1 | -1, back = true): Step[] {
    const x = side * (0.55 + Math.random() * 0.45) * LOOK_RANGE.x;
    const y = (Math.random() * 1.6 - 1.1) * LOOK_RANGE.y;
    const steps: Step[] = [[0, () => this.lookAt(x, y)]];
    if (back) {
      steps.push([between(LOOK_HOLD), () => this.lookAt(0, 0)]);
      if (chance(0.35)) steps.push(...this.blink(DART / 2));
    } else steps.push([between(LOOK_HOLD), () => {}]);
    return steps;
  }

  private lookAt(x: number, y: number) {
    if (this.gaze) this.gaze.style.transform = x || y ? `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` : '';
  }

  private blink(wait = 0): Step[] {
    return [
      [wait, () => this.lids?.classList.add('shut')],
      [BLINK_SHUT, () => this.lids?.classList.remove('shut')],
    ];
  }

  /** A little hop: the whole agent springs up and lands with a squash (the stylesheet's `hop`). */
  private hop(): Step[] {
    return [
      [0, () => this.logo?.classList.add('hop')],
      [HOP, () => this.logo?.classList.remove('hop')],
    ];
  }

  /**
   * The pointer came onto the badge: the agent greets it, as the website navbar's agent does: it hops, glances towards
   * the pointer, and waves its left hand with a smile, then looks ahead again.
   */
  private readonly onPointerEnter = (ev: PointerEvent) => {
    if (this.still || !this.logo) return;
    const logo = this.logo;
    const box = logo.getBoundingClientRect();
    const toward = ev.clientX < box.left + box.width / 2 ? -1 : 1;
    this.lookAt(0, 0);
    this.lids?.classList.remove('shut');
    logo.classList.remove('hop', 'waving', 'smiling');
    // steps play one after another: hop and glance towards the pointer, land and wave with a smile, look ahead
    this.play([
      [0, () => logo.classList.add('hop')],
      [80, () => this.lookAt(toward * 0.8 * LOOK_RANGE.x, -0.6 * LOOK_RANGE.y)],
      [HOP - 80, () => {
        logo.classList.remove('hop');
        logo.classList.add('waving');
      }],
      [60, () => logo.classList.add('smiling')],
      [WAVE - 160, () => logo.classList.remove('smiling')],
      [100, () => {
        logo.classList.remove('waving');
        this.lookAt(0, 0);
      }],
    ]);
  };

  render() {
    const label = this.label ?? this.core.localizationManager.translate('watermark.poweredBy');

    return (
      <Host>
        <a
          class="watermark-link"
          href={UPMADE_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          // the label names the link for screen readers; no `title`, so no tooltip shows on hover
          aria-label={label}
          part="watermark"
          onPointerDown={(ev: PointerEvent) => ev.stopPropagation()}
          onPointerUp={(ev: PointerEvent) => ev.stopPropagation()}
          onPointerEnter={this.onPointerEnter}
        >
          <svg
            class="watermark-logo"
            part="watermark-logo"
            viewBox={UPMADE_LOGO_VIEWBOX}
            // its own size: the stylesheet sets its height, and its width follows from these
            width={UPMADE_LOGO_WIDTH}
            height={UPMADE_LOGO_HEIGHT}
            aria-hidden="true"
            focusable="false"
            ref={this.setLogo}
          />
          <span class="watermark-text">
            <b class="watermark-name">{WATERMARK_NAME}</b>
            {WATERMARK_TLD}
          </span>
        </a>
      </Host>
    );
  }
}
