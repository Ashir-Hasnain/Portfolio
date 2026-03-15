
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-open');
    navToggle.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        navToggle.classList.remove('open');
    });
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        if (entry.target.dataset.once !== 'false') {
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15,
});

document.querySelectorAll('.reveal').forEach((el) => {
    const delay = parseFloat(el.dataset.delay);
    if (!Number.isNaN(delay)) {
        el.style.transitionDelay = `${delay}s`;
    }
    revealObserver.observe(el);
});


// Contact form submission (Formspree)
const contactForm = document.getElementById('contact-form');
const formStatus = contactForm?.querySelector('.form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!formStatus) return;

        formStatus.textContent = 'Sending…';
        formStatus.style.opacity = '1';
        formStatus.classList.remove('success', 'error');

        const formData = new FormData(contactForm);
        const action = contactForm.action;

        if (action.includes('YOUR_FORMSPREE_ID')) {
            formStatus.textContent = 'Please update the contact form action with your Formspree form ID to enable email delivery.';
            formStatus.classList.remove('success');
            formStatus.classList.add('error');
            return;
        }

        const recaptchaResponse = window.grecaptcha ? window.grecaptcha.getResponse() : '';
        if (window.grecaptcha && !recaptchaResponse) {
            formStatus.textContent = 'Please complete the reCAPTCHA challenge before submitting.';
            formStatus.classList.remove('success');
            formStatus.classList.add('error');
            return;
        } 

        if (recaptchaResponse) {
            formData.append('g-recaptcha-response', recaptchaResponse);
        }

        try {
            const response = await fetch(action, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                formStatus.textContent = 'Thanks! Your message was sent.';
                formStatus.classList.add('success');
                contactForm.reset();
                if (window.grecaptcha) {
                    window.grecaptcha.reset();
                }
            } else {
                const data = await response.json();
                formStatus.textContent = data?.error || 'Oops — something went wrong. Please try again.';
                formStatus.classList.add('error');
            }
        } catch (error) {
            formStatus.textContent = 'Unable to send message right now. Please try again later.';
        }

        setTimeout(() => {
            formStatus.style.opacity = '0';
        }, 5000);
    });
}