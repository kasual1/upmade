// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createElement, useRef, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { useTimeline, type Timeline } from '../src/components/LandingPage/hooks/useTimeline';
import { useHeroNavObserver } from '../src/components/LandingPage/hooks/useHeroNavObserver';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** A stand-in IntersectionObserver whose entries the test reports by hand. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(
    public callback: (entries: Array<{ isIntersecting: boolean }>) => void,
    public options?: { threshold?: number },
  ) {
    FakeObserver.instances.push(this);
  }
  observe(element: Element) {
    this.observed.push(element);
  }
  disconnect() {
    this.disconnected = true;
  }
  report(isIntersecting: boolean) {
    act(() => this.callback([{ isIntersecting }]));
  }
}

let reducedMotion = false;
let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  FakeObserver.instances = [];
  reducedMotion = false;
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  window.matchMedia = ((query: string) => ({ matches: reducedMotion && query.includes('reduce') })) as typeof window.matchMedia;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function TimelineHost({ start }: { start: (timeline: Timeline) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useTimeline(ref, start);
  return createElement('div', { ref });
}

describe('useTimeline', () => {
  test('starts once the element is in view, runs steps in time and stops on unmount', () => {
    const log: string[] = [];
    const start = vi.fn(({ at }: Timeline) => {
      at(100, () => log.push('a'));
      at(300, () => log.push('b'));
    });
    act(() => root.render(createElement(TimelineHost, { start })));
    const [observer] = FakeObserver.instances;
    expect(observer.options?.threshold).toBe(0.3);
    expect(start).not.toHaveBeenCalled();

    observer.report(false);
    expect(start).not.toHaveBeenCalled();
    observer.report(true);
    expect(start).toHaveBeenCalledTimes(1);
    expect(observer.disconnected).toBe(true);

    vi.advanceTimersByTime(150);
    expect(log).toEqual(['a']);
    act(() => root.unmount());
    vi.advanceTimersByTime(1000);
    expect(log).toEqual(['a']);
    root = createRoot(container);
  });

  test('clear() cancels pending steps, so a loop can schedule its next round', () => {
    let rounds = 0;
    const start = ({ at, clear }: Timeline) => {
      const run = () => {
        clear();
        rounds += 1;
        at(500, () => (rounds += 100)); // cancelled by the restart below
        at(200, run);
      };
      run();
    };
    act(() => root.render(createElement(TimelineHost, { start })));
    FakeObserver.instances[0].report(true);
    vi.advanceTimersByTime(1000);
    expect(rounds).toBe(6);
  });

  test('does nothing with reduced motion', () => {
    reducedMotion = true;
    const start = vi.fn();
    act(() => root.render(createElement(TimelineHost, { start })));
    expect(FakeObserver.instances).toHaveLength(0);
    expect(start).not.toHaveBeenCalled();
  });
});

function NavHost() {
  const ref = useRef<HTMLElement>(null);
  useHeroNavObserver(ref as RefObject<Element | null>);
  return createElement('nav', { ref });
}

describe('useHeroNavObserver', () => {
  test('shows the site navbar only while the hero nav is out of view, and cleans up', () => {
    const html = document.documentElement;
    act(() => root.render(createElement(NavHost)));
    const [observer] = FakeObserver.instances;
    expect(observer.observed[0]?.tagName).toBe('NAV');

    observer.report(true);
    expect(html.classList.contains('landing-nav-visible')).toBe(false);
    observer.report(false);
    expect(html.classList.contains('landing-nav-visible')).toBe(true);

    act(() => root.unmount());
    expect(observer.disconnected).toBe(true);
    expect(html.classList.contains('landing-nav-visible')).toBe(false);
    expect(html.hasAttribute('data-landing-nav-animated')).toBe(false);
    root = createRoot(container);
  });
});
