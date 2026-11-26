import { Component, Host, Prop, h } from '@stencil/core';
import { UpmadeCore, UPMADE_WEBSITE_URL } from '@upmade/core';
import { UPMADE_LOGO_HEIGHT, UPMADE_LOGO_MARKUP, UPMADE_LOGO_VIEWBOX, UPMADE_LOGO_WIDTH } from './upmade-logo';

/** Draws the logo (the pink agent) into the badge's <svg>, once. */
const fillLogo = (svg?: SVGSVGElement): void => {
  if (svg && svg.innerHTML !== UPMADE_LOGO_MARKUP) svg.innerHTML = UPMADE_LOGO_MARKUP;
};

/** The badge's text: the website's address without the protocol, e.g. "upmade.io". */
const WATERMARK_TEXT = new URL(UPMADE_WEBSITE_URL).host;

/**
 * Watermark shown in the bottom-right corner of the engine: the Upmade logo (the pink agent) and "upmade.io".
 *
 * Rendered inside the engine's Shadow DOM unless the engine's
 * `isWatermarkVisible` prop is set to false. The badge links to the Upmade
 * website, and its tooltip reads "Powered by Upmade" in the active locale.
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
   * Resolved "Powered by Upmade" label, shown as the badge's tooltip. Passed in
   * by the engine so the badge re-renders when the active locale changes. Falls
   * back to resolving the term from the core when not provided.
   */
  @Prop() label?: string;

  render() {
    const label = this.label ?? this.core.localizationManager.translate('watermark.poweredBy');

    return (
      <Host>
        <a
          class="watermark-link"
          href={UPMADE_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          part="watermark"
          onPointerDown={(ev: PointerEvent) => ev.stopPropagation()}
          onPointerUp={(ev: PointerEvent) => ev.stopPropagation()}
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
            // the agent's drawing, filled in once the <svg> exists: inside SVG, Stencil would write an `innerHTML` prop as
            // a plain attribute. It has no children of its own here, so later renders leave the drawing in place.
            ref={fillLogo}
          />
          <span class="watermark-text">{WATERMARK_TEXT}</span>
        </a>
      </Host>
    );
  }
}
