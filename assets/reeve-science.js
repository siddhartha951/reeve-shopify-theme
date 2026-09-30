import { Component } from '@theme/component';
import { ScrollTrigger, prefersReducedMotion } from '@theme/motion';
import { getScrollContainer, scrollContainerMediaQuery } from '@theme/scroll-container';

class ReeveScienceSection extends Component {
  /** @type {ScrollTrigger | null} */
  #scrollTrigger = null;
  /** @type {number} */
  #activeIndex = -1;
  /** @type {string} */
  #defaultVideoSrc = '';

  connectedCallback() {
    super.connectedCallback();

    const video = this.querySelector('[data-reeve-science-video]');
    this.#defaultVideoSrc = video?.querySelector('source')?.getAttribute('src') ?? '';

    this.#setup();
    scrollContainerMediaQuery.addEventListener('change', this.#setup);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    scrollContainerMediaQuery.removeEventListener('change', this.#setup);
    this.#scrollTrigger?.kill();
    this.#scrollTrigger = null;
  }

  #setup = () => {
    this.#scrollTrigger?.kill();
    this.#scrollTrigger = null;

    const steps = this.querySelectorAll('[data-reeve-science-step]');
    if (!steps.length) return;

    // Desktop-only pinned/scrubbed step progression. Mobile shows everything
    // statically stacked (see CSS), and the theme editor doesn't replay
    // scroll-scrub reliably, so both just show the first step active.
    if (!scrollContainerMediaQuery.matches || prefersReducedMotion() || window.Shopify?.designMode) {
      this.#setActiveStep(0, steps);
      return;
    }

    this.#setActiveStep(0, steps);

    // Progress is read across the tall pin-spacer (its height is set in
    // Liquid from the block count) — the spacer is what CSS position:sticky
    // uses to hold .reeve-science-pin-inner on screen, so tying scroll
    // progress to the same element keeps everything in sync. No GSAP
    // pin here — sticky handles "stuck on screen" natively.
    const pinSpacer = this.querySelector('[data-reeve-science-pin-spacer]') ?? this;

    this.#scrollTrigger = ScrollTrigger.create({
      scroller: getScrollContainer(),
      trigger: pinSpacer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const index = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        this.#setActiveStep(index, steps);
        this.#setProgress(self.progress);
      },
    });
  };

  /**
   * @param {number} index
   * @param {NodeListOf<Element>} steps
   */
  #setActiveStep(index, steps) {
    if (index === this.#activeIndex) return;
    this.#activeIndex = index;

    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));

    const activeStep = steps[index];
    const videoSrc = activeStep?.getAttribute('data-step-video') || this.#defaultVideoSrc;
    this.#setVideoSrc(videoSrc);
  }

  /** @param {number} progress */
  #setProgress(progress) {
    const fill = this.querySelector('[data-reeve-science-progress-fill]');
    if (fill) fill.style.height = `${Math.round(progress * 100)}%`;
  }

  /** @param {string} src */
  #setVideoSrc(src) {
    const video = this.querySelector('[data-reeve-science-video]');
    if (!(video instanceof HTMLVideoElement) || !src) return;

    const source = video.querySelector('source');
    if (source?.getAttribute('src') === src) return;

    if (source) {
      source.setAttribute('src', src);
    } else {
      const newSource = document.createElement('source');
      newSource.setAttribute('src', src);
      video.appendChild(newSource);
    }

    video.load();
    video.play().catch(() => {});
  }
}

if (!customElements.get('reeve-science-section')) {
  customElements.define('reeve-science-section', ReeveScienceSection);
}
