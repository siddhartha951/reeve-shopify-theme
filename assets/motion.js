import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Whether the visitor has requested reduced motion. Sections should skip
 * scroll-driven/decorative animation and jump straight to the end state
 * when this is true.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return reduceMotionQuery.matches;
}

export { gsap, ScrollTrigger };
