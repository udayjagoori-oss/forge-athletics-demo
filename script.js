
(() => {
  'use strict';

  // WhatsApp number in international format, digits only.
  const WHATSAPP_NUMBER = '7678635065';

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
    toastTimer = window.setTimeout(
      () => toast.classList.remove('show'),
      4200
    );
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
      const willOpen =
        menuButton.getAttribute('aria-expanded') !== 'true';

      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute(
        'aria-label',
        willOpen ? 'Close navigation menu' : 'Open navigation menu'
      );
      navigation.classList.toggle('open', willOpen);
      body.classList.toggle('menu-open', willOpen);
    });

    navigation.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) closeMenu();
    });
  }

  // WhatsApp button
  document.querySelectorAll('.js-whatsapp').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();

      if (WHATSAPP_NUMBER && /^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
        const message = encodeURIComponent(
          'Hi, I would like to enquire about training at FORGE ATHLETICS.'
        );

        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
          '_blank',
          'noopener,noreferrer'
        );
      } else {
        document.querySelector('#contact')?.scrollIntoView({
          behavior: 'smooth'
        });
        showToast('Please configure the WhatsApp number first.');
      }
    });
  });

  // Pricing buttons preselect the enquiry details.
  document.querySelectorAll('[data-plan]').forEach(link => {
    link.addEventListener('click', () => {
      const interest = document.querySelector('#interest');
      if (interest) interest.value = 'Gym membership';

      const message = document.querySelector('#message');
      if (message) {
        message.value =
          `I'm interested in the ${link.dataset.plan} demo plan. Please share more information.`;
      }
    });
  });

  // Contact form and validation
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');

  const validators = {
    name: value =>
      value.trim().length >= 2
        ? ''
        : 'Please enter at least 2 characters.',

    email: value =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
        ? ''
        : 'Please enter a valid email address.',

    message: value =>
      value.trim().length >= 10
        ? ''
        : 'Please enter at least 10 characters.'
  };

  if (form) {
    Object.keys(validators).forEach(fieldName => {
      const field = form.elements.namedItem(fieldName);
      const error = document.querySelector(`#${fieldName}-error`);

      if (!field || !error) return;

      field.addEventListener('blur', () => {
        error.textContent = validators[fieldName](field.value);
        field.setAttribute(
          'aria-invalid',
          String(Boolean(error.textContent))
        );
      });

      field.addEventListener('input', () => {
        if (error.textContent) {
          error.textContent = validators[fieldName](field.value);
          field.setAttribute(
            'aria-invalid',
            String(Boolean(error.textContent))
          );
        }
      });
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();

      let valid = true;

      Object.keys(validators).forEach(fieldName => {
        const field = form.elements.namedItem(fieldName);
        const error = document.querySelector(`#${fieldName}-error`);

        if (!field || !error) return;

        error.textContent = validators[fieldName](field.value);
        field.setAttribute(
          'aria-invalid',
          String(Boolean(error.textContent))
        );

        if (error.textContent) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent =
            'Please check the highlighted fields and try again.';
        }

        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      const submitButton = form.querySelector(
        'button[type="submit"]'
      );

      const originalButtonHTML = submitButton?.innerHTML;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'SENDING...';
      }

      if (status) status.textContent = 'Sending your enquiry...';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          let errorMessage =
            'We could not send your enquiry. Please try again.';

          try {
            const result = await response.json();

            if (result.errors?.length) {
              errorMessage = result.errors
                .map(error => error.message)
                .join(' ');
            }
          } catch {
            // Keep the default error message.
          }

          throw new Error(errorMessage);
        }

        if (status) {
          status.textContent =
            'Thanks! Your enquiry has been sent successfully.';
        }

        showToast('Enquiry sent successfully!');
        form.reset();

        Object.keys(validators).forEach(fieldName => {
          const error = document.querySelector(`#${fieldName}-error`);
          const field = form.elements.namedItem(fieldName);

          if (error) error.textContent = '';
          if (field) field.removeAttribute('aria-invalid');
        });
      } catch (error) {
        if (status) {
          status.textContent =
            error.message ||
            'Something went wrong. Please try again.';
        }

        showToast('Your enquiry could not be sent. Please try again.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHTML;
        }
      }
    });
  }

  // Reveal animations
  const revealItems = document.querySelectorAll('.reveal');

  if (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
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

  // Footer year
  const year = document.querySelector('#year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
