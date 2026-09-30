import { Component } from '@theme/component';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@theme/motion';
import { getScrollContainer } from '@theme/scroll-container';

class ReeveWhyWeExistSection extends Component {
  /** @type {ScrollTrigger | null} */
  #introTrigger = null;
  /** @type {ScrollTrigger | null} */
  #wordScrubTrigger = null;

  connectedCallback() {
    super.connectedCallback();
    this.#animateIntro();
    this.#animateHeadingWords();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#introTrigger?.kill();
    this.#introTrigger = null;
    this.#wordScrubTrigger?.kill();
    this.#wordScrubTrigger = null;
  }

  /** Eyebrow / inline images / footer: a simple one-time fade-up on scroll into view. */
  #animateIntro() {
    const eyebrow = this.querySelector('[data-reeve-why-eyebrow]');
    const images = this.querySelectorAll('[data-reeve-why-image]');
    const footer = this.querySelector('[data-reeve-why-footer]');
    const fadeItems = [eyebrow, footer].filter(Boolean);

    if (!fadeItems.length && !images.length) return;

    if (prefersReducedMotion() || window.Shopify?.designMode) {
      gsap.set([...fadeItems, ...images], { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(fadeItems, { opacity: 0, y: 24 });
    if (images.length) gsap.set(images, { opacity: 0, scale: 0.9 });

    const timeline = gsap.timeline({
      paused: true,
      defaults: { duration: 0.7, ease: 'power2.out' },
    });

    if (eyebrow) timeline.to(eyebrow, { opacity: 1, y: 0 }, 0);
    if (images.length) timeline.to(images, { opacity: 1, scale: 1, stagger: 0.08 }, 0.1);
    if (footer) timeline.to(footer, { opacity: 1, y: 0 }, 0.3);

    const rect = this.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      timeline.play();
      return;
    }

    this.#introTrigger = ScrollTrigger.create({
      scroller: getScrollContainer(),
      trigger: this,
      start: 'top 80%',
      once: true,
      onEnter: () => timeline.play(),
    });
  }

  /**
   * Heading: words start muted and progressively turn to the primary (dark)
   * color as the user scrolls through the section — continuously tied to
   * scroll position (scrub), not a one-time trigger. Blocks marked "Muted"
   * in the schema are left alone and stay muted throughout.
   */
  #animateHeadingWords() {
    const heading = this.querySelector('[data-reeve-why-heading]');
    if (!heading) return;

    const styles = getComputedStyle(this);
    const darkColor = styles.getPropertyValue('--reeve-why-text-color').trim() || '#10192b';
    const mutedColor = styles.getPropertyValue('--reeve-why-muted-text-color').trim() || '#9fb1c9';

    const textSpans = heading.querySelectorAll('.reeve-why-heading__text:not(.reeve-why-heading__text--muted)');
    const words = [];
    textSpans.forEach((span) => words.push(...this.#splitIntoWords(span)));

    if (!words.length) return;

    if (prefersReducedMotion() || window.Shopify?.designMode) {
      gsap.set(words, { color: darkColor });
      return;
    }

    gsap.set(words, { color: mutedColor });

    const timeline = gsap.timeline({
      scrollTrigger: {
        scroller: getScrollContainer(),
        trigger: heading,
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: 0.5,
      },
    });
    timeline.to(words, { color: darkColor, stagger: 0.05, ease: 'none' });

    this.#wordScrubTrigger = timeline.scrollTrigger ?? null;
  }

  /**
   * Wraps each word of a text node in its own <span> so color can be
   * animated per-word. Runs once; safe to call on plain, un-nested text.
   *
   * @param {Element} el
   * @returns {HTMLElement[]}
   */
  #splitIntoWords(el) {
    const words = (el.textContent ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];

    el.textContent = '';
    const fragment = document.createDocumentFragment();
    const wordEls = [];

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'reeve-why-word';
      span.textContent = word;
      fragment.appendChild(span);
      wordEls.push(span);
      if (index < words.length - 1) fragment.appendChild(document.createTextNode(' '));
    });

    el.appendChild(fragment);
    return wordEls;
  }
}

if (!customElements.get('reeve-why-we-exist-section')) {
  customElements.define('reeve-why-we-exist-section', ReeveWhyWeExistSection);
}
