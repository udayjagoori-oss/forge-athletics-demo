(() => {
  'use strict';

  // Replace with a real WhatsApp number in international format, digits only.
  // Example format: 919876543210. Do not include +, spaces, or dashes.
  const WHATSAPP_NUMBER = '';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const body = document.body;
  const toast = document.querySelector('#toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 4200);
  }

  function closeMenu() {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    navigation.classList.remove('open');
    body.classList.remove('menu-open');
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
      navigation.classList.toggle('open', willOpen);
      body.classList.toggle('menu-open', willOpen);
    });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) closeMenu();
    });
  }

  // WhatsApp stays as a safe placeholder until a real business number is set.
  document.querySelectorAll('.js-whatsapp').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      if (WHATSAPP_NUMBER && /^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
        const message = encodeURIComponent('Hi, I would like to enquire about training at FORGE ATHLETICS.');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
      } else {
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
        showToast('Demo notice: connect a real WhatsApp number in script.js before launch.');
      }
    });
  });

  // Pricing CTA buttons preselect the relevant enquiry type.
  document.querySelectorAll('[data-plan]').forEach(link => {
    link.addEventListener('click', () => {
      const interest = document.querySelector('#interest');
      if (interest) interest.value = 'Gym membership';
      const message = document.querySelector('#message');
      if (message) message.value = `I'm interested in the ${link.dataset.plan} demo plan. Please share more information.`;
    });
  });

  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  const validators = {
    name: value => value.trim().length >= 2 ? '' : 'Please enter at least 2 characters.',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.',
    message: value => value.trim().length >= 10 ? '' : 'Please enter at least 10 characters.'
  };

  if (form) {
    Object.keys(validators).forEach(fieldName => {
      const field = form.elements.namedItem(fieldName);
      const error = document.querySelector(`#${fieldName}-error`);
      if (!field || !error) return;
      field.addEventListener('blur', () => {
        error.textContent = validators[fieldName](field.value);
        field.setAttribute('aria-invalid', String(Boolean(error.textContent)));
      });
      field.addEventListener('input', () => {
        if (error.textContent) {
          error.textContent = validators[fieldName](field.value);
          field.setAttribute('aria-invalid', String(Boolean(error.textContent)));
        }
      });
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      let valid = true;
      Object.keys(validators).forEach(fieldName => {
        const field = form.elements.namedItem(fieldName);
        const error = document.querySelector(`#${fieldName}-error`);
        if (!field || !error) return;
        error.textContent = validators[fieldName](field.value);
        field.setAttribute('aria-invalid', String(Boolean(error.textContent)));
        if (error.textContent) valid = false;
      });

      if (!valid) {
        status.textContent = 'Please check the highlighted fields and try again.';
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus();
        return;
      }

      // The demo form deliberately does not send or store personal data.
      status.textContent = 'Your fields look good. This demo form is not connected to an inbox, so no message was sent.';
      showToast('Form validation passed — no message was sent or stored.');
    });
  }

  // Gentle reveal animation with a no-JS / reduced-motion friendly fallback.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
