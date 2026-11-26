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
const textOf = (anchor: any) => anchor.$children$.find((child: any) => child.$tag$ === 'span').$children$[0].$text$;

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

    expect(anchor.$attrs$.title).toBe('Propulsé par Upmade');
    expect(translate).not.toHaveBeenCalled();
  });

  it('should reflect late label prop updates so locale changes apply immediately', () => {
    component.label = 'Powered by Upmade';
    expect(anchorOf(component.render()).$attrs$.title).toBe('Powered by Upmade');

    component.label = 'Mit Upmade erstellt';
    expect(anchorOf(component.render()).$attrs$.title).toBe('Mit Upmade erstellt');
  });

  it('should render a link to the Upmade website opening in a new tab', () => {
    const anchor = anchorOf(component.render());

    expect(anchor.$tag$).toBe('a');
    expect(anchor.$attrs$.href).toBe(UPMADE_WEBSITE_URL);
    expect(anchor.$attrs$.target).toBe('_blank');
    expect(anchor.$attrs$.rel).toBe('noopener noreferrer');
  });

  it('should show the resolved label as the tooltip', () => {
    translate.mockReturnValue('Propulsé par Upmade');

    const anchor = anchorOf(component.render());

    expect(anchor.$attrs$.title).toBe('Propulsé par Upmade');
  });

  it('should show the website address as the link text, in every locale', () => {
    expect(textOf(anchorOf(component.render()))).toBe('upmade.io');

    component.label = 'Propulsé par Upmade';
    expect(textOf(anchorOf(component.render()))).toBe('upmade.io');
  });

  it('should show the Upmade logo (the pink agent) before the text, hidden from assistive technology', () => {
    const anchor = anchorOf(component.render());
    const logo = logoOf(anchor);

    expect(anchor.$children$.indexOf(logo)).toBe(0);
    expect(logo.$attrs$.viewBox).toBe(UPMADE_LOGO_VIEWBOX);
    expect(logo.$attrs$['aria-hidden']).toBe('true');

    // the drawing is filled in once the <svg> exists (an innerHTML prop would end up as an attribute in SVG)
    const svg = { innerHTML: '' } as unknown as SVGSVGElement;
    logo.$attrs$.ref(svg);
    expect(svg.innerHTML).toBe(UPMADE_LOGO_MARKUP);
  });

  it("should mark the agent's outlines so the theme's logo colour can recolour them", () => {
    expect(UPMADE_LOGO_MARKUP).toContain('class="rim"');
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
