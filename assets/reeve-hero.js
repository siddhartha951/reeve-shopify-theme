import { Component } from '@theme/component';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@theme/motion';

class ReeveHeroSection extends Component {
  /** @type {ScrollTrigger | null} */
  #sideLogoTrigger = null;

  connectedCallback() {
    super.connectedCallback();
    this.#animateContentIn();
    this.#setupSideLogoFade();
    this.#setupSoundToggle();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#sideLogoTrigger?.kill();
    this.#sideLogoTrigger = null;
  }

  #animateContentIn() {
    const content = this.querySelector('[data-reeve-hero-content]');
    if (!content) return;

    const items = Array.from(content.children);
    if (!items.length) return;

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(items, { opacity: 0, y: 24 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.12,
      delay: 0.2,
    });
  }

  #setupSideLogoFade() {
    const sideLogo = this.querySelector('[data-reeve-hero-side-logo]');
    if (!sideLogo || prefersReducedMotion()) return;

    this.#sideLogoTrigger = ScrollTrigger.create({
      trigger: this,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(sideLogo, { opacity: 1 - self.progress });
      },
    });
  }

  #setupSoundToggle() {
    const toggle = this.querySelector('[data-reeve-hero-sound-toggle]');
    const video = this.querySelector('[data-reeve-hero-video]');
    const label = this.querySelector('[data-reeve-hero-sound-label]');
    if (!toggle || !(video instanceof HTMLVideoElement)) return;

    toggle.addEventListener('click', () => {
      video.muted = !video.muted;
      toggle.setAttribute('aria-pressed', String(!video.muted));
      if (label) label.textContent = video.muted ? 'Sound: Off' : 'Sound: On';
    });
  }
}

if (!customElements.get('reeve-hero-section')) {
  customElements.define('reeve-hero-section', ReeveHeroSection);
}
