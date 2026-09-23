// Brazil country code + the DDD and number supplied by the owner.
export const whatsappNumber = '554896270524';
export const whatsappMessage = 'Olá! Quero conversar sobre um projeto com a Monte Criativo.';

export function whatsappUrl(number, message = whatsappMessage) {
  const digits = String(number).replace(/\D/g, '');
  if (!/^[1-9]\d{9,14}$/.test(digits)) return null;
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
}
