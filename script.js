/**
 * Krishna Vilas Homestay — script.js
 * Advanced JS: Preloader, Navbar, Hero Slideshow, Scroll Reveal,
 * Lightbox Gallery, Contact Form, Back-to-Top, Custom Cursor
 */

'use strict';

/* ════════════════════════════════════════════
   PRELOADER
════════════════════════════════════════════ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 500);
  });

  // Safety: remove after 3s even if load never fires
  setTimeout(() => preloader.classList.add('hidden'), 3000);
})();


/* ════════════════════════════════════════════
   STICKY NAVBAR
════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  // Scroll behaviour
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav-link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section highlight
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
})();


/* ════════════════════════════════════════════
   HERO SLIDESHOW + PARALLAX
════════════════════════════════════════════ */
(function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  if (!slides.length) return;

  let current = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
  }

  const timer = setInterval(() => goTo(current + 1), 5000);

  // Subtle parallax on hero bg
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        slides.forEach(s => {
          s.style.transform = s.classList.contains('active')
            ? `scale(1) translateY(${y * 0.2}px)`
            : 'scale(1.05)';
        });
      }
    }, { passive: true });
  }
})();


/* ════════════════════════════════════════════
   SCROLL REVEAL (Intersection Observer)
════════════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('revealed'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════
   GALLERY + LIGHTBOX
════════════════════════════════════════════ */
(function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbCounter = document.getElementById('lightboxCounter');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  if (!grid) return;

  // All 29 gallery photos
  const photos = Array.from({ length: 29 }, (_, i) => ({
    src: `assets/images/photo_${String(i + 1).padStart(2, '0')}.jpg`,
    alt: `Krishna Vilas Homestay - Photo ${i + 1}`
  }));

  let visibleCount = 12;
  let currentIndex = 0;

  function buildItems(items) {
    items.forEach((photo, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item reveal-up';
      item.dataset.index = i;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', photo.alt);

      const img = document.createElement('img');
      img.src = '';
      img.dataset.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'gallery-item-overlay';
      overlay.innerHTML = '<i class="fas fa-magnifying-glass-plus"></i>';

      item.appendChild(img);
      item.appendChild(overlay);
      grid.appendChild(item);

      // Lazy load
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.src = e.target.dataset.src;
            imgObserver.unobserve(e.target);
          }
        });
      }, { rootMargin: '100px' });
      imgObserver.observe(img);

      // Reveal observer
      const revObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('revealed'), (i % 4) * 80);
            revObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });
      revObserver.observe(item);

      // Click
      item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openLightbox(parseInt(item.dataset.index));
      });
    });
  }

  buildItems(photos.slice(0, visibleCount));
  if (visibleCount >= photos.length && loadMoreBtn) {
    loadMoreBtn.style.display = 'none';
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const next = photos.slice(visibleCount, visibleCount + 12);
      next.forEach((p, offset) => {
        const globalIdx = visibleCount + offset;
        const item = document.querySelector(`[data-index="${globalIdx}"]`);
        if (!item) {
          // build only if not yet in DOM
        }
      });
      buildItems(photos.slice(visibleCount, visibleCount + 12));
      visibleCount += 12;
      if (visibleCount >= photos.length) loadMoreBtn.style.display = 'none';
    });
  }

  // Lightbox functions
  function openLightbox(index) {
    currentIndex = index;
    lbImg.src = photos[index].src;
    lbImg.alt = photos[index].alt;
    lbCounter.textContent = `${index + 1} / ${photos.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = photos[currentIndex].src;
      lbCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
      lbImg.style.opacity = '1';
    }, 180);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % photos.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = photos[currentIndex].src;
      lbCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
      lbImg.style.opacity = '1';
    }, 180);
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', prevImage);
  if (lbNext) lbNext.addEventListener('click', nextImage);

  // Close on backdrop
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
  });

  // Img fade transition
  if (lbImg) lbImg.style.transition = 'opacity 0.18s ease';
})();


/* ════════════════════════════════════════════
   CONTACT FORM (WhatsApp redirect)
════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }
  function clearErrors() {
    ['nameError', 'phoneError', 'messageError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    let valid = true;
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const dates = document.getElementById('dates').value.trim();
    const message = messageInput.value.trim();

    if (!name) { showError('nameError', 'Please enter your name.'); valid = false; }
    if (!phone || !/^[0-9+\s\-]{7,15}$/.test(phone)) {
      showError('phoneError', 'Please enter a valid phone number.');
      valid = false;
    }
    if (!message) { showError('messageError', 'Please enter a message.'); valid = false; }

    if (!valid) return;

    const text = encodeURIComponent(
      `Hello, I would like to enquire about a stay at Krishna Vilas Homestay.\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      (dates ? `Preferred Dates: ${dates}\n` : '') +
      `Message: ${message}`
    );

    window.open(`https://wa.me/918075870149?text=${text}`, '_blank', 'noopener');
    form.reset();
  });
})();


/* ════════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ════════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING
════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('navbar').offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ════════════════════════════════════════════
   CUSTOM CURSOR LOGIC
════════════════════════════════════════════ */
(function initCursor() {
  const cursor = document.querySelector('.cursor');
  const cursorinner = document.querySelector('.cursor2');
  
  // Make sure it applies the hover effect to links, buttons, and gallery items
  const interactiveElements = document.querySelectorAll('a, button, .gallery-item, input, textarea');

  // Prevent JS errors if running on mobile where we hide the cursor via CSS
  if (!cursor || !cursorinner) return;

  document.addEventListener('mousemove', function(e) {
    cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    cursorinner.style.left = e.clientX + 'px';
    cursorinner.style.top = e.clientY + 'px';
  });

  document.addEventListener('mousedown', function() {
    cursor.classList.add('click');
    cursorinner.classList.add('cursorinnerhover');
  });

  document.addEventListener('mouseup', function() {
    cursor.classList.remove('click');
    cursorinner.classList.remove('cursorinnerhover');
  });

  interactiveElements.forEach(item => {
    item.addEventListener('mouseover', () => {
      cursor.classList.add('hover');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
    });
  });
})();