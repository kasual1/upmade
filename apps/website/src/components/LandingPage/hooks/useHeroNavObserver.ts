import { useEffect, type RefObject } from "react";

/**
 * The landing pages' navbar contract: while `ref` (the hero's own header navigation) is on screen the site navbar
 * stays hidden; once it scrolls out, `html.landing-nav-visible` is set and the navbar floats in (css/navbar.css).
 * `data-landing-nav-animated` is set on <html> two frames after mount, so arriving from another page hides the
 * navbar instantly instead of sliding it away. Both are removed on unmount.
 */
export function useHeroNavObserver(ref: RefObject<Element | null>): void {
  useEffect(() => {
    const nav = ref.current;
    if (!nav) {
      return;
    }

    const root = document.documentElement;
    const observer = new IntersectionObserver(([entry]) => {
      root.classList.toggle("landing-nav-visible", !entry.isIntersecting);
    });
    observer.observe(nav);

    // Only animate the floating navbar once the page has settled, so arriving here from another
    // page hides it instantly instead of sliding it away.
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => root.setAttribute("data-landing-nav-animated", ""));
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      root.classList.remove("landing-nav-visible");
      root.removeAttribute("data-landing-nav-animated");
    };
  }, [ref]);
}
