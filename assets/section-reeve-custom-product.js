// Reeve custom product JS
import { gsap, prefersReducedMotion } from '@theme/motion';

// Add to cart, then open the theme's own mini cart (cart drawer) instead of
// navigating to the cart page — dispatching the same standard cart event the
// native product form uses keeps the drawer's contents and styling identical
// to every other "Add to cart" button on the site.
async function addToCartAndOpenDrawer(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  const formData = new FormData(form);
  const variantId = formData.get('id');
  const quantity = Number(formData.get('quantity')) || 1;

  try {
    const { CartLinesUpdateEvent, CartErrorEvent } = await import('@shopify/events');
    const deferred = CartLinesUpdateEvent.createPromise();

    document.dispatchEvent(
      new CartLinesUpdateEvent({
        action: 'add',
        context: 'product',
        lines: [{ merchandiseId: String(variantId), quantity }],
        promise: deferred.promise,
      })
    );

    const addResponse = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    }).then((response) => response.json());

    if (addResponse.status) {
      document.dispatchEvent(
        new CartErrorEvent({ error: addResponse.message || 'Add to cart failed', code: 'INVALID' })
      );
      deferred.resolve({ cart: null, detail: { didError: true, source: 'reeve-custom-product' } });
      return;
    }

    const cart = await fetch('/cart.js', { headers: { Accept: 'application/json' } }).then((response) =>
      response.json()
    );

    deferred.resolve({
      cart: CartLinesUpdateEvent.createCartFromAjaxResponse(cart),
      detail: {
        items: cart.items,
        didError: false,
        source: 'reeve-custom-product',
        itemCount: quantity,
      },
    });
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target.closest('.reeve-card-footer form');
  if (!form) return;
  event.preventDefault();
  addToCartAndOpenDrawer(form);
});

const cards = document.querySelectorAll('[data-reeve-card]');
const hoverCapable = window.matchMedia('(hover: hover)').matches;
const reducedMotion = prefersReducedMotion();

if (reducedMotion) {
  document.querySelectorAll('[data-reeve-ticker] .reeve-card-ticker__inner').forEach((inner) => {
    inner.style.animation = 'none';
  });
}

if (hoverCapable) {
  cards.forEach((card) => {
    const style = card.dataset.hoverStyle === 'overlay' ? 'overlay' : 'grow';
    const hoverBg = card.querySelector('[data-reeve-hover-bg]');
    const main = card.querySelector('[data-reeve-card-main]');
    const extra = card.querySelector('[data-reeve-card-extra]');
    const revealEls = card.querySelectorAll('[data-reeve-reveal]');

    const timeline = gsap.timeline({
      paused: true,
      defaults: { duration: reducedMotion ? 0 : 0.35, ease: 'power2.out' },
    });

    if (hoverBg) {
      timeline.to(hoverBg, { opacity: 1 }, 0);
    }
    if (main) {
      timeline.to(main, { y: -8 }, 0);
    }
    if (extra) {
      if (style === 'overlay') {
        timeline.to(extra, { autoAlpha: 1, y: 0 }, 0.05);
      } else {
        timeline.to(extra, { height: 'auto' }, 0.05);
      }
    }
    if (revealEls.length) {
      timeline.to(revealEls, { opacity: 1, y: 0, stagger: 0.04 }, 0.1);
    }

    card.addEventListener('mouseenter', () => timeline.play());
    card.addEventListener('mouseleave', () => timeline.reverse());
    card.addEventListener('focusin', () => timeline.play());
    card.addEventListener('focusout', () => timeline.reverse());
  });
}
