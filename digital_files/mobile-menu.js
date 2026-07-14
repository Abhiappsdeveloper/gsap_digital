/**
 * Mobile Menu Functionality - Ukonnect Staffing
 * Handles mobile menu toggle, animations, and interactions
 */

(function initMobileMenu() {
  console.log('🔧 Initializing mobile menu...');

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMenu);
  } else {
    setupMenu();
  }

  function setupMenu() {
    // Get menu elements
    const burgerMenu = document.querySelector('[aria-label="Toggle menu"]') ||
                      document.querySelector('.iconify.i-hugeicons\\:menu-09') ||
                      document.querySelector('[aria-label="Toggle menu"] span');

    const mobileNav = document.querySelector('.mobile-nav');
    const navItems = document.querySelectorAll('.mobile-nav__item a');
    const closeBtn = document.querySelector('.mobile-nav__close');

    if (!burgerMenu && !mobileNav) {
      console.warn('Mobile menu elements not found');
      return;
    }

    console.log('✅ Mobile menu elements found');

    // Find the actual clickable element
    let menuButton = burgerMenu;
    if (burgerMenu && burgerMenu.closest('[data-v-6b592c0d]')) {
      menuButton = burgerMenu.closest('[data-v-6b592c0d]').querySelector('span');
    }

    // Toggle menu function
    function toggleMenu(e) {
      e?.stopPropagation?.();
      if (mobileNav) {
        mobileNav.classList.toggle('open');
        mobileNav.classList.toggle('active');

        // Animate button
        if (menuButton) {
          menuButton.classList.toggle('menu-open');
        }

        // Prevent body scroll when menu open
        if (mobileNav.classList.contains('open')) {
          document.body.style.overflow = 'hidden';
          console.log('📱 Mobile menu opened');
        } else {
          document.body.style.overflow = '';
          console.log('📱 Mobile menu closed');
        }
      }
    }

    // Close menu function
    function closeMenu() {
      if (mobileNav && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
        if (menuButton) {
          menuButton.classList.remove('menu-open');
        }
        console.log('📱 Mobile menu closed');
      }
    }

    // Add event listeners
    if (menuButton) {
      menuButton.addEventListener('click', toggleMenu);
      // Also try to attach to parent span if it exists
      const parent = menuButton.parentElement;
      if (parent && parent.tagName === 'SPAN') {
        parent.addEventListener('click', toggleMenu);
      }
    }

    // Close on item click
    navItems.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    // Close on overlay click
    const overlay = document.querySelector('.mobile-nav__overlay');
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Add CSS for menu styling
    const style = document.createElement('style');
    style.textContent = `
      .mobile-nav {
        transition: all 0.3s ease !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      .mobile-nav.open,
      .mobile-nav.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      .mobile-nav__panel {
        animation: slideIn 0.3s ease forwards !important;
      }

      .mobile-nav.open .mobile-nav__panel {
        animation: slideIn 0.3s ease forwards !important;
      }

      @keyframes slideIn {
        from {
          transform: translateX(-100%) !important;
        }
        to {
          transform: translateX(0) !important;
        }
      }

      .menu-btn.menu-open .menu-btn__line:nth-child(1) {
        transform: rotate(45deg) translate(10px, 10px) !important;
      }

      .menu-btn.menu-open .menu-btn__line:nth-child(2) {
        opacity: 0 !important;
      }

      .menu-btn.menu-open .menu-btn__line:nth-child(3) {
        transform: rotate(-45deg) translate(8px, -7px) !important;
      }
    `;
    document.head.appendChild(style);

    console.log('✅ Mobile menu initialized successfully');
  }
})();
