/* ------------------------------------------------------------
   Portable Product Page behaviour
   Vanilla JS, no dependency on any other theme asset.
   Handles: gallery thumbnails, variant selection, quantity
   stepper, and AJAX add-to-cart.
------------------------------------------------------------ */
(function () {
  'use strict';

  function formatMoney(cents, format) {
    var value = (cents / 100).toFixed(2);
    var parts = value.split('.');
    var withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var formattedValue = withCommas + '.' + parts[1];
    return (format || '${{amount}}').replace(/\{\{\s*amount\s*\}\}/, formattedValue);
  }

  function initProductPage(root) {
    var moneyFormat = root.getAttribute('data-money-format') || '${{amount}}';
    var variantsScript = root.querySelector('[data-product-variants]');
    var variants = variantsScript ? JSON.parse(variantsScript.textContent) : [];

    var form = root.querySelector('[data-product-form]');
    var variantIdInput = root.querySelector('[data-variant-id-input]');
    var priceWrapper = root.querySelector('[data-price-wrapper]');
    var regularPriceEl = root.querySelector('[data-regular-price]');
    var comparePriceEl = root.querySelector('[data-compare-price]');
    var addToCartBtn = root.querySelector('[data-add-to-cart]');
    var addToCartText = root.querySelector('[data-add-to-cart-text]');
    var mainImage = root.querySelector('[data-gallery-main-image]');

    /* ---- Gallery thumbnails ---- */
    var thumbButtons = root.querySelectorAll('[data-gallery-thumbs] [data-index]');
    thumbButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (mainImage) {
          mainImage.src = btn.getAttribute('data-full-src');
        }
        thumbButtons.forEach(function (el) {
          el.classList.remove('is-active');
        });
        btn.classList.add('is-active');
      });
    });

    function setActiveThumbByMediaId(mediaId) {
      if (!mediaId) return;
      thumbButtons.forEach(function (el) {
        el.classList.toggle('is-active', String(el.getAttribute('data-media-id')) === String(mediaId));
      });
    }

    /* ---- Variant picker ---- */
    var optionGroups = root.querySelectorAll('[data-variant-picker] [data-option-index]');
    var selectedOptions = [];

    optionGroups.forEach(function (group) {
      var index = parseInt(group.getAttribute('data-option-index'), 10);
      var selectedBtn = group.querySelector('.ppg-variant-value.is-selected');
      selectedOptions[index] = selectedBtn ? selectedBtn.getAttribute('data-value') : null;
    });

    function findMatchingVariant() {
      return variants.filter(function (variant) {
        return variant.options.every(function (value, index) {
          return selectedOptions[index] == null || value === selectedOptions[index];
        });
      })[0];
    }

    function updateVariant(variant) {
      if (!variant) return;

      if (variantIdInput) {
        variantIdInput.value = variant.id;
      }

      if (regularPriceEl) {
        regularPriceEl.textContent = formatMoney(variant.price, moneyFormat);
      }

      var showCompare = variant.compare_at_price && variant.compare_at_price > variant.price;
      if (comparePriceEl) {
        comparePriceEl.hidden = !showCompare;
        if (showCompare) {
          comparePriceEl.textContent = formatMoney(variant.compare_at_price, moneyFormat);
        }
      }
      if (priceWrapper) {
        priceWrapper.classList.toggle('is-sale', !!showCompare);
      }

      if (addToCartBtn) {
        addToCartBtn.disabled = !variant.available;
      }
      if (addToCartText) {
        addToCartText.textContent = variant.available ? 'Add to cart' : 'Sold out';
      }

      if (variant.featured_image) {
        if (mainImage) {
          mainImage.src = variant.featured_image.src;
        }
        setActiveThumbByMediaId(variant.featured_image.id);
      }

      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
      }
    }

    root.querySelectorAll('[data-variant-picker] .ppg-variant-value').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(btn.getAttribute('data-option-index'), 10);
        var value = btn.getAttribute('data-value');
        selectedOptions[index] = value;

        var group = btn.closest('[data-option-index]');
        group.querySelectorAll('.ppg-variant-value').forEach(function (el) {
          el.classList.remove('is-selected');
        });
        btn.classList.add('is-selected');

        var selectedValueEl = group.querySelector('[data-selected-value]');
        if (selectedValueEl) {
          selectedValueEl.textContent = value;
        }

        updateVariant(findMatchingVariant());
      });
    });

    /* ---- Quantity stepper ---- */
    var quantityInput = root.querySelector('[data-quantity-input]');
    var decreaseBtn = root.querySelector('[data-quantity-decrease]');
    var increaseBtn = root.querySelector('[data-quantity-increase]');

    if (decreaseBtn && quantityInput) {
      decreaseBtn.addEventListener('click', function () {
        var current = parseInt(quantityInput.value, 10) || 1;
        quantityInput.value = Math.max(1, current - 1);
      });
    }
    if (increaseBtn && quantityInput) {
      increaseBtn.addEventListener('click', function () {
        var current = parseInt(quantityInput.value, 10) || 1;
        quantityInput.value = current + 1;
      });
    }

    /* ---- Add to cart (AJAX with graceful fallback) ---- */
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();

        var originalText = addToCartText ? addToCartText.textContent : '';
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (addToCartText) addToCartText.textContent = 'Adding...';

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            id: variantIdInput ? variantIdInput.value : undefined,
            quantity: quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1,
          }),
        })
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data && data.status) {
              if (addToCartText) addToCartText.textContent = data.description || 'Could not add to cart';
            } else {
              if (addToCartText) addToCartText.textContent = 'Added!';
              document.dispatchEvent(new CustomEvent('ppg:cart-updated', { detail: data }));
            }
          })
          .catch(function () {
            form.submit();
          })
          .finally(function () {
            setTimeout(function () {
              if (addToCartBtn) addToCartBtn.disabled = false;
              if (addToCartText) addToCartText.textContent = originalText;
            }, 1800);
          });
      });
    }

    /* ---- Recommendations (fetched, since `recommendations.*` is only
       populated when this section is requested through the dedicated
       recommendations endpoint) ---- */
    var recommendationsEl = root.querySelector('[data-recommendations]');
    if (recommendationsEl && recommendationsEl.getAttribute('data-url')) {
      fetch(recommendationsEl.getAttribute('data-url'))
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var recommendations = doc.querySelector('.ppg-recommendations');
          if (recommendations) {
            recommendationsEl.innerHTML = recommendations.outerHTML;
          }
        })
        .catch(function () {});
    }
  }

  document.querySelectorAll('[data-product-page]').forEach(initProductPage);
})();
