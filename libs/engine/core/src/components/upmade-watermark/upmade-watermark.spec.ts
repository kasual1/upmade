jest.mock('@stencil/core', () => ({
  ...jest.requireActual('@stencil/core/internal/testing'),
  Component: () => (cls: any) => cls,
  Prop: () => () => {},
}));

import { UpmadeWatermark } from './upmade-watermark';
import { UPMADE_LOGO_HEIGHT, UPMADE_LOGO_MARKUP, UPMADE_LOGO_VIEWBOX, UPMADE_LOGO_WIDTH } from './upmade-logo';
import { UpmadeCore, UPMADE_WEBSITE_URL } from '@upmade/core';

const anchorOf = (vnode: any) => vnode.$children$[0];
const logoOf = (anchor: any) => anchor.$children$.find((child: any) => child.$tag$ === 'svg');
/** the text of a vnode and everything in it */
const allText = (vnode: any): string => (vnode.$text$ ?? '') + (vnode.$children$ ?? []).map(allText).join('');
const textOf = (anchor: any) => allText(anchor.$children$.find((child: any) => child.$tag$ === 'span'));
const nameOf = (anchor: any) =>
  anchor.$children$.find((child: any) => child.$tag$ === 'span').$children$.find((child: any) => child.$tag$ === 'b');

describe('UpmadeWatermark', () => {
  let component: UpmadeWatermark;
  let translate: jest.Mock;

  beforeEach(() => {
    translate = jest.fn().mockReturnValue('Powered by Upmade');

    component = new UpmadeWatermark();
    component.core = {
      localizationManager: {
        translate,
      },
    } as unknown as UpmadeCore;
  });

  it('should resolve the localized "Powered by Upmade" term', () => {
    component.render();

    expect(translate).toHaveBeenCalledWith('watermark.poweredBy');
  });

  it('should prefer the resolved label prop over resolving from core', () => {
    component.label = 'Propulsé par Upmade';

    const anchor = anchorOf(component.render());

    expect(anchor.$attrs$['aria-label']).toBe('Propulsé par Upmade');
    expect(translate).not.toHaveBeenCalled();
  });

  it('should reflect late label prop updates so locale changes apply immediately', () => {
    component.label = 'Powered by Upmade';
    expect(anchorOf(component.render()).$attrs$['aria-label']).toBe('Powered by Upmade');

    component.label = 'Mit Upmade erstellt';
    expect(anchorOf(component.render()).$attrs$['aria-label']).toBe('Mit Upmade erstellt');
  });

  it('should render a link to the Upmade website opening in a new tab', () => {
    const anchor = anchorOf(component.render());

    expect(anchor.$tag$).toBe('a');
    expect(anchor.$attrs$.href).toBe(UPMADE_WEBSITE_URL);
    expect(anchor.$attrs$.target).toBe('_blank');
    expect(anchor.$attrs$.rel).toBe('noopener noreferrer');
  });

  it('should name the link with the resolved label, without a tooltip', () => {
    translate.mockReturnValue('Propulsé par Upmade');

    const anchor = anchorOf(component.render());

    expect(anchor.$attrs$['aria-label']).toBe('Propulsé par Upmade');
    expect(anchor.$attrs$.title).toBeUndefined();
  });

  it('should show the website address as the link text, in every locale', () => {
    expect(textOf(anchorOf(component.render()))).toBe('upmade.io');

    component.label = 'Propulsé par Upmade';
    expect(textOf(anchorOf(component.render()))).toBe('upmade.io');
  });

  it('should set the name apart from ".io", like the website logo (bold name, thinner ".io")', () => {
    const name = nameOf(anchorOf(component.render()));

    expect(name.$attrs$.class).toBe('watermark-name');
    expect(allText(name)).toBe('upmade');
  });

  it('should show the Upmade logo (the pink agent) before the text, hidden from assistive technology', () => {
    const anchor = anchorOf(component.render());
    const logo = logoOf(anchor);

    expect(anchor.$children$.indexOf(logo)).toBe(0);
    expect(logo.$attrs$.viewBox).toBe(UPMADE_LOGO_VIEWBOX);
    expect(logo.$attrs$['aria-hidden']).toBe('true');

    // the drawing is filled in once the <svg> exists (an innerHTML prop would end up as an attribute in SVG)
    const svg = { innerHTML: '', querySelector: jest.fn() } as unknown as SVGSVGElement;
    logo.$attrs$.ref(svg);
    expect(svg.innerHTML).toBe(UPMADE_LOGO_MARKUP);
  });

  it("should mark the agent's outlines so the theme's logo colour can recolour them", () => {
    expect(UPMADE_LOGO_MARKUP).toContain('class="rim"');
  });

  it('should wrap the eyes in the groups that move them (gaze to look around, lids to blink)', () => {
    expect(UPMADE_LOGO_MARKUP).toContain('<g class="gaze"><g class="lids">');
    expect(UPMADE_LOGO_MARKUP).not.toContain('@keyframes');
  });

  describe('idle moments', () => {
    let gaze: { style: { transform: string } };
    let lids: { classList: { add: jest.Mock; remove: jest.Mock } };
    let svg: { innerHTML: string; querySelector: jest.Mock; classList: { add: jest.Mock; remove: jest.Mock }; getBoundingClientRect: () => object };
    let matchMedia: jest.SpyInstance | undefined;
    let random: jest.SpyInstance | undefined;

    beforeEach(() => {
      jest.useFakeTimers();
      gaze = { style: { transform: '' } };
      lids = { classList: { add: jest.fn(), remove: jest.fn() } };
      svg = {
        innerHTML: '',
        querySelector: jest.fn((sel: string) => (sel === '.gaze' ? gaze : lids)),
        classList: { add: jest.fn(), remove: jest.fn() },
        // the logo at x 100-123
        getBoundingClientRect: () => ({ left: 100, top: 94, width: 23, height: 16 }),
      };
      logoOf(anchorOf(component.render())).$attrs$.ref(svg);
    });

    afterEach(() => {
      component.disconnectedCallback();
      matchMedia?.mockRestore();
      random?.mockRestore();
      jest.useRealTimers();
    });

    it('should never listen to the pointer on the page', () => {
      const add = jest.spyOn(window, 'addEventListener');
      component.connectedCallback();
      jest.advanceTimersByTime(60_000);

      expect(add).not.toHaveBeenCalledWith('pointermove', expect.anything(), expect.anything());
      add.mockRestore();
    });

    it('should glance around now and then: eyes dart to a spot, rest, and come back ahead', () => {
      // 0.1: wait 2.63 s (2.2-6.5), a single glance, held 0.69 s (0.6-1.5)
      random = jest.spyOn(Math, 'random').mockReturnValue(0.1);
      component.connectedCallback();

      jest.advanceTimersByTime(2628);
      expect(gaze.style.transform).toBe('');

      jest.advanceTimersByTime(3);
      expect(gaze.style.transform).toMatch(/^translate\(-?[\d.]+px, -?[\d.]+px\)$/);

      jest.advanceTimersByTime(691);
      expect(gaze.style.transform).toBe('');
    });

    it('should blink by closing the lids for a moment', () => {
      // 0.8: wait 5.64 s, a single blink
      random = jest.spyOn(Math, 'random').mockReturnValue(0.8);
      component.connectedCallback();
      jest.advanceTimersByTime(5641);

      expect(lids.classList.add).toHaveBeenCalledWith('shut');
      jest.advanceTimersByTime(100);
      expect(lids.classList.remove).toHaveBeenCalledWith('shut');
    });

    it('should hop now and then', () => {
      // 0.95: wait 6.29 s, a hop
      random = jest.spyOn(Math, 'random').mockReturnValue(0.95);
      component.connectedCallback();
      jest.advanceTimersByTime(6286);

      expect(svg.classList.add).toHaveBeenCalledWith('hop');
      jest.advanceTimersByTime(460);
      expect(svg.classList.remove).toHaveBeenCalledWith('hop');
    });

    it('should greet the pointer coming onto the badge: hop and glance towards it, wave with a smile, look ahead', () => {
      component.connectedCallback();
      const anchor = anchorOf(component.render());

      // from the right of the logo
      anchor.$attrs$.onPointerEnter({ clientX: 200, clientY: 100 } as PointerEvent);
      jest.advanceTimersByTime(0);
      expect(svg.classList.add).toHaveBeenCalledWith('hop');

      jest.advanceTimersByTime(80);
      const [, x] = gaze.style.transform.match(/translate\((-?[\d.]+)px/)!;
      expect(Number(x)).toBeGreaterThan(0);

      // lands and waves, smiling
      jest.advanceTimersByTime(380);
      expect(svg.classList.remove).toHaveBeenCalledWith('hop');
      expect(svg.classList.add).toHaveBeenCalledWith('waving');
      jest.advanceTimersByTime(60);
      expect(svg.classList.add).toHaveBeenCalledWith('smiling');

      // the wave ends: the smile goes, then the hand and the eyes come back
      jest.advanceTimersByTime(990);
      expect(svg.classList.remove).toHaveBeenCalledWith('smiling');
      jest.advanceTimersByTime(100);
      expect(svg.classList.remove).toHaveBeenCalledWith('waving');
      expect(gaze.style.transform).toBe('');
    });

    it('should have smiling eyes and a left hand of its own to wave with', () => {
      expect(UPMADE_LOGO_MARKUP).toContain('class="happy"');
      expect(UPMADE_LOGO_MARKUP).toContain('<g class="hand-l">');
    });

    it('should stop when the watermark goes away', () => {
      component.connectedCallback();
      component.disconnectedCallback();
      jest.advanceTimersByTime(60_000);

      expect(gaze.style.transform).toBe('');
      expect(lids.classList.add).not.toHaveBeenCalled();
      expect(svg.classList.add).not.toHaveBeenCalled();
    });

    it('should stand still with reduced motion, also when hovered', () => {
      matchMedia = jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
      component.connectedCallback();
      anchorOf(component.render()).$attrs$.onPointerEnter({ clientX: 200, clientY: 100 } as PointerEvent);
      jest.advanceTimersByTime(60_000);

      expect(gaze.style.transform).toBe('');
      expect(lids.classList.add).not.toHaveBeenCalled();
      expect(svg.classList.add).not.toHaveBeenCalled();
    });
  });

  it('should give the logo its intrinsic size so its width follows the height set in CSS', () => {
    const logo = logoOf(anchorOf(component.render()));
    const [, , width, height] = UPMADE_LOGO_VIEWBOX.split(' ').map(Number);

    expect(logo.$attrs$.width).toBe(UPMADE_LOGO_WIDTH);
    expect(logo.$attrs$.height).toBe(UPMADE_LOGO_HEIGHT);
    expect([UPMADE_LOGO_WIDTH, UPMADE_LOGO_HEIGHT]).toEqual([width, height]);
  });

  it('should stop pointer events from reaching the engine so the link click is not suppressed', () => {
    const anchor = anchorOf(component.render());

    const pointerDownEvent = { stopPropagation: jest.fn() } as unknown as PointerEvent;
    const pointerUpEvent = { stopPropagation: jest.fn() } as unknown as PointerEvent;

    anchor.$attrs$.onPointerDown(pointerDownEvent);
    anchor.$attrs$.onPointerUp(pointerUpEvent);

    expect(pointerDownEvent.stopPropagation).toHaveBeenCalled();
    expect(pointerUpEvent.stopPropagation).toHaveBeenCalled();
  });
});
