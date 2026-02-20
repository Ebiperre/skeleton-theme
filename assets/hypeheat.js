/**
 * HypeHeat — Master JavaScript
 * Preloader, Sidebar, AJAX Cart Drawer, Hype Popup, Live Viewer Count
 * No dependencies. Uses native fetch API.
 */

(function () {
  'use strict';

  /* ======================
     PRELOADER
     ====================== */
  const preloader = document.getElementById('Preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 400);
    }, 2500);
  }

  /* ======================
     SIDEBAR (Mobile Toggle)
     ====================== */
  const sidebar = document.getElementById('Sidebar');
  const sidebarOpen = document.getElementById('SidebarOpen');
  const sidebarClose = document.getElementById('SidebarClose');

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  if (sidebarOpen) sidebarOpen.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);

  /* ======================
     CART DRAWER
     ====================== */
  const cartDrawer = document.getElementById('CartDrawer');
  const cartOverlay = document.getElementById('CartDrawerOverlay');
  const cartClose = document.getElementById('CartDrawerClose');
  const cartTrigger = document.getElementById('CartDrawerTrigger');
  const cartTriggerMobile = document.getElementById('CartDrawerTriggerMobile');

  function openCartDrawer() {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closeCartDrawer() {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  if (cartTrigger) {
    cartTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      openCartDrawer();
    });
  }
  if (cartTriggerMobile) {
    cartTriggerMobile.addEventListener('click', function (e) {
      e.preventDefault();
      openCartDrawer();
    });
  }
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  /* --- Cart: Update badge counts --- */
  function updateCartBadges(count) {
    document.querySelectorAll('.js-cart-count').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  /* --- Cart: Update shipping bar --- */
  function updateShippingBar(totalPrice) {
    var thresholdCents = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--free-shipping-threshold')) || 150) * 100;
    var shippingText = document.getElementById('CartShippingText');
    var shippingFill = document.getElementById('CartShippingFill');

    if (shippingText) {
      if (totalPrice >= thresholdCents) {
        shippingText.innerHTML = 'You\'ve unlocked <strong>FREE SHIPPING</strong>';
      } else {
        var remaining = (thresholdCents - totalPrice) / 100;
        shippingText.innerHTML = 'Spend <strong>$' + remaining.toFixed(2) + '</strong> more for <strong>FREE SHIPPING</strong>';
      }
    }

    if (shippingFill) {
      var progress = Math.min((totalPrice / thresholdCents) * 100, 100);
      shippingFill.style.width = progress + '%';
    }
  }

  /* --- Cart: Render items from cart.js response --- */
  function renderCartDrawer(cart) {
    var itemsContainer = document.getElementById('CartDrawerItems');
    var subtotalEl = document.getElementById('CartSubtotal');

    if (!itemsContainer) return;

    if (cart.item_count === 0) {
      itemsContainer.innerHTML = '<div class="cart-drawer__empty">Your cart is empty</div>';
    } else {
      var html = '';
      cart.items.forEach(function (item, index) {
        var line = index + 1;
        var variantTitle = item.variant_title && item.variant_title !== 'Default Title'
          ? '<div class="cart-drawer__item-variant">' + item.variant_title + '</div>'
          : '';

        var imageHtml = '';
        if (item.image) {
          imageHtml = '<img class="cart-drawer__item-image" src="' + item.image + '" alt="' + item.title + '" width="70" height="90" loading="lazy">';
        }

        html += '<div class="cart-drawer__item" data-line="' + line + '">'
          + imageHtml
          + '<div class="cart-drawer__item-info">'
          + '<div class="cart-drawer__item-title">' + item.product_title + '</div>'
          + variantTitle
          + '<div class="cart-drawer__item-price">' + formatMoney(item.final_line_price) + '</div>'
          + '<div class="cart-drawer__item-qty">'
          + '<button type="button" data-qty-change="-1" data-line="' + line + '" aria-label="Decrease quantity">\u2212</button>'
          + '<span>' + item.quantity + '</span>'
          + '<button type="button" data-qty-change="1" data-line="' + line + '" aria-label="Increase quantity">+</button>'
          + '</div>'
          + '<button type="button" class="cart-drawer__item-remove" data-line="' + line + '" data-qty-change="remove">Remove</button>'
          + '</div>'
          + '</div>';
      });
      itemsContainer.innerHTML = html;
    }

    if (subtotalEl) {
      subtotalEl.textContent = formatMoney(cart.total_price);
    }

    updateCartBadges(cart.item_count);
    updateShippingBar(cart.total_price);
    bindCartItemButtons();
  }

  /* --- Cart: Simple money formatter --- */
  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  /* --- Cart: Fetch fresh cart and re-render --- */
  function refreshCart() {
    return fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        renderCartDrawer(cart);
        return cart;
      });
  }

  /* --- Cart: Add to cart via AJAX --- */
  function addToCart(variantId, quantity) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: variantId, quantity: quantity || 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        return refreshCart();
      })
      .then(function () {
        openCartDrawer();
      });
  }

  /* --- Cart: Change line item quantity --- */
  function changeLineQuantity(line, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        renderCartDrawer(cart);
      });
  }

  /* --- Cart: Bind +/- and remove buttons --- */
  function bindCartItemButtons() {
    document.querySelectorAll('[data-qty-change]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var line = parseInt(this.getAttribute('data-line'));
        var change = this.getAttribute('data-qty-change');

        if (change === 'remove') {
          changeLineQuantity(line, 0);
        } else {
          var qtyEl = this.closest('.cart-drawer__item-qty');
          if (qtyEl) {
            var current = parseInt(qtyEl.querySelector('span').textContent) || 0;
            var newQty = current + parseInt(change);
            if (newQty < 1) newQty = 0;
            changeLineQuantity(line, newQty);
          }
        }
      });
    });
  }

  /* Bind initial server-rendered cart buttons */
  bindCartItemButtons();

  /* --- Cart: Intercept PDP form submission --- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.getAttribute('data-ajax-cart') !== 'true') return;

    e.preventDefault();

    var variantInput = form.querySelector('[name="id"]');
    var qtyInput = form.querySelector('[name="quantity"]');

    if (!variantInput) return;

    var variantId = parseInt(variantInput.value);
    var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    addToCart(variantId, qty);
  });

  /* --- Cart: Quick Add from product cards --- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.product-card__quick-add-btn');
    if (!btn) return;

    e.preventDefault();
    var variantId = parseInt(btn.getAttribute('data-variant-id'));
    if (variantId) addToCart(variantId, 1);
  });

  /* ======================
     PDP: VARIANT BUTTONS + PRICE UPDATE
     ====================== */
  var productJSON = window.__productJSON || null;

  if (productJSON) {
    var optionBtns = document.querySelectorAll('.pdp__option-btn');
    var variantSelect = document.getElementById('ProductVariantSelect');
    var priceEl = document.getElementById('ProductCurrentPrice');
    var comparePriceEl = document.getElementById('ProductComparePrice');
    var addBtn = document.getElementById('PdpAddBtn');
    var addBtnWrap = document.getElementById('PdpAddBtnWrap');

    // Build current selected options array from product data
    var selectedOptions = [];
    if (productJSON.variants && productJSON.variants.length > 0) {
      var currentVariant = productJSON.variants.find(function (v) { return v.id === parseInt(variantSelect.value); });
      if (currentVariant && currentVariant.options) {
        selectedOptions = currentVariant.options.slice();
      }
    }

    function findVariant() {
      return productJSON.variants.find(function (v) {
        return v.options.every(function (opt, i) {
          return opt === selectedOptions[i];
        });
      });
    }

    function updateVariantUI(variant) {
      // Update hidden select
      if (variantSelect) variantSelect.value = variant ? variant.id : '';

      // Update price
      if (priceEl) priceEl.textContent = variant ? formatMoney(variant.price) : '';

      // Update compare-at price
      if (comparePriceEl) {
        if (variant && variant.compare_at_price && variant.compare_at_price > variant.price) {
          comparePriceEl.textContent = formatMoney(variant.compare_at_price);
          comparePriceEl.style.display = '';
        } else {
          comparePriceEl.style.display = 'none';
        }
      }

      // Update add-to-cart button
      if (addBtnWrap && variant) {
        if (variant.available) {
          addBtnWrap.innerHTML = '<button type="submit" class="btn btn--primary pdp__add-btn" id="PdpAddBtn">' + (document.querySelector('[data-add-text]')?.dataset.addText || 'Add to Drop') + '</button>';
        } else {
          addBtnWrap.innerHTML = '<button type="button" class="btn btn--secondary pdp__add-btn" id="PdpAddBtn" disabled>Sold Out</button>';
        }
      }

      // Update selected label text
      selectedOptions.forEach(function (val, i) {
        var label = document.getElementById('OptionSelected-' + (i + 1));
        if (label) label.textContent = val;
      });

      // Mark unavailable options
      markUnavailableOptions();

      // Update URL without page reload
      if (variant) {
        var url = new URL(window.location);
        url.searchParams.set('variant', variant.id);
        history.replaceState(null, '', url.toString());
      }
    }

    function markUnavailableOptions() {
      optionBtns.forEach(function (btn) {
        var pos = parseInt(btn.dataset.optionPosition) - 1;
        var val = btn.dataset.value;

        // Build test options to see if any variant exists with this value
        var testOptions = selectedOptions.slice();
        testOptions[pos] = val;
        var exists = productJSON.variants.some(function (v) {
          return v.options[pos] === val && v.available;
        });

        btn.classList.toggle('is-unavailable', !exists);
      });
    }

    optionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pos = parseInt(this.dataset.optionPosition) - 1;
        var val = this.dataset.value;

        selectedOptions[pos] = val;

        // Update button states in this group
        var siblings = this.closest('.pdp__option-buttons').querySelectorAll('.pdp__option-btn');
        siblings.forEach(function (s) {
          s.classList.remove('is-selected');
          s.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('is-selected');
        this.setAttribute('aria-pressed', 'true');

        var variant = findVariant();
        if (variant) updateVariantUI(variant);

        // Scroll gallery to variant image on mobile
        if (variant && variant.featured_image) {
          var gallery = document.getElementById('PdpGallery');
          if (gallery) {
            var slides = gallery.querySelectorAll('.pdp__gallery-slide img');
            slides.forEach(function (img, idx) {
              if (img.src && variant.featured_image.src && img.src.indexOf(variant.featured_image.src.split('?')[0].split('/').pop()) > -1) {
                var slide = gallery.querySelectorAll('.pdp__gallery-slide')[idx];
                if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
              }
            });
          }
        }
      });
    });

    // Initial unavailable marking
    markUnavailableOptions();
  }

  /* ======================
     PDP: QUANTITY +/- BUTTONS
     ====================== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-qty-dir]');
    if (!btn) return;
    var wrap = btn.closest('.pdp__quantity-wrap');
    if (!wrap) return;
    var input = wrap.querySelector('.pdp__quantity-input');
    if (!input) return;
    var current = parseInt(input.value) || 1;
    var dir = parseInt(btn.dataset.qtyDir);
    var min = parseInt(input.min) || 1;
    var max = parseInt(input.max) || 99;
    var next = Math.max(min, Math.min(max, current + dir));
    input.value = next;
  });

  /* ======================
     PDP: MOBILE GALLERY DOTS
     ====================== */
  var pdpGallery = document.getElementById('PdpGallery');
  var pdpDots = document.getElementById('PdpGalleryDots');

  if (pdpGallery && pdpDots) {
    var dots = pdpDots.querySelectorAll('.pdp__gallery-dot');

    // Sync dots on scroll
    var scrollTimer;
    pdpGallery.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var scrollLeft = pdpGallery.scrollLeft;
        var slideWidth = pdpGallery.offsetWidth;
        var activeIndex = Math.round(scrollLeft / slideWidth);
        dots.forEach(function (d, i) {
          d.classList.toggle('is-active', i === activeIndex);
        });
      }, 50);
    });

    // Click dot to scroll
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.dataset.index);
        var slide = pdpGallery.querySelectorAll('.pdp__gallery-slide')[idx];
        if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      });
    });
  }

  /* ======================
     HYPE POPUP
     ====================== */
  var popupOverlay = document.getElementById('HypePopup');
  var popupClose = document.getElementById('HypePopupClose');
  var popupForm = document.getElementById('HypePopupForm');

  function shouldShowPopup() {
    var dismissed = localStorage.getItem('hypeheat_popup_dismissed');
    if (!dismissed) return true;
    var dismissedAt = parseInt(dismissed);
    var sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt > sevenDays;
  }

  function showPopup() {
    if (popupOverlay) popupOverlay.classList.add('is-open');
  }

  function hidePopup() {
    if (popupOverlay) popupOverlay.classList.remove('is-open');
    localStorage.setItem('hypeheat_popup_dismissed', Date.now().toString());
  }

  if (shouldShowPopup()) {
    setTimeout(showPopup, 5000);
  }

  if (popupClose) popupClose.addEventListener('click', hidePopup);
  if (popupOverlay) {
    popupOverlay.addEventListener('click', function (e) {
      if (e.target === popupOverlay) hidePopup();
    });
  }

  if (popupForm) {
    popupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hidePopup();
    });
  }

  /* ======================
     SCROLL-REVEAL (IntersectionObserver)
     ====================== */
  /* Collect all elements that need scroll-triggered animation */
  var revealElements = document.querySelectorAll('.reveal, .featured-collection__header');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ======================
     FOMO: PDP VIEWER + CART COUNTERS
     ====================== */
  var fomoViewerEl = document.getElementById('FomoViewerCount');
  var fomoCartEl = document.getElementById('FomoCartCount');

  if (fomoViewerEl) {
    var viewerBase = Math.floor(Math.random() * 15) + 8;
    fomoViewerEl.textContent = viewerBase;

    setInterval(function () {
      var delta = Math.floor(Math.random() * 5) - 2;
      viewerBase = Math.max(3, Math.min(30, viewerBase + delta));
      fomoViewerEl.textContent = viewerBase;
    }, 4000 + Math.random() * 3000);
  }

  if (fomoCartEl) {
    var cartBase = Math.floor(Math.random() * 40) + 20;
    fomoCartEl.textContent = cartBase;

    setInterval(function () {
      var bump = Math.floor(Math.random() * 3);
      if (bump > 0) {
        cartBase = Math.min(120, cartBase + bump);
        fomoCartEl.textContent = cartBase;
      }
    }, 8000 + Math.random() * 7000);
  }

  /* ======================
     RANDOM 5-STAR REVIEWS
     ====================== */
  var reviewsContainer = document.getElementById('ProductReviews');
  var reviewsList = document.getElementById('ReviewsList');
  var reviewTotalCount = document.getElementById('ReviewTotalCount');

  if (reviewsContainer && reviewsList) {
    var reviewCount = parseInt(reviewsContainer.getAttribute('data-review-count')) || 5;

    var reviewNames = [
      'Jordan M.', 'Alex K.', 'Taylor R.', 'Skyler W.', 'Casey J.',
      'Dre P.', 'Remy A.', 'Kai L.', 'Sage T.', 'Morgan B.',
      'Jayden C.', 'Blake N.', 'Quinn F.', 'Avery D.', 'Reese H.',
      'Phoenix S.', 'Riley G.', 'Emery V.', 'Finley Z.', 'Cameron X.'
    ];

    var reviewBodies = [
      'Absolutely fire. The quality is insane for the price. Copped two colorways and both are heat.',
      'Fits perfect. True to size and the material is premium. Everyone asking me where I got it from.',
      'This is the one. Wore it out once and got nothing but compliments. Will definitely be back for the next drop.',
      'Shipping was fast af. Came in 3 days and the packaging is clean. Product quality exceeded expectations.',
      'Had to cop before it sold out. So glad I did — this piece is a staple in my rotation now.',
      'The details on this are crazy. You can tell the quality is there. Worth every penny.',
      'Been following this brand for a minute and they never miss. Another W drop.',
      'My go-to brand now. Everything I\'ve ordered has been consistent quality. This piece especially goes hard.',
      'Got so many compliments first day wearing it. The fit is perfect — not too tight, not too loose.',
      'Snagged this on the last drop. Material feels premium and the design is clean. 10/10 would recommend.',
      'This is real quality. Washed it twice and it still looks brand new. Not like those fast fashion brands.',
      'Bought this as a gift and now I need one for myself. The hype is real.',
      'The colorway on this is crazy good in person. Photos don\'t do it justice. Instant favorite.',
      'Finally a brand that gets it. Clean design, quality materials, fast shipping. Nothing more you need.',
      'Wore this to ComplexCon and people kept stopping me. Absolute heat piece.',
      'This goes hard with everything. Dressed up or casual it just works. Really versatile piece.',
      'Second order from here. Quality is even better than I remembered. Consistent heat every drop.',
      'The attention to detail is what sets this apart. Stitching, fabric, fit — all on point.',
      'Literally my favorite pickup this year. Can\'t stop wearing it.',
      'Slept on the first drop and regretted it. Made sure to grab this one immediately. No regrets.'
    ];

    function shuffleArray(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      return arr;
    }

    function randomDate(daysBack) {
      var now = new Date();
      var past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[past.getMonth()] + ' ' + past.getDate() + ', ' + past.getFullYear();
    }

    var shuffledNames = shuffleArray(reviewNames.slice());
    var shuffledBodies = shuffleArray(reviewBodies.slice());
    var totalReviews = Math.floor(Math.random() * 80) + 40;
    if (reviewTotalCount) reviewTotalCount.textContent = totalReviews;

    var html = '';
    for (var r = 0; r < reviewCount; r++) {
      var name = shuffledNames[r % shuffledNames.length];
      var body = shuffledBodies[r % shuffledBodies.length];
      var initials = name.split(' ').map(function (w) { return w[0]; }).join('');
      var date = randomDate(60);

      html += '<div class="review-card">'
        + '<div class="review-card__header">'
        + '<div class="review-card__avatar">' + initials + '</div>'
        + '<div class="review-card__meta">'
        + '<span class="review-card__name">' + name
        + '<span class="review-card__verified">'
        + '<svg viewBox="0 0 24 24" fill="#4caf50" stroke="none"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
        + 'Verified'
        + '</span></span>'
        + '<div class="review-card__date">' + date + '</div>'
        + '</div></div>'
        + '<div class="review-card__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
        + '<div class="review-card__body">' + body + '</div>'
        + '</div>';
    }
    reviewsList.innerHTML = html;
  }

  /* ======================
     LIVE VIEWER COUNT
     ====================== */
  var viewerCountEl = document.getElementById('LiveViewerCount');
  if (viewerCountEl) {
    var baseCount = Math.floor(Math.random() * 100) + 80;
    viewerCountEl.textContent = baseCount;

    setInterval(function () {
      var delta = Math.floor(Math.random() * 11) - 5;
      baseCount = Math.max(50, Math.min(200, baseCount + delta));
      viewerCountEl.textContent = baseCount;
    }, 3000 + Math.random() * 2000);
  }

  /* ======================
     RECENTLY PURCHASED POPUP
     ====================== */
  var recentEl = document.getElementById('RecentPurchase');
  if (recentEl) {
    var rpNames = ['Max', 'Alex', 'Jordan', 'Sam', 'Riley', 'Casey', 'Morgan', 'Taylor', 'Jamie', 'Drew', 'Kai', 'Avery', 'Quinn', 'Blake', 'Sage'];
    var rpTimes = ['2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', '15 minutes ago', '18 minutes ago', '22 minutes ago', '26 minutes ago', '31 minutes ago'];
    var rpStoreProducts = window.__recentProducts || [];

    function showRecentPurchase() {
      var name = rpNames[Math.floor(Math.random() * rpNames.length)];
      var time = rpTimes[Math.floor(Math.random() * rpTimes.length)];

      var nameEl = document.getElementById('RecentPurchaseName');
      var productEl = document.getElementById('RecentPurchaseProduct');
      var timeEl = document.getElementById('RecentPurchaseTime');
      var imgEl = document.getElementById('RecentPurchaseImg');

      if (rpStoreProducts.length > 0) {
        var p = rpStoreProducts[Math.floor(Math.random() * rpStoreProducts.length)];
        if (productEl) productEl.textContent = p.title;
        if (imgEl) { imgEl.src = p.image; imgEl.alt = p.title; imgEl.style.display = 'block'; }
      } else {
        if (productEl) productEl.textContent = 'New Drop';
        if (imgEl) imgEl.style.display = 'none';
      }

      if (nameEl) nameEl.textContent = name;
      if (timeEl) timeEl.textContent = time;

      recentEl.hidden = false;

      setTimeout(function() {
        recentEl.hidden = true;
      }, 5000);
    }

    // First popup after 8s, then every 20-35s
    setTimeout(function() {
      showRecentPurchase();
      setInterval(function() {
        showRecentPurchase();
      }, 20000 + Math.random() * 15000);
    }, 8000);
  }

  /* ======================
     ANNOUNCEMENT BAR COUNTDOWN
     ====================== */
  var countdownEl = document.getElementById('AnnouncementCountdown');
  if (countdownEl) {
    var targetDate = new Date(countdownEl.dataset.target).getTime();
    var liveText = countdownEl.dataset.liveText || 'THE DROP IS LIVE';

    function updateCountdown() {
      var now = Date.now();
      var diff = targetDate - now;

      if (diff <= 0) {
        countdownEl.textContent = liveText;
        return;
      }

      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);

      var parts = [];
      if (d > 0) parts.push(String(d).padStart(2, '0') + 'd');
      parts.push(String(h).padStart(2, '0') + 'h');
      parts.push(String(m).padStart(2, '0') + 'm');
      parts.push(String(s).padStart(2, '0') + 's');

      countdownEl.textContent = 'DROP IN: ' + parts.join(' ');
    }

    if (!isNaN(targetDate)) {
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
  }

  /* ======================
     LOW STOCK INDICATOR (PDP)
     ====================== */
  var lowStockEl = document.getElementById('PdpLowStock');
  var lowStockCountEl = document.getElementById('PdpLowStockCount');

  if (lowStockEl && productJSON) {
    var lowStockThreshold = parseInt(lowStockEl.dataset.threshold) || 10;

    function updateLowStock(variant) {
      if (!variant || typeof variant.inventory_quantity === 'undefined' || !variant.inventory_management) {
        lowStockEl.style.display = 'none';
        return;
      }
      var qty = variant.inventory_quantity;
      if (qty > 0 && qty <= lowStockThreshold) {
        lowStockCountEl.textContent = qty;
        lowStockEl.style.display = '';
      } else {
        lowStockEl.style.display = 'none';
      }
    }

    // Initial check
    var initVariant = productJSON.variants.find(function (v) {
      return v.id === parseInt(document.getElementById('ProductVariantSelect')?.value);
    });
    if (initVariant) updateLowStock(initVariant);

    // Re-check on variant change (hook into existing option button clicks)
    document.querySelectorAll('.pdp__option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(function () {
          var selVal = document.getElementById('ProductVariantSelect')?.value;
          var v = productJSON.variants.find(function (vr) { return vr.id === parseInt(selVal); });
          if (v) updateLowStock(v);
        }, 50);
      });
    });
  }

  /* ======================
     STICKY ADD-TO-CART BAR (mobile)
     ====================== */
  var stickyBar = document.getElementById('PdpStickyBar');
  var stickyBtn = document.getElementById('PdpStickyBtn');
  var stickyPrice = document.getElementById('PdpStickyPrice');
  var addBtnWrapObs = document.getElementById('PdpAddBtnWrap');

  if (stickyBar && addBtnWrapObs && 'IntersectionObserver' in window) {
    var stickyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    stickyObserver.observe(addBtnWrapObs);

    // Sticky bar button triggers add-to-cart
    if (stickyBtn) {
      stickyBtn.addEventListener('click', function () {
        var variantSelect = document.getElementById('ProductVariantSelect');
        var qtyInput = document.getElementById('ProductQuantity');
        if (!variantSelect) return;
        var vid = parseInt(variantSelect.value);
        var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        if (vid) addToCart(vid, qty);
      });
    }

    // Keep sticky price in sync with variant changes
    if (stickyPrice) {
      document.querySelectorAll('.pdp__option-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setTimeout(function () {
            var priceText = document.getElementById('ProductCurrentPrice');
            if (priceText) stickyPrice.textContent = priceText.textContent;
          }, 50);
        });
      });
    }
  }

  /* ======================
     CART RESERVATION TIMER
     ====================== */
  var cartTimerEl = document.getElementById('CartTimer');
  var cartTimerDisplay = document.getElementById('CartTimerDisplay');

  if (cartTimerEl && cartTimerDisplay) {
    var CART_TIMER_KEY = 'hypeheat_cart_timer_end';
    var CART_TIMER_DURATION = 15 * 60 * 1000; // 15 minutes
    var cartTimerInterval = null;

    function startCartTimer() {
      var endTime = sessionStorage.getItem(CART_TIMER_KEY);
      if (!endTime) {
        endTime = Date.now() + CART_TIMER_DURATION;
        sessionStorage.setItem(CART_TIMER_KEY, endTime);
      }
      endTime = parseInt(endTime);

      function tick() {
        var remaining = endTime - Date.now();
        if (remaining <= 0) {
          cartTimerDisplay.textContent = '0:00';
          cartTimerEl.classList.add('cart-drawer__timer--expired');
          cartTimerEl.querySelector('span').innerHTML = 'Your cart has expired \u2014 items may sell out!';
          clearInterval(cartTimerInterval);
          return;
        }
        var mins = Math.floor(remaining / 60000);
        var secs = Math.floor((remaining % 60000) / 1000);
        cartTimerDisplay.textContent = mins + ':' + String(secs).padStart(2, '0');
      }

      tick();
      cartTimerInterval = setInterval(tick, 1000);
      cartTimerEl.style.display = '';
    }

    // Start timer when cart has items (on drawer open)
    var origOpenCartDrawer = openCartDrawer;
    openCartDrawer = function () {
      origOpenCartDrawer();
      // Only show timer if cart has items
      var itemsContainer = document.getElementById('CartDrawerItems');
      var isEmpty = itemsContainer && itemsContainer.querySelector('.cart-drawer__empty');
      if (!isEmpty) {
        startCartTimer();
      } else {
        cartTimerEl.style.display = 'none';
        sessionStorage.removeItem(CART_TIMER_KEY);
      }
    };

    // Reset timer when cart is emptied
    var origRenderCart = renderCartDrawer;
    renderCartDrawer = function (cart) {
      origRenderCart(cart);
      if (cart.item_count === 0) {
        cartTimerEl.style.display = 'none';
        sessionStorage.removeItem(CART_TIMER_KEY);
        if (cartTimerInterval) clearInterval(cartTimerInterval);
      } else if (cartTimerEl.style.display === 'none') {
        startCartTimer();
      }
    };
  }

  /* ======================
     EXIT-INTENT POPUP
     ====================== */
  var exitPopup = document.getElementById('ExitPopup');
  var exitPopupClose = document.getElementById('ExitPopupClose');
  var exitPopupCode = document.getElementById('ExitPopupCode');
  var exitPopupHint = document.getElementById('ExitPopupHint');

  if (exitPopup) {
    var EXIT_KEY = 'hypeheat_exit_shown';

    function showExitPopup() {
      if (sessionStorage.getItem(EXIT_KEY)) return;
      // Don't show if newsletter popup is currently visible
      if (document.querySelector('.hype-popup-overlay.is-open')) return;
      exitPopup.classList.add('is-open');
      exitPopup.setAttribute('aria-hidden', 'false');
      sessionStorage.setItem(EXIT_KEY, '1');
    }

    function hideExitPopup() {
      exitPopup.classList.remove('is-open');
      exitPopup.setAttribute('aria-hidden', 'true');
    }

    // Desktop: mouseleave on document
    document.documentElement.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) showExitPopup();
    });

    if (exitPopupClose) exitPopupClose.addEventListener('click', hideExitPopup);
    if (exitPopup) {
      exitPopup.addEventListener('click', function (e) {
        if (e.target === exitPopup) hideExitPopup();
      });
    }

    // Copy discount code to clipboard
    if (exitPopupCode) {
      exitPopupCode.addEventListener('click', function () {
        var code = this.textContent.trim();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(function () {
            if (exitPopupHint) exitPopupHint.textContent = 'Copied!';
          });
        }
      });
    }
  }

  /* ======================
     CART PAGE — Qty buttons & Remove
     ====================== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cart-qty]');
    if (!btn) return;
    var line = parseInt(btn.getAttribute('data-line'), 10);
    var dir = btn.getAttribute('data-cart-qty');
    if (!line) return;

    // Find sibling input (for cart page)
    var item = btn.closest('.cart-page__item');
    if (!item) return;
    var input = item.querySelector('.cart-page__qty-input');
    var current = input ? parseInt(input.value, 10) : 1;
    var newQty;

    if (dir === 'remove') {
      newQty = 0;
    } else {
      newQty = current + parseInt(dir, 10);
      if (newQty < 0) newQty = 0;
    }

    // Update via AJAX
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: newQty })
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        window.location.reload();
      });
  });

})();
