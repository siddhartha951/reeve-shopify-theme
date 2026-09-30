import { gsap, ScrollTrigger, prefersReducedMotion } from '@theme/motion';
import { getScrollContainer, scrollContainerMediaQuery } from '@theme/scroll-container';

/** @type {ScrollTrigger | null} */
let trigger = null;

function setShrink(progress) {
  const header = document.getElementById('header-component');
  if (header) header.style.setProperty('--header-shrink', String(progress));
}

function createTrigger() {
  trigger?.kill();
  trigger = null;

  if (prefersReducedMotion()) {
    setShrink(0);
    return;
  }

  trigger = ScrollTrigger.create({
    scroller: getScrollContainer(),
    trigger: document.body,
    start: 'top top',
    end: '+=80',
    scrub: 0.3,
    onUpdate: (self) => setShrink(self.progress),
  });
}

createTrigger();

// The scroll container swaps between `.page-wrapper` (desktop) and the document
// (mobile) at the 990px breakpoint, so the trigger must be rebuilt to match.
scrollContainerMediaQuery.addEventListener('change', createTrigger);

/**
 * Measures the sticky announcement bar's own rendered height and exposes it
 * as `--announcement-bar-height` on <body>, so the (also sticky) header row
 * can offset itself by exactly that amount and the two stack instead of
 * overlapping. Measured directly rather than derived from
 * --header-group-height, which under-counts when the header is transparent
 * and is the last section in the group (see theme.liquid's
 * measureHeaderHeights()).
 *
 * Skipped entirely when the "Fix announcement bar when scrolling" setting is
 * off (no .announcement-bar--sticky class) — the header then only needs its
 * normal -1px offset, since the announcement bar scrolls away with the page.
 */
const announcementBar = document.querySelector('.announcement-bar.announcement-bar--sticky');

if (announcementBar) {
  const setAnnouncementBarHeight = () => {
    const section = announcementBar.closest('.shopify-section') ?? announcementBar;
    document.body.style.setProperty('--announcement-bar-height', `${Math.round(section.getBoundingClientRect().height)}px`);
  };

  setAnnouncementBarHeight();
  new ResizeObserver(setAnnouncementBarHeight).observe(announcementBar);
}
