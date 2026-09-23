import { whatsappNumber, whatsappUrl } from './contact-config.js';

export function setupContactForm(form, feedback, {
  number = whatsappNumber,
  open = url => window.open(url, '_blank', 'noopener,noreferrer'),
} = {}) {
  const input = form.elements.namedItem('message');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const message = input.value.trim();
    const destination = message ? whatsappUrl(number, message) : whatsappUrl(number);
    if (!destination) {
      feedback.hidden = false;
      return;
    }
    feedback.hidden = true;
    open(destination);
  });
  input.addEventListener('input', () => { feedback.hidden = true; });
  button.disabled = false;
}
