/**
 * Global Interactions & Animations - Ukonnect Staffing
 * Handles text animations, scroll effects, and smooth transitions
 */

(function initInteractions() {
  console.log('🎬 Initializing interactions and animations...');

  // Wait for GSAP to load
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded, retrying...');
    setTimeout(initInteractions, 500);
    return;
  }

  // TEXT ANIMATIONS
  function animateHeroText() {
    const heroTexts = [
      '#text1', // "We Connect"
      '#text2', // "Digital"
      '#text3', // "Products"
      '#that',  // "that"
      '#scale', // "scale,"
      '#adapt', // "adapt and"
      '#perform' // "perform"
    ];

    heroTexts.forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (element) {
        // Initial state
        gsap.set(element, {
          opacity: 0,
          y: 30
        });

        // Animate on load
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power2.out'
        });

        // Optional: Add hover effect
        element.addEventListener('mouseenter', function() {
          gsap.to(element, {
            scale: 1.05,
            duration: 0.3,
            overwrite: 'auto'
          });
        });

        element.addEventListener('mouseleave', function() {
          gsap.to(element, {
            scale: 1,
            duration: 0.3,
            overwrite: 'auto'
          });
        });
      }
    });

    console.log('✅ Hero text animations set up');
  }

  // MARQUEE SCROLLING ANIMATION
  function enhanceMarquee() {
    const marqueeElements = document.querySelectorAll('.animate-marquee');

    marqueeElements.forEach((marquee, index) => {
      // Get the animation direction
      const direction = marquee.style.animationDirection;
      const duration = 50; // seconds

      // Create smooth continuous animation
      const rect = marquee.getBoundingClientRect();
      const itemWidth = rect.width / 2; // Approximate width of duplicated set

      gsap.fromTo(
        marquee,
        {
          x: 0
        },
        {
          x: direction === 'reverse' ? itemWidth : -itemWidth,
          duration: duration,
          repeat: -1, // Infinite loop
          ease: 'none',
          overwrite: 'auto'
        }
      );
    });

    console.log('✅ Marquee animations enhanced');
  }

  // SMOOTH SCROLL ENHANCEMENT
  function enhanceSmoothScroll() {
    // Check if Lenis is loaded
    if (typeof Lenis !== 'undefined') {
      try {
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        console.log('✅ Smooth scroll (Lenis) initialized');
      } catch (e) {
        console.warn('Lenis initialization failed:', e);
      }
    }
  }

  // BUTTON INTERACTIONS
  function setupButtonInteractions() {
    const buttons = document.querySelectorAll('.pwd-button, .pill-btn');

    buttons.forEach(button => {
      // Hover effect
      button.addEventListener('mouseenter', function() {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          overwrite: 'auto'
        });
      });

      button.addEventListener('mouseleave', function() {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          overwrite: 'auto'
        });
      });

      // Click effect
      button.addEventListener('click', function() {
        gsap.to(button, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          overwrite: 'auto'
        });
      });
    });

    console.log('✅ Button interactions set up');
  }

  // SCROLL REVEAL ANIMATIONS
  function setupScrollReveal() {
    const revealElements = document.querySelectorAll('section, .feature-item, .faq-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    revealElements.forEach((el) => {
      gsap.set(el, { opacity: 0, y: 30 });
      observer.observe(el);
    });

    console.log('✅ Scroll reveal animations set up');
  }

  // PARALLAX EFFECT (Optional)
  function setupParallax() {
    const heroSection = document.getElementById('hero-webgl');
    const centerGlow = document.getElementById('center-light-glow');

    if (heroSection && centerGlow) {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        gsap.to(centerGlow, {
          x: x,
          y: y,
          duration: 0.3,
          overwrite: 'auto'
        });
      });

      console.log('✅ Parallax effect set up');
    }
  }

  // FAQ ACCORDION INTERACTIONS
  function setupFAQInteractions() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
      const header = item.querySelector('.faq-item__header');
      const content = item.querySelector('.faq-item__content');

      if (header && content) {
        header.addEventListener('click', function() {
          const isOpen = item.classList.contains('open') ||
                        item.classList.contains('faq-item--open');

          if (isOpen) {
            // Close
            gsap.to(content, {
              maxHeight: 0,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.inOut',
              overflow: 'hidden'
            });
            item.classList.remove('open');
            item.classList.remove('faq-item--open');
          } else {
            // Open
            gsap.to(content, {
              maxHeight: content.scrollHeight + 20,
              opacity: 1,
              duration: 0.3,
              ease: 'power2.inOut',
              overflow: 'hidden'
            });
            item.classList.add('open');
            item.classList.add('faq-item--open');
          }
        });
      }
    });

    console.log('✅ FAQ interactions set up');
  }

  // LOGO WALL HOVER EFFECTS
  function setupLogoWallEffects() {
    const logos = document.querySelectorAll('[alt*="Logo image of"]');

    logos.forEach((logo) => {
      logo.addEventListener('mouseenter', function() {
        gsap.to(logo, {
          filter: 'saturate(1) brightness(1.2)',
          duration: 0.3,
          overwrite: 'auto'
        });
      });

      logo.addEventListener('mouseleave', function() {
        gsap.to(logo, {
          filter: 'saturate(0.5) brightness(1)',
          duration: 0.3,
          overwrite: 'auto'
        });
      });
    });

    console.log('✅ Logo wall effects set up');
  }

  // INITIALIZE ALL ON DOM READY
  function initializeAll() {
    console.log('🚀 Starting full initialization...');

    // Add small delay to ensure all elements are rendered
    setTimeout(() => {
      animateHeroText();
      enhanceMarquee();
      enhanceSmoothScroll();
      setupButtonInteractions();
      setupScrollReveal();
      setupParallax();
      setupFAQInteractions();
      setupLogoWallEffects();

      console.log('✅✅✅ ALL ANIMATIONS & INTERACTIONS INITIALIZED ✅✅✅');
    }, 100);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
  } else {
    initializeAll();
  }

  // Also run after window load to catch late-loaded elements
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔄 Running post-load animation check...');
      // Re-setup some animations in case elements were added later
      setupLogoWallEffects();
    }, 500);
  });
})();
