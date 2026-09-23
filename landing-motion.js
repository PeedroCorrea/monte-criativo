// Decorative motion belongs only to the landing. Scrolling remains native.
export function setupLandingMotion(landing) {
  if (!landing) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let visible = true;
  let frame = 0;
  let pointer = { x: 0, y: 0 };

  function paint() {
    frame = 0;
    landing.style.setProperty('--pointer-x', pointer.x.toFixed(3));
    landing.style.setProperty('--pointer-y', pointer.y.toFixed(3));
  }
  function requestPaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function reset() {
    pointer = { x: 0, y: 0 };
    requestPaint();
  }
  function syncVisibility() {
    landing.classList.toggle('is-idle', !visible || document.hidden);
    if (!visible || document.hidden || reduced.matches) reset();
  }

  landing.addEventListener('pointermove', event => {
    if (!visible || reduced.matches || !finePointer.matches) return;
    const rect = landing.getBoundingClientRect();
    pointer = {
      x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)),
    };
    requestPaint();
  }, { passive: true });
  landing.addEventListener('pointerleave', reset, { passive: true });
  reduced.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
  document.addEventListener('visibilitychange', syncVisibility);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncVisibility();
    }, { threshold: 0 });
    observer.observe(landing);
  }
  syncVisibility();
}
